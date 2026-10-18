-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "coupon_redemptions" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "orders_customerEmail_idx" ON "orders"("customerEmail");


-- Backfill the customer snapshot for orders placed by registered users
UPDATE "orders" AS o
SET "customerEmail" = u."email",
    "customerName" = u."name"
FROM "users" AS u
WHERE o."userId" = u."id"
  AND o."customerEmail" IS NULL;
