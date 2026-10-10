import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName, password, timezone, timezoneAction } = body;

    if (!displayName || typeof displayName !== "string") {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const challenge = await prisma.challenge.findFirst();
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 500 });
    }

    const valid = await bcrypt.compare(password, challenge.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const detectedTimezone = typeof timezone === "string" && timezone ? timezone : "America/Chicago";

    let participant = await prisma.participant.findUnique({
      where: { displayName_challengeId: { displayName: displayName.trim(), challengeId: challenge.id } },
    });

    if (!participant) {
      participant = await prisma.participant.create({
        data: {
          displayName: displayName.trim(),
          timezone: detectedTimezone,
          challengeId: challenge.id,
        },
      });
    } else if (participant.timezone !== detectedTimezone && timezoneAction === "update") {
      participant = await prisma.participant.update({
        where: { id: participant.id },
        data: { timezone: detectedTimezone },
      });
    } else if (participant.timezone !== detectedTimezone && !timezoneAction) {
      return NextResponse.json({
        needsTimezoneChoice: true,
        storedTimezone: participant.timezone,
        detectedTimezone,
      });
    }

    const session = await getSession();
    session.participantId = participant.id;
    session.participantName = participant.displayName;
    session.timezone = participant.timezone;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true, participant: { id: participant.id, displayName: participant.displayName, timezone: participant.timezone } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
