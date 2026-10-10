import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatLocalDate, getMondayOfWeek, getBiWeeklyPeriodStart, getMonthString, isSunday } from "@/lib/dates";

export const dynamic = "force-dynamic";

function allDailyComplete(log: { steps7000: boolean; workout45: boolean; prayerMeditation10: boolean; water80oz: boolean; eatAtHome: boolean; learnRead15: boolean; podcastEpisode: boolean }) {
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

function computeCurrentStreak(dailyLogs: { date: string; steps7000: boolean; workout45: boolean; prayerMeditation10: boolean; water80oz: boolean; eatAtHome: boolean; learnRead15: boolean; podcastEpisode: boolean }[], timezone: string) {
  const completedDates = new Set(
    dailyLogs.filter(allDailyComplete).map((log) => log.date)
  );

  if (completedDates.size === 0) return 0;

  const today = formatLocalDate(new Date(), timezone);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatLocalDate(yesterdayDate, timezone);

  let checkDate = completedDates.has(today) ? today : completedDates.has(yesterday) ? yesterday : null;
  if (!checkDate) return 0;

  let streak = 0;
  while (completedDates.has(checkDate)) {
    streak++;
    const prev = new Date();
    prev.setDate(prev.getDate() - streak - (completedDates.has(today) ? 0 : 1));
    checkDate = formatLocalDate(prev, timezone);
  }

  return streak;
}

function getPeriodKeys(startDate: Date, endDate: Date, timezone: string) {
  const keys: { date: string; weekStart: string; periodStart: string; month: string; isSunday: boolean }[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  const limit = end < today ? end : today;

  for (let d = new Date(start); d <= limit; d.setDate(d.getDate() + 1)) {
    const date = formatLocalDate(d, timezone);
    keys.push({
      date,
      weekStart: getMondayOfWeek(date, timezone),
      periodStart: getBiWeeklyPeriodStart(date, timezone, startDate),
      month: getMonthString(date, timezone),
      isSunday: isSunday(date, timezone),
    });
  }

  return keys;
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

    const todayByParticipant = new Map<string, string>();

    const data = participants.map((p) => {
      const timezone = p.timezone;
      const today = formatLocalDate(new Date(), timezone);
      todayByParticipant.set(p.id, today);

      const dailyMap = new Map(p.dailyLogs.map((log) => [log.date, log]));
      const weeklyMap = new Map(p.weeklyLogs.map((log) => [log.weekStart, log]));
      const biWeeklyMap = new Map(p.biWeeklyLogs.map((log) => [log.periodStart, log]));
      const monthlyMap = new Map(p.monthlyLogs.map((log) => [log.month, log]));
      const sundayMap = new Map(p.sundayResetLogs.map((log) => [log.sundayDate, log]));

      const periodKeys = getPeriodKeys(challenge.startDate, challenge.endDate, timezone);
      const relevantKeys = periodKeys.filter((k) => k.date <= today);

      const totalDays = relevantKeys.length;
      const completedDays = relevantKeys.filter((k) => {
        const log = dailyMap.get(k.date);
        return log ? allDailyComplete(log) : false;
      }).length;

      const uniqueWeeks = Array.from(new Set(relevantKeys.map((k) => k.weekStart)));
      const completedWeeks = uniqueWeeks.filter((weekStart) => {
        const log = weeklyMap.get(weekStart);
        return log && log.savings200 && log.projectHobbyMinutes >= 120;
      }).length;

      const uniquePeriods = Array.from(new Set(relevantKeys.map((k) => k.periodStart)));
      const loggedPeriods = uniquePeriods.filter((periodStart) => biWeeklyMap.has(periodStart)).length;

      const uniqueMonths = Array.from(new Set(relevantKeys.map((k) => k.month)));
      const completedMonths = uniqueMonths.filter((month) => {
        const log = monthlyMap.get(month);
        return log && log.fastCompleted;
      }).length;

      const uniqueSundays = Array.from(new Set(relevantKeys.filter((k) => k.isSunday).map((k) => k.date)));
      const completedSundays = uniqueSundays.filter((date) => {
        const log = sundayMap.get(date);
        return log && log.planWorkouts && log.planMeals && log.planSavings && log.setTop3Goals && log.checkProgressReset;
      }).length;

      const dailyCompletion = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
      const weeklyCompletion = uniqueWeeks.length > 0 ? Math.round((completedWeeks / uniqueWeeks.length) * 100) : 0;
      const biWeeklyCompletion = uniquePeriods.length > 0 ? Math.round((loggedPeriods / uniquePeriods.length) * 100) : 0;
      const monthlyCompletion = uniqueMonths.length > 0 ? Math.round((completedMonths / uniqueMonths.length) * 100) : 0;
      const sundayResetCompletion = uniqueSundays.length > 0 ? Math.round((completedSundays / uniqueSundays.length) * 100) : 0;

      const overallCompletion = Math.round(
        (dailyCompletion + weeklyCompletion + monthlyCompletion + sundayResetCompletion) / 4
      );

      const currentStreak = computeCurrentStreak(p.dailyLogs, timezone);

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
          biWeekly: biWeeklyCompletion,
          monthly: monthlyCompletion,
          sundayReset: sundayResetCompletion,
        },
        currentStreak,
        lastActivityDate,
      };
    });

    return NextResponse.json({ participants: data });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
