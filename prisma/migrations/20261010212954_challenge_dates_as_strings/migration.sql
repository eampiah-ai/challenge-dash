-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
ALTER COLUMN "startDate" SET DATA TYPE TEXT,
ALTER COLUMN "endDate" SET DATA TYPE TEXT;
