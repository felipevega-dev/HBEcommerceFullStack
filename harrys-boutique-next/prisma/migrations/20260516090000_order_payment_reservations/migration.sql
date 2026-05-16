CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

ALTER TABLE "orders"
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "paymentProvider" TEXT,
ADD COLUMN "paymentProviderId" TEXT,
ADD COLUMN "stockReservedAt" TIMESTAMP(3),
ADD COLUMN "stockReservationExpiresAt" TIMESTAMP(3),
ADD COLUMN "stockReleasedAt" TIMESTAMP(3),
ADD COLUMN "courier" TEXT,
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "shippedAt" TIMESTAMP(3),
ADD COLUMN "deliveredAt" TIMESTAMP(3),
ADD COLUMN "cancelReason" TEXT,
ADD COLUMN "refundReason" TEXT;

UPDATE "orders"
SET
  "paymentStatus" = CASE
    WHEN "payment" = true THEN 'PAID'::"PaymentStatus"
    ELSE 'PENDING'::"PaymentStatus"
  END,
  "paymentProvider" = CASE
    WHEN "paymentMethod" = 'mercadopago' THEN 'mercadopago'
    WHEN "paymentMethod" = 'COD' THEN 'cash_on_delivery'
    ELSE "paymentMethod"
  END;

CREATE TABLE "order_status_history" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "previousStatus" "OrderStatus",
  "status" "OrderStatus" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coupon_redemptions" (
  "id" TEXT NOT NULL,
  "couponId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedAt" TIMESTAMP(3),
  "releaseReason" TEXT,
  CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "orders_paymentProviderId_key" ON "orders"("paymentProviderId");
CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt" DESC);
CREATE INDEX "orders_payment_createdAt_idx" ON "orders"("payment", "createdAt" DESC);
CREATE INDEX "orders_paymentStatus_createdAt_idx" ON "orders"("paymentStatus", "createdAt" DESC);
CREATE INDEX "orders_stockReservationExpiresAt_idx" ON "orders"("stockReservationExpiresAt");
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");
CREATE INDEX "order_status_history_orderId_createdAt_idx" ON "order_status_history"("orderId", "createdAt" DESC);
CREATE UNIQUE INDEX "coupon_redemptions_orderId_key" ON "coupon_redemptions"("orderId");
CREATE INDEX "coupon_redemptions_couponId_createdAt_idx" ON "coupon_redemptions"("couponId", "createdAt" DESC);
CREATE INDEX "coupon_redemptions_userId_createdAt_idx" ON "coupon_redemptions"("userId", "createdAt" DESC);
CREATE INDEX "coupons_active_expiresAt_idx" ON "coupons"("active", "expiresAt");
CREATE INDEX "products_active_stock_idx" ON "products"("active", "stock");
CREATE INDEX "products_active_createdAt_idx" ON "products"("active", "createdAt" DESC);
CREATE INDEX "products_active_bestSeller_idx" ON "products"("active", "bestSeller");

ALTER TABLE "order_status_history"
ADD CONSTRAINT "order_status_history_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coupon_redemptions"
ADD CONSTRAINT "coupon_redemptions_couponId_fkey"
FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coupon_redemptions"
ADD CONSTRAINT "coupon_redemptions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coupon_redemptions"
ADD CONSTRAINT "coupon_redemptions_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
