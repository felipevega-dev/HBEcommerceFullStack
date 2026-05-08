-- CreateEnum
CREATE TYPE "InstagramPostStatus" AS ENUM ('DRAFT', 'PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "instagram_automation_settings" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'America/Santiago',
    "dailyHour" INTEGER NOT NULL DEFAULT 10,
    "dailyMinute" INTEGER NOT NULL DEFAULT 0,
    "sourceType" TEXT NOT NULL DEFAULT 'PRODUCTS',
    "captionTemplate" TEXT NOT NULL,
    "fallbackHashtags" TEXT NOT NULL DEFAULT '',
    "maxDailyPosts" INTEGER NOT NULL DEFAULT 1,
    "requireManualApproval" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instagram_automation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_posts" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "status" "InstagramPostStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceType" TEXT NOT NULL DEFAULT 'PRODUCTS',
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceDescription" TEXT,
    "captionDraft" TEXT,
    "finalCaption" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "selectedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "instagramCreationId" TEXT,
    "instagramMediaId" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instagram_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_post_attempts" (
    "id" TEXT NOT NULL,
    "instagramPostId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instagram_post_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "instagram_posts_status_scheduledFor_idx" ON "instagram_posts"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "instagram_posts_productId_idx" ON "instagram_posts"("productId");

-- CreateIndex
CREATE INDEX "instagram_posts_createdAt_idx" ON "instagram_posts"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "instagram_post_attempts_instagramPostId_createdAt_idx" ON "instagram_post_attempts"("instagramPostId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "instagram_posts" ADD CONSTRAINT "instagram_posts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instagram_post_attempts" ADD CONSTRAINT "instagram_post_attempts_instagramPostId_fkey" FOREIGN KEY ("instagramPostId") REFERENCES "instagram_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default settings row
INSERT INTO "instagram_automation_settings" (
    "id",
    "captionTemplate",
    "updatedAt"
) VALUES (
    'instagram-automation-default',
    'Descubre {{product_name}} en Harry''s Boutique. {{product_description}} #HarrysBoutique #Moda',
    CURRENT_TIMESTAMP
);
