import type { Prisma, ProductVariant } from '@prisma/client'

export interface VariantInput {
  id?: string
  size: string
  color?: string
  stock: number
  sku?: string | null
  active?: boolean
}

export interface ProductWithVariantStock {
  id: string
  name: string
  stock: number
  variants?: Pick<ProductVariant, 'id' | 'size' | 'color' | 'stock' | 'active'>[]
}

export function normalizeVariantColor(color?: string | null) {
  return color?.trim() ?? ''
}

export function findMatchingVariant<T extends { size: string; color: string; active: boolean }>(
  variants: T[] | undefined,
  size: string,
  color?: string | null,
) {
  if (!variants?.length) return null
  const normalizedColor = normalizeVariantColor(color)
  return (
    variants.find(
      (variant) =>
        variant.active &&
        variant.size === size &&
        normalizeVariantColor(variant.color) === normalizedColor,
    ) ?? null
  )
}

export function getAvailableStockForSelection(
  product: ProductWithVariantStock,
  size: string,
  color?: string | null,
) {
  const variant = findMatchingVariant(product.variants, size, color)
  if (product.variants?.length) return variant?.stock ?? 0
  return product.stock
}

export function buildDefaultVariants(sizes: string[], colors: string[], stock = 0): VariantInput[] {
  const normalizedSizes = sizes.length ? sizes : ['ÚNICA']
  const normalizedColors = colors.length ? colors : ['']

  return normalizedSizes.flatMap((size) =>
    normalizedColors.map((color) => ({
      size,
      color,
      stock: 0,
      sku: null,
      active: true,
    })),
  )
}

export async function syncProductVariantStock(
  tx: Prisma.TransactionClient,
  productId: string,
  variants: VariantInput[],
) {
  const sanitized = variants.map((variant) => ({
    id: variant.id,
    size: variant.size.trim(),
    color: normalizeVariantColor(variant.color),
    stock: Math.max(0, variant.stock),
    sku: variant.sku?.trim() || null,
    active: variant.active ?? true,
  }))

  const keepIds = sanitized.flatMap((variant) => (variant.id ? [variant.id] : []))

  await tx.productVariant.deleteMany({
    where: {
      productId,
      ...(keepIds.length ? { id: { notIn: keepIds } } : {}),
    },
  })

  for (const variant of sanitized) {
    if (variant.id) {
      await tx.productVariant.update({
        where: { id: variant.id },
        data: {
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          sku: variant.sku,
          active: variant.active,
        },
      })
    } else {
      await tx.productVariant.create({
        data: {
          productId,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          sku: variant.sku,
          active: variant.active,
        },
      })
    }
  }

  const aggregate = await tx.productVariant.aggregate({
    where: { productId, active: true },
    _sum: { stock: true },
  })

  return tx.product.update({
    where: { id: productId },
    data: { stock: aggregate._sum.stock ?? 0 },
  })
}
