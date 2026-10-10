-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "challengeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "steps7000" BOOLEAN NOT NULL DEFAULT false,
    "workout45" BOOLEAN NOT NULL DEFAULT false,
    "prayerMeditation10" BOOLEAN NOT NULL DEFAULT false,
    "water80oz" BOOLEAN NOT NULL DEFAULT false,
    "eatAtHome" BOOLEAN NOT NULL DEFAULT false,
    "learnRead15" BOOLEAN NOT NULL DEFAULT false,
    "podcastEpisode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyLog" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "savings200" BOOLEAN NOT NULL DEFAULT false,
    "projectHobbyMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiWeeklyLog" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "periodStart" TEXT NOT NULL,
    "alcoholUsed" BOOLEAN NOT NULL DEFAULT false,
    "sweetsUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiWeeklyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyLog" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "fastCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SundayResetLog" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "sundayDate" TEXT NOT NULL,
    "planWorkouts" BOOLEAN NOT NULL DEFAULT false,
    "planMeals" BOOLEAN NOT NULL DEFAULT false,
    "planSavings" BOOLEAN NOT NULL DEFAULT false,
    "setTop3Goals" BOOLEAN NOT NULL DEFAULT false,
    "checkProgressReset" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SundayResetLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_displayName_challengeId_key" ON "Participant"("displayName", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_participantId_date_key" ON "DailyLog"("participantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyLog_participantId_weekStart_key" ON "WeeklyLog"("participantId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "BiWeeklyLog_participantId_periodStart_key" ON "BiWeeklyLog"("participantId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyLog_participantId_month_key" ON "MonthlyLog"("participantId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "SundayResetLog_participantId_sundayDate_key" ON "SundayResetLog"("participantId", "sundayDate");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyLog" ADD CONSTRAINT "WeeklyLog_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiWeeklyLog" ADD CONSTRAINT "BiWeeklyLog_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyLog" ADD CONSTRAINT "MonthlyLog_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SundayResetLog" ADD CONSTRAINT "SundayResetLog_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
