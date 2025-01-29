/*
  Warnings:

  - You are about to drop the column `description` on the `TimeEntry` table. All the data in the column will be lost.
  - You are about to drop the column `notionEntryId` on the `TimeEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN "description",
DROP COLUMN "notionEntryId",
ADD COLUMN     "descriptions" TEXT[],
ADD COLUMN     "notionEntryIds" TEXT[];
