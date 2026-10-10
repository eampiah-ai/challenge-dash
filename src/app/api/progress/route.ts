import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  getMondayOfWeek,
  getMonthString,
  getBiWeeklyPeriodStart,
  isSunday,
  isLastDayOfMonth,
} from "@/lib/dates";

export const dynamic = "force-dynamic";

function toInt(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

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
    const periodStart = getBiWeeklyPeriodStart(date, timezone, new Date(`${participant.challenge.startDate}T00:00:00`));
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

    const challenge = participant.challenge;
    const body = await request.json();
    const { date, daily, weekly, biWeekly, monthly, sundayReset } = body;

    if (!date || typeof date !== "string") {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    if (date < challenge.startDate || date > challenge.endDate) {
      return NextResponse.json({ error: "Date is outside the challenge window" }, { status: 400 });
    }

    const timezone = participant.timezone;
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
          savingsAmount: toInt(weekly.savingsAmount),
          projectHobbyMinutes: toInt(weekly.projectHobbyMinutes),
        },
        update: {
          savingsAmount: toInt(weekly.savingsAmount),
          projectHobbyMinutes: toInt(weekly.projectHobbyMinutes),
        },
      });
    }

    if (biWeekly && typeof biWeekly === "object") {
      const periodStart = getBiWeeklyPeriodStart(date, timezone, new Date(`${challenge.startDate}T00:00:00`));
      results.biWeekly = await prisma.biWeeklyLog.upsert({
        where: {
          participantId_periodStart: { participantId: participant.id, periodStart },
        },
        create: {
          participantId: participant.id,
          periodStart,
          alcoholCount: toInt(biWeekly.alcoholCount),
          sweetsCount: toInt(biWeekly.sweetsCount),
        },
        update: {
          alcoholCount: toInt(biWeekly.alcoholCount),
          sweetsCount: toInt(biWeekly.sweetsCount),
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
