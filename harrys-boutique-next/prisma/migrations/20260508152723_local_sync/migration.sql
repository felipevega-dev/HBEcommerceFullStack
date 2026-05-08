-- RenameIndex
ALTER INDEX "addresses_userid_idx" RENAME TO "addresses_userId_idx";

-- RenameIndex
ALTER INDEX "addresses_userid_isdefault_idx" RENAME TO "addresses_userId_isDefault_idx";

-- RenameIndex
ALTER INDEX "cart_items_cartid_idx" RENAME TO "cart_items_cartId_idx";

-- RenameIndex
ALTER INDEX "cart_items_cartid_productid_size_color_key" RENAME TO "cart_items_cartId_productId_size_color_key";

-- RenameIndex
ALTER INDEX "reviews_productid_approved_createdat_idx" RENAME TO "reviews_productId_approved_createdAt_idx";

-- RenameIndex
ALTER INDEX "wishlists_userid_createdat_idx" RENAME TO "wishlists_userId_createdAt_idx";
