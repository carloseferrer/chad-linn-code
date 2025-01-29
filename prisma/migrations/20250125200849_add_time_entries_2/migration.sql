/*
  Warnings:

  - You are about to drop the column `projectId` on the `TimeEntry` table. All the data in the column will be lost.
  - You are about to drop the column `projectName` on the `TimeEntry` table. All the data in the column will be lost.
  - You are about to drop the column `taskId` on the `TimeEntry` table. All the data in the column will be lost.
  - You are about to drop the column `taskName` on the `TimeEntry` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "TimeEntry_projectId_idx";

-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN "projectId",
DROP COLUMN "projectName",
DROP COLUMN "taskId",
DROP COLUMN "taskName",
ADD COLUMN     "projectIds" TEXT[],
ADD COLUMN     "projectNames" TEXT[],
ADD COLUMN     "taskIds" TEXT[],
ADD COLUMN     "taskNames" TEXT[];
