/*
  Warnings:

  - You are about to drop the column `createdById` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CustomColumn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Milestone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MilestoneTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateMilestone` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectValue" DROP CONSTRAINT "ProjectValue_columnId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectValue" DROP CONSTRAINT "ProjectValue_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateMilestone" DROP CONSTRAINT "TemplateMilestone_templateId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_createdById_fkey";

-- DropIndex
DROP INDEX "User_createdById_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdById",
ADD COLUMN     "notionUserId" TEXT;

-- DropTable
DROP TABLE "CustomColumn";

-- DropTable
DROP TABLE "Milestone";

-- DropTable
DROP TABLE "MilestoneTemplate";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "ProjectValue";

-- DropTable
DROP TABLE "TemplateMilestone";

-- DropEnum
DROP TYPE "ProjectStatus";

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hoursWorked" DOUBLE PRECISION NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "notionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotionProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotionProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotionTask" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotionTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimeEntry_userId_idx" ON "TimeEntry"("userId");

-- CreateIndex
CREATE INDEX "TimeEntry_date_idx" ON "TimeEntry"("date");

-- CreateIndex
CREATE INDEX "TimeEntry_projectId_idx" ON "TimeEntry"("projectId");

-- CreateIndex
CREATE INDEX "NotionProject_name_idx" ON "NotionProject"("name");

-- CreateIndex
CREATE INDEX "NotionTask_projectId_idx" ON "NotionTask"("projectId");

-- CreateIndex
CREATE INDEX "NotionTask_name_idx" ON "NotionTask"("name");

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
