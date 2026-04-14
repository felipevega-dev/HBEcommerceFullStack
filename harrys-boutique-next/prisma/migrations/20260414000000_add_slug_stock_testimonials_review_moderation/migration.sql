-- Add slug field to products (with empty default for existing rows)
ALTER TABLE "products" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';

-- Add stock field to products
ALTER TABLE "products" ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 0;

-- Add approved field to reviews
ALTER TABLE "reviews" ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT true;

-- Create testimonials table
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "comment" VARCHAR(500) NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "avatar" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- Create unique index on slug (after populating it)
-- Note: Run the slug population script before applying this constraint
-- ALTER TABLE "products" ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");

-- Create index on slug
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- Populate slugs from existing product names
-- This generates a slug from the product name: lowercase, spaces to hyphens, remove special chars
UPDATE "products" 
SET "slug" = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(name, '[áàäâ]', 'a', 'gi'),
            '[éèëê]', 'e', 'gi'
        ),
        '[^a-z0-9\s-]', '', 'g'
    )
)
WHERE "slug" = '';

-- Make slugs unique by appending the first 8 chars of id where needed
UPDATE "products" p1
SET "slug" = p1."slug" || '-' || SUBSTRING(p1."id", 1, 8)
WHERE EXISTS (
    SELECT 1 FROM "products" p2 
    WHERE p2."slug" = p1."slug" AND p2."id" != p1."id"
);

-- Now add the unique constraint
ALTER TABLE "products" ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");
