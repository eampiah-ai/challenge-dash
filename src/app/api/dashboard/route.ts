import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  formatLocalDate,
  getMondayOfWeek,
  getBiWeeklyPeriodStart,
  getMonthString,
  isSunday,
} from "@/lib/dates";

export const dynamic = "force-dynamic";

interface DailyLog {
  date: string;
  steps7000: boolean;
  workout45: boolean;
  prayerMeditation10: boolean;
  water80oz: boolean;
  eatAtHome: boolean;
  learnRead15: boolean;
  podcastEpisode: boolean;
}

function allDailyComplete(log: DailyLog) {
  return (
    log.steps7000 &&
    log.workout45 &&
    log.prayerMeditation10 &&
    log.water80oz &&
    log.eatAtHome &&
    log.learnRead15 &&
    log.podcastEpisode
  );
}

function computeCurrentStreak(dailyLogs: DailyLog[], timezone: string) {
  const completedDates = new Set(
    dailyLogs.filter(allDailyComplete).map((log) => log.date)
  );

  if (completedDates.size === 0) return 0;

  const now = new Date();
  const today = formatLocalDate(now, timezone);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatLocalDate(yesterdayDate, timezone);

  const checkDate: string | null = completedDates.has(today)
    ? today
    : completedDates.has(yesterday)
      ? yesterday
      : null;

  if (!checkDate) return 0;

  let streak = 0;
  const baseOffset = completedDates.has(today) ? 0 : 1;
  while (true) {
    const prev = new Date(now);
    prev.setDate(prev.getDate() - baseOffset - streak);
    const prevDate = formatLocalDate(prev, timezone);
    if (!completedDates.has(prevDate)) break;
    streak++;
  }

  return streak;
}

function getLast7Days(timezone: string) {
  const days: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(formatLocalDate(d, timezone));
  }
  return days;
}

interface PeriodStatsInput {
  dailyMap: Map<string, DailyLog>;
  weeklyMap: Map<string, { savings200: boolean; projectHobbyMinutes: number }>;
  monthlyMap: Map<string, { fastCompleted: boolean }>;
  sundayMap: Map<string, { planWorkouts: boolean; planMeals: boolean; planSavings: boolean; setTop3Goals: boolean; checkProgressReset: boolean }>;
}

function getPeriodStats(
  startDateStr: string,
  endDateStr: string,
  timezone: string,
  maps: PeriodStatsInput
) {
  const periodKeys: {
    date: string;
    weekStart: string;
    periodStart: string;
    month: string;
    isSunday: boolean;
  }[] = [];
  const today = new Date();
  const todayStr = formatLocalDate(today, timezone);
  const limit = endDateStr < todayStr ? endDateStr : todayStr;

  const start = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${limit}T00:00:00`);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = formatLocalDate(d, timezone);
    periodKeys.push({
      date,
      weekStart: getMondayOfWeek(date, timezone),
      periodStart: getBiWeeklyPeriodStart(date, timezone, new Date(`${startDateStr}T00:00:00`)),
      month: getMonthString(date, timezone),
      isSunday: isSunday(date, timezone),
    });
  }

  const relevantKeys = periodKeys.filter((k) => k.date <= todayStr);

  const totalDays = relevantKeys.length;
  const completedDays = relevantKeys.filter((k) => {
    const log = maps.dailyMap.get(k.date);
    return log ? allDailyComplete(log) : false;
  }).length;

  const uniqueWeeks = Array.from(new Set(relevantKeys.map((k) => k.weekStart)));
  const completedWeeks = uniqueWeeks.filter((weekStart) => {
    const log = maps.weeklyMap.get(weekStart);
    return log && log.savings200 && log.projectHobbyMinutes >= 120;
  }).length;

  const uniqueMonths = Array.from(new Set(relevantKeys.map((k) => k.month)));
  const completedMonths = uniqueMonths.filter((month) => {
    const log = maps.monthlyMap.get(month);
    return log && log.fastCompleted;
  }).length;

  const uniqueSundays = Array.from(new Set(relevantKeys.filter((k) => k.isSunday).map((k) => k.date)));
  const completedSundays = uniqueSundays.filter((date) => {
    const log = maps.sundayMap.get(date);
    return log && log.planWorkouts && log.planMeals && log.planSavings && log.setTop3Goals && log.checkProgressReset;
  }).length;

  const habitKeys: (keyof DailyLog)[] = [
    "steps7000",
    "workout45",
    "prayerMeditation10",
    "water80oz",
    "eatAtHome",
    "learnRead15",
    "podcastEpisode",
  ];

  const habitCompletion: Record<string, number> = {};
  for (const key of habitKeys) {
    const completed = relevantKeys.filter((k) => {
      const log = maps.dailyMap.get(k.date);
      return log ? log[key] : false;
    }).length;
    habitCompletion[key] = totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0;
  }

  const dailyHabitAverage = totalDays > 0
    ? Math.round(
        habitKeys.reduce((sum, key) => sum + habitCompletion[key], 0) / habitKeys.length
      )
    : 0;

  return {
    totalDays,
    completedDays,
    uniqueWeeks,
    completedWeeks,
    uniqueMonths,
    completedMonths,
    uniqueSundays,
    completedSundays,
    habitCompletion,
    dailyHabitAverage,
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session.participantId || !session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challenge = await prisma.challenge.findFirst();
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 500 });
    }

    const participants = await prisma.participant.findMany({
      where: { challengeId: challenge.id },
      include: {
        dailyLogs: true,
        weeklyLogs: true,
        biWeeklyLogs: true,
        monthlyLogs: true,
        sundayResetLogs: true,
      },
    });

    const data = participants.map((p) => {
      const timezone = p.timezone;
      const today = formatLocalDate(new Date(), timezone);

      const dailyMap = new Map<string, DailyLog>(p.dailyLogs.map((log) => [log.date, log]));
      const weeklyMap = new Map(p.weeklyLogs.map((log) => [log.weekStart, log]));
      const biWeeklyMap = new Map(p.biWeeklyLogs.map((log) => [log.periodStart, log]));
      const monthlyMap = new Map(p.monthlyLogs.map((log) => [log.month, log]));
      const sundayMap = new Map(p.sundayResetLogs.map((log) => [log.sundayDate, log]));

      const stats = getPeriodStats(
        challenge.startDate,
        challenge.endDate,
        timezone,
        {
          dailyMap,
          weeklyMap,
          monthlyMap,
          sundayMap,
        }
      );

      const dailyCompletion = stats.dailyHabitAverage;
      const weeklyCompletion = stats.uniqueWeeks.length > 0 ? Math.round((stats.completedWeeks / stats.uniqueWeeks.length) * 100) : 0;
      const monthlyCompletion = stats.uniqueMonths.length > 0 ? Math.round((stats.completedMonths / stats.uniqueMonths.length) * 100) : 0;
      const sundayResetCompletion = stats.uniqueSundays.length > 0 ? Math.round((stats.completedSundays / stats.uniqueSundays.length) * 100) : 0;

      const overallCompletion = Math.round(
        (dailyCompletion + weeklyCompletion + monthlyCompletion + sundayResetCompletion) / 4
      );

      const currentStreak = computeCurrentStreak(p.dailyLogs, timezone);

      const last7Days = getLast7Days(timezone).map((date) => ({
        date,
        log: dailyMap.get(date) || null,
      }));

      const todayLog = dailyMap.get(today);
      const todayDailyCompleted = todayLog
        ? [
            todayLog.steps7000,
            todayLog.workout45,
            todayLog.prayerMeditation10,
            todayLog.water80oz,
            todayLog.eatAtHome,
            todayLog.learnRead15,
            todayLog.podcastEpisode,
          ].filter(Boolean).length
        : 0;

      const currentWeekStart = getMondayOfWeek(today, timezone);
      const currentPeriodStart = getBiWeeklyPeriodStart(today, timezone, new Date(`${challenge.startDate}T00:00:00`));
      const currentMonth = getMonthString(today, timezone);
      const lastSunday = last7Days.filter((d) => isSunday(d.date, timezone)).pop()?.date || null;

      const sortedDaily = [...p.dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
      const lastActivityDate = sortedDaily[0]?.date || null;

      return {
        id: p.id,
        displayName: p.displayName,
        timezone,
        overallCompletion,
        breakdown: {
          daily: dailyCompletion,
          weekly: weeklyCompletion,
          monthly: monthlyCompletion,
          sundayReset: sundayResetCompletion,
        },
        currentStreak,
        lastActivityDate,
        todayDailyCompleted,
        todayDailyTotal: 7,
        last7Days,
        currentWeekly: weeklyMap.get(currentWeekStart) || null,
        currentBiWeekly: biWeeklyMap.get(currentPeriodStart) || null,
        currentMonthly: monthlyMap.get(currentMonth) || null,
        lastSundayReset: lastSunday ? sundayMap.get(lastSunday) || null : null,
      };
    });

    return NextResponse.json({ participants: data });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
