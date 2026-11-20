-- CreateTable
CREATE TABLE IF NOT EXISTS "NutritionKnowledge" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceTitle" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "provenance" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "embedding" vector(384) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "NutritionKnowledge_contentHash_key" ON "NutritionKnowledge"("contentHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "NutritionKnowledge_topic_idx" ON "NutritionKnowledge"("topic");
