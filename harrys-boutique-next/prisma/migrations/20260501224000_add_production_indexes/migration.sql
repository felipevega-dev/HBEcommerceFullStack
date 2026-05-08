CREATE INDEX IF NOT EXISTS addresses_userId_idx ON addresses("userId");

CREATE INDEX IF NOT EXISTS addresses_userId_isDefault_idx ON addresses("userId", "isDefault");

WITH duplicated_cart_items AS (
  SELECT
    MIN(id) AS keeper_id,
    ARRAY_AGG(id) AS item_ids,
    "cartId",
    "productId",
    size,
    color,
    SUM(quantity) AS total_quantity
  FROM cart_items
  GROUP BY "cartId", "productId", size, color
  HAVING COUNT(*) > 1
)
UPDATE cart_items AS cart_item
SET quantity = duplicated_cart_items.total_quantity
FROM duplicated_cart_items
WHERE cart_item.id = duplicated_cart_items.keeper_id;

WITH duplicated_cart_items AS (
  SELECT
    MIN(id) AS keeper_id,
    ARRAY_AGG(id) AS item_ids
  FROM cart_items
  GROUP BY "cartId", "productId", size, color
  HAVING COUNT(*) > 1
)
DELETE FROM cart_items AS cart_item
USING duplicated_cart_items
WHERE cart_item.id = ANY(duplicated_cart_items.item_ids)
  AND cart_item.id <> duplicated_cart_items.keeper_id;

CREATE INDEX IF NOT EXISTS cart_items_cartId_idx ON cart_items("cartId");

CREATE UNIQUE INDEX IF NOT EXISTS cart_items_cartId_productId_size_color_key
ON cart_items("cartId", "productId", size, color);

CREATE INDEX IF NOT EXISTS reviews_productId_approved_createdAt_idx
ON reviews("productId", approved, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS wishlists_userId_createdAt_idx
ON wishlists("userId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS testimonials_active_order_idx
ON testimonials(active, "order");

CREATE INDEX IF NOT EXISTS hero_slides_order_idx
ON hero_slides("order");
