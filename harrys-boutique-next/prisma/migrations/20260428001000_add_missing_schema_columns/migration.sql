ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "sku" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_sku_key'
  ) THEN
    ALTER TABLE "products" ADD CONSTRAINT "products_sku_key" UNIQUE ("sku");
  END IF;
END $$;

ALTER TABLE "testimonials"
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PENDING';
