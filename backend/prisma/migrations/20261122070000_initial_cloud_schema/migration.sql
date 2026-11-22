-- CalTrack first-cloud-deployment baseline.
-- Generated from prisma/schema.prisma for a brand-new PostgreSQL 16 database.

CREATE SCHEMA IF NOT EXISTS "public";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TYPE "Goal" AS ENUM ('LOSE', 'MAINTAIN', 'GAIN');
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE');
CREATE TYPE "MealSlot" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS');
CREATE TYPE "ModerationStatus" AS ENUM ('SUBMITTED', 'VALIDATION_PASSED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "targetWeightKg" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "goal" "Goal" NOT NULL DEFAULT 'LOSE',
    "activityLevel" "ActivityLevel" NOT NULL DEFAULT 'SEDENTARY',
    "targetCalories" INTEGER,
    "targetProteinG" INTEGER,
    "targetCarbsG" INTEGER,
    "targetFatG" INTEGER,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Colombo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'LKR',
    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "brandId" TEXT,
    "regionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "caloriesKcal" DOUBLE PRECISION NOT NULL,
    "proteinG" DOUBLE PRECISION NOT NULL,
    "carbohydratesG" DOUBLE PRECISION NOT NULL,
    "fatG" DOUBLE PRECISION NOT NULL,
    "saturatedFatG" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "fiberG" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "sodiumMg" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "waterG" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FoodAlias" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "aliasName" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL DEFAULT 'en',
    CONSTRAINT "FoodAlias_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UnitConversion" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "gramEquivalent" DOUBLE PRECISION NOT NULL,
    "isStandard" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UnitConversion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FoodEmbedding" (
    "foodId" TEXT NOT NULL,
    "embedding" vector(384) NOT NULL,
    CONSTRAINT "FoodEmbedding_pkey" PRIMARY KEY ("foodId")
);

CREATE TABLE "MealLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MealLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MealLogEntry" (
    "id" TEXT NOT NULL,
    "mealLogId" TEXT NOT NULL,
    "foodId" TEXT,
    "meal" "MealSlot" NOT NULL,
    "servingQuantity" DOUBLE PRECISION NOT NULL,
    "unitName" TEXT NOT NULL,
    "loggedWeightGrams" DOUBLE PRECISION NOT NULL,
    "loggedCaloriesKcal" DOUBLE PRECISION NOT NULL,
    "loggedProteinG" DOUBLE PRECISION NOT NULL,
    "loggedCarbohydratesG" DOUBLE PRECISION NOT NULL,
    "loggedFatG" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealLogEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModerationQueue" (
    "id" TEXT NOT NULL,
    "stagingFoodId" TEXT NOT NULL,
    "moderatorId" TEXT,
    "status" "ModerationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "rejectionReason" TEXT,
    "automatedLogs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ModerationQueue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeightEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeightEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NutritionKnowledge" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NutritionKnowledge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Brand_name_regionId_key" ON "Brand"("name", "regionId");
CREATE INDEX "FoodAlias_aliasName_idx" ON "FoodAlias"("aliasName");
CREATE UNIQUE INDEX "FoodAlias_foodId_aliasName_key" ON "FoodAlias"("foodId", "aliasName");
CREATE UNIQUE INDEX "UnitConversion_foodId_unitName_key" ON "UnitConversion"("foodId", "unitName");
CREATE UNIQUE INDEX "MealLog_userId_date_key" ON "MealLog"("userId", "date");
CREATE INDEX "WeightEntry_userId_recordedAt_idx" ON "WeightEntry"("userId", "recordedAt");
CREATE UNIQUE INDEX "NutritionKnowledge_contentHash_key" ON "NutritionKnowledge"("contentHash");
CREATE INDEX "NutritionKnowledge_topic_idx" ON "NutritionKnowledge"("topic");

ALTER TABLE "Brand" ADD CONSTRAINT "Brand_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Food" ADD CONSTRAINT "Food_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Food" ADD CONSTRAINT "Food_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FoodAlias" ADD CONSTRAINT "FoodAlias_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FoodEmbedding" ADD CONSTRAINT "FoodEmbedding_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MealLogEntry" ADD CONSTRAINT "MealLogEntry_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MealLogEntry" ADD CONSTRAINT "MealLogEntry_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WeightEntry" ADD CONSTRAINT "WeightEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
