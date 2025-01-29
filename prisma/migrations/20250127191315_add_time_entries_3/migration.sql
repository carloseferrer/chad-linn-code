/*
  Warnings:

  - The `hoursWorked` column on the `TimeEntry` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN "hoursWorked",
ADD COLUMN     "hoursWorked" DOUBLE PRECISION[];
