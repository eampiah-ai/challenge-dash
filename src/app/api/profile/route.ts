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

    const participant = await prisma.participant.findUnique({
      where: { id: session.participantId },
      include: {
        dailyLogs: true,
        weeklyLogs: true,
        biWeeklyLogs: true,
        monthlyLogs: true,
        sundayResetLogs: true,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const timezone = participant.timezone;
    const today = formatLocalDate(new Date(), timezone);

    const dailyMap = new Map<string, DailyLog>(participant.dailyLogs.map((log) => [log.date, log]));
    const weeklyMap = new Map(participant.weeklyLogs.map((log) => [log.weekStart, log]));
    const biWeeklyMap = new Map(participant.biWeeklyLogs.map((log) => [log.periodStart, log]));
    const monthlyMap = new Map(participant.monthlyLogs.map((log) => [log.month, log]));
    const sundayMap = new Map(participant.sundayResetLogs.map((log) => [log.sundayDate, log]));

    const currentStreak = computeCurrentStreak(participant.dailyLogs, timezone);

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

    const sortedDaily = [...participant.dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
    const lastActivityDate = sortedDaily[0]?.date || null;

    return NextResponse.json({
      participant: {
        id: participant.id,
        displayName: participant.displayName,
        timezone,
        currentStreak,
        lastActivityDate,
        todayDailyCompleted,
        todayDailyTotal: 7,
        last7Days,
        currentWeekly: weeklyMap.get(currentWeekStart) || null,
        currentBiWeekly: biWeeklyMap.get(currentPeriodStart) || null,
        currentMonthly: monthlyMap.get(currentMonth) || null,
        lastSundayReset: lastSunday ? sundayMap.get(lastSunday) || null : null,
        challenge: {
          savingsGoal: challenge.savingsGoal,
          alcoholAllowance: challenge.alcoholAllowance,
          sweetsAllowance: challenge.sweetsAllowance,
        },
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
