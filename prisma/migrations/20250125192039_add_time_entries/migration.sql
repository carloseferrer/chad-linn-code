/*
  Warnings:

  - You are about to drop the column `notionId` on the `TimeEntry` table. All the data in the column will be lost.
  - You are about to drop the `NotionProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotionTask` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `notionEntryId` to the `TimeEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectName` to the `TimeEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskName` to the `TimeEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN "notionId",
ADD COLUMN     "notionEntryId" TEXT NOT NULL,
ADD COLUMN     "projectName" TEXT NOT NULL,
ADD COLUMN     "taskName" TEXT NOT NULL;

-- DropTable
DROP TABLE "NotionProject";

-- DropTable
DROP TABLE "NotionTask";
