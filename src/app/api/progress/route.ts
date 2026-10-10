import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  formatLocalDate,
  getMondayOfWeek,
  getMonthString,
  getBiWeeklyPeriodStart,
  isSunday,
  isLastDayOfMonth,
} from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.participantId || !session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const participant = await prisma.participant.findUnique({
      where: { id: session.participantId },
      include: { challenge: true },
    });

    if (!participant || !participant.challenge) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const timezone = participant.timezone;
    const weekStart = getMondayOfWeek(date, timezone);
    const periodStart = getBiWeeklyPeriodStart(date, timezone, participant.challenge.startDate);
    const month = getMonthString(date, timezone);

    const [daily, weekly, biWeekly, monthly, sundayReset] = await Promise.all([
      prisma.dailyLog.findUnique({
        where: { participantId_date: { participantId: participant.id, date } },
      }),
      prisma.weeklyLog.findUnique({
        where: { participantId_weekStart: { participantId: participant.id, weekStart } },
      }),
      prisma.biWeeklyLog.findUnique({
        where: { participantId_periodStart: { participantId: participant.id, periodStart } },
      }),
      prisma.monthlyLog.findUnique({
        where: { participantId_month: { participantId: participant.id, month } },
      }),
      prisma.sundayResetLog.findUnique({
        where: { participantId_sundayDate: { participantId: participant.id, sundayDate: date } },
      }),
    ]);

    return NextResponse.json({ daily, weekly, biWeekly, monthly, sundayReset });
  } catch (error) {
    console.error("Progress GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.participantId || !session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const participant = await prisma.participant.findUnique({
      where: { id: session.participantId },
      include: { challenge: true },
    });

    if (!participant || !participant.challenge) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const body = await request.json();
    const { date, daily, weekly, biWeekly, monthly, sundayReset } = body;

    if (!date || typeof date !== "string") {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const timezone = participant.timezone;
    const challengeStart = formatLocalDate(participant.challenge.startDate, timezone);
    const challengeEnd = formatLocalDate(participant.challenge.endDate, timezone);

    if (date < challengeStart || date > challengeEnd) {
      return NextResponse.json({ error: "Date is outside the challenge window" }, { status: 400 });
    }

    const results: Record<string, unknown> = {};

    if (daily && typeof daily === "object") {
      results.daily = await prisma.dailyLog.upsert({
        where: {
          participantId_date: { participantId: participant.id, date },
        },
        create: {
          participantId: participant.id,
          date,
          steps7000: !!daily.steps7000,
          workout45: !!daily.workout45,
          prayerMeditation10: !!daily.prayerMeditation10,
          water80oz: !!daily.water80oz,
          eatAtHome: !!daily.eatAtHome,
          learnRead15: !!daily.learnRead15,
          podcastEpisode: !!daily.podcastEpisode,
        },
        update: {
          steps7000: !!daily.steps7000,
          workout45: !!daily.workout45,
          prayerMeditation10: !!daily.prayerMeditation10,
          water80oz: !!daily.water80oz,
          eatAtHome: !!daily.eatAtHome,
          learnRead15: !!daily.learnRead15,
          podcastEpisode: !!daily.podcastEpisode,
        },
      });
    }

    if (weekly && typeof weekly === "object") {
      const weekStart = getMondayOfWeek(date, timezone);
      results.weekly = await prisma.weeklyLog.upsert({
        where: {
          participantId_weekStart: { participantId: participant.id, weekStart },
        },
        create: {
          participantId: participant.id,
          weekStart,
          savings200: !!weekly.savings200,
          projectHobbyMinutes: Number(weekly.projectHobbyMinutes) || 0,
        },
        update: {
          savings200: !!weekly.savings200,
          projectHobbyMinutes: Number(weekly.projectHobbyMinutes) || 0,
        },
      });
    }

    if (biWeekly && typeof biWeekly === "object") {
      const periodStart = getBiWeeklyPeriodStart(date, timezone, participant.challenge.startDate);
      results.biWeekly = await prisma.biWeeklyLog.upsert({
        where: {
          participantId_periodStart: { participantId: participant.id, periodStart },
        },
        create: {
          participantId: participant.id,
          periodStart,
          alcoholUsed: !!biWeekly.alcoholUsed,
          sweetsUsed: !!biWeekly.sweetsUsed,
        },
        update: {
          alcoholUsed: !!biWeekly.alcoholUsed,
          sweetsUsed: !!biWeekly.sweetsUsed,
        },
      });
    }

    if (monthly && typeof monthly === "object") {
      if (!isLastDayOfMonth(date, timezone)) {
        return NextResponse.json(
          { error: "Monthly fast can only be logged on the last day of the month" },
          { status: 400 }
        );
      }
      const month = getMonthString(date, timezone);
      results.monthly = await prisma.monthlyLog.upsert({
        where: {
          participantId_month: { participantId: participant.id, month },
        },
        create: {
          participantId: participant.id,
          month,
          fastCompleted: !!monthly.fastCompleted,
        },
        update: {
          fastCompleted: !!monthly.fastCompleted,
        },
      });
    }

    if (sundayReset && typeof sundayReset === "object") {
      if (!isSunday(date, timezone)) {
        return NextResponse.json(
          { error: "Sunday reset can only be logged on a Sunday" },
          { status: 400 }
        );
      }
      results.sundayReset = await prisma.sundayResetLog.upsert({
        where: {
          participantId_sundayDate: { participantId: participant.id, sundayDate: date },
        },
        create: {
          participantId: participant.id,
          sundayDate: date,
          planWorkouts: !!sundayReset.planWorkouts,
          planMeals: !!sundayReset.planMeals,
          planSavings: !!sundayReset.planSavings,
          setTop3Goals: !!sundayReset.setTop3Goals,
          checkProgressReset: !!sundayReset.checkProgressReset,
        },
        update: {
          planWorkouts: !!sundayReset.planWorkouts,
          planMeals: !!sundayReset.planMeals,
          planSavings: !!sundayReset.planSavings,
          setTop3Goals: !!sundayReset.setTop3Goals,
          checkProgressReset: !!sundayReset.checkProgressReset,
        },
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
