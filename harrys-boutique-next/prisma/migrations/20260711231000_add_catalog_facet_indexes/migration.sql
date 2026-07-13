CREATE INDEX "products_active_colors_gin_idx"
ON "products" USING GIN ("colors")
WHERE "active" = true;

CREATE INDEX "products_active_sizes_gin_idx"
ON "products" USING GIN ("sizes" jsonb_path_ops)
WHERE "active" = true;
