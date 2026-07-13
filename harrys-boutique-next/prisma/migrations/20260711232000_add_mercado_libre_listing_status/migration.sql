CREATE TYPE "MercadoLibreListingStatus" AS ENUM ('ACTIVE', 'PAUSED', 'INACTIVE');

ALTER TABLE "products"
  ADD COLUMN "mercadoLibreItemId" TEXT,
  ADD COLUMN "mercadoLibreStatus" "MercadoLibreListingStatus" NOT NULL DEFAULT 'INACTIVE';

CREATE UNIQUE INDEX "products_mercadoLibreItemId_key"
ON "products"("mercadoLibreItemId");

CREATE INDEX "products_mercadoLibreStatus_idx"
ON "products"("mercadoLibreStatus");

ALTER TABLE "products"
  ADD CONSTRAINT "products_active_mercado_libre_listing_check"
  CHECK (
    "mercadoLibreStatus" <> 'ACTIVE'
    OR ("mercadoLibreUrl" IS NOT NULL AND "mercadoLibreItemId" IS NOT NULL)
  );
