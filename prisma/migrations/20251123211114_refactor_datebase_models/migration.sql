/*
  Warnings:

  - You are about to drop the column `createdAt` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `complaint` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `complaint` table. All the data in the column will be lost.
  - You are about to drop the `topic` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `problemId` to the `comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `impact` to the `complaint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recurrence` to the `complaint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcategoryId` to the `complaint` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Recurrence" AS ENUM ('ALWAYS', 'SOMETIMES', 'FIRST');

-- CreateEnum
CREATE TYPE "Impact" AS ENUM ('CITY', 'NEIGHBORHOOD', 'STREET');

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_topicId_fkey";

-- DropForeignKey
ALTER TABLE "complaint" DROP CONSTRAINT "complaint_topicId_fkey";

-- DropForeignKey
ALTER TABLE "topic" DROP CONSTRAINT "topic_categoryId_fkey";

-- AlterTable
ALTER TABLE "category" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "comment" DROP COLUMN "topicId",
ADD COLUMN     "problemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "complaint" DROP COLUMN "text",
DROP COLUMN "topicId",
ADD COLUMN     "impact" "Impact" NOT NULL,
ADD COLUMN     "recurrence" "Recurrence" NOT NULL,
ADD COLUMN     "subcategoryId" TEXT NOT NULL;

-- DropTable
DROP TABLE "topic";

-- CreateTable
CREATE TABLE "subcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "subcategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subcategory" ADD CONSTRAINT "subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
