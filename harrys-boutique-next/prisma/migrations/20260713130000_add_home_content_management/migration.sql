ALTER TABLE "categories"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "homeImage" TEXT,
  ADD COLUMN "homeDescription" TEXT,
  ADD COLUMN "homeHref" TEXT,
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "homeVisible" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "homeOrder" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_active_homeVisible_homeOrder_idx"
  ON "categories"("active", "homeVisible", "homeOrder");

WITH ranked_categories AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "name") - 1 AS "rank"
  FROM "categories"
)
UPDATE "categories" AS c
SET "homeVisible" = true, "homeOrder" = ranked_categories."rank"
FROM ranked_categories
WHERE c."id" = ranked_categories."id";

CREATE TABLE "home_product_selections" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "section" TEXT NOT NULL DEFAULT 'FEATURED',
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "home_product_selections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "home_product_selections_productId_section_key"
  ON "home_product_selections"("productId", "section");
CREATE INDEX "home_product_selections_section_visible_order_idx"
  ON "home_product_selections"("section", "visible", "order");
ALTER TABLE "home_product_selections"
  ADD CONSTRAINT "home_product_selections_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "home_category_blocks" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "mode" TEXT NOT NULL DEFAULT 'AUTO',
  "maxItems" INTEGER NOT NULL DEFAULT 4,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "home_category_blocks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "home_category_blocks_categoryId_key"
  ON "home_category_blocks"("categoryId");
CREATE INDEX "home_category_blocks_visible_order_idx"
  ON "home_category_blocks"("visible", "order");
ALTER TABLE "home_category_blocks"
  ADD CONSTRAINT "home_category_blocks_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "home_category_products" (
  "id" TEXT NOT NULL,
  "blockId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "home_category_products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "home_category_products_blockId_productId_key"
  ON "home_category_products"("blockId", "productId");
CREATE INDEX "home_category_products_blockId_visible_order_idx"
  ON "home_category_products"("blockId", "visible", "order");
ALTER TABLE "home_category_products"
  ADD CONSTRAINT "home_category_products_blockId_fkey"
  FOREIGN KEY ("blockId") REFERENCES "home_category_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "home_category_products"
  ADD CONSTRAINT "home_category_products_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "instagram_posts"
  ADD COLUMN "instagramUrl" TEXT,
  ADD COLUMN "altText" TEXT,
  ADD COLUMN "homeCaption" TEXT,
  ADD COLUMN "likes" INTEGER,
  ADD COLUMN "homeVisible" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "homeOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "instagram_posts_homeVisible_homeOrder_idx"
  ON "instagram_posts"("homeVisible", "homeOrder");
