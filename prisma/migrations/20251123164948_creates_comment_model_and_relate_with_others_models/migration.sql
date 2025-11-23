-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
