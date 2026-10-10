/*
  Warnings:

  - You are about to drop the column `alcoholUsed` on the `BiWeeklyLog` table. All the data in the column will be lost.
  - You are about to drop the column `sweetsUsed` on the `BiWeeklyLog` table. All the data in the column will be lost.
  - You are about to drop the column `savings200` on the `WeeklyLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BiWeeklyLog" DROP COLUMN "alcoholUsed",
DROP COLUMN "sweetsUsed",
ADD COLUMN     "alcoholCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sweetsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "alcoholAllowance" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "savingsGoal" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN     "sweetsAllowance" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "WeeklyLog" DROP COLUMN "savings200",
ADD COLUMN     "savingsAmount" INTEGER NOT NULL DEFAULT 0;
