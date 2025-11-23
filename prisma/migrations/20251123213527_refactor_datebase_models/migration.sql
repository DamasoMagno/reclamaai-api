/*
  Warnings:

  - You are about to drop the `complaint` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('STATED', 'IN_PROGRESS', 'FINISHED');

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_problemId_fkey";

-- DropForeignKey
ALTER TABLE "complaint" DROP CONSTRAINT "complaint_subcategoryId_fkey";

-- DropForeignKey
ALTER TABLE "complaint" DROP CONSTRAINT "complaint_userId_fkey";

-- DropTable
DROP TABLE "complaint";

-- CreateTable
CREATE TABLE "problem" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "recurrence" "Recurrence" NOT NULL,
    "impact" "Impact" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL,
    "subcategoryId" TEXT NOT NULL,

    CONSTRAINT "problem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "problem" ADD CONSTRAINT "problem_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
