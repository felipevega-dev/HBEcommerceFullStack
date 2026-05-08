import type { Coupon, Product } from '@prisma/client'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, calculateShipping } from '@/lib/commerce'

type ProductSnapshot = Pick<
  Product,
  'id' | 'name' | 'price' | 'images' | 'stock' | 'active' | 'colors' | 'sizes'
>

export interface CheckoutRequestItem {
  productId: string
  quantity: number
  size: string
  color?: string
}

export interface ResolvedCheckoutItem {
  productId: string
  name: string
  price: number
  quantity: number
  size: string
  color: string
  image: string
}

export interface CheckoutTotals {
  subtotal: number
  shippingFee: number
  discountAmount: number
  total: number
}

export interface PricingSettings {
  shippingFee: number
  freeShippingThreshold: number
}

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  shippingFee: SHIPPING_FEE,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
}

function getAvailableSizes(sizes: Product['sizes']): string[] {
  return Array.isArray(sizes)
    ? sizes.filter((size): size is string => typeof size === 'string')
    : []
}

export function resolveCheckoutItems(
  requestItems: CheckoutRequestItem[],
  products: ProductSnapshot[],
): ResolvedCheckoutItem[] {
  const productsById = new Map(products.map((product) => [product.id, product]))

  return requestItems.map((item) => {
    const product = productsById.get(item.productId)

    if (!product || !product.active) {
      throw new Error('Uno de los productos ya no está disponible')
    }

    if (product.stock < item.quantity) {
      throw new Error(`Stock insuficiente para ${product.name}`)
    }

    const availableSizes = getAvailableSizes(product.sizes)
    if (availableSizes.length > 0 && !availableSizes.includes(item.size)) {
      throw new Error(`La talla seleccionada no está disponible para ${product.name}`)
    }

    const color = item.color ?? ''
    if (color && product.colors.length > 0 && !product.colors.includes(color)) {
      throw new Error(`El color seleccionado no está disponible para ${product.name}`)
    }

    return {
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: item.quantity,
      size: item.size,
      color,
      image: product.images[0] ?? '',
    }
  })
}

export function calculateSubtotal(items: ResolvedCheckoutItem[]) {
  return roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0))
}

export function roundMoney(value: number) {
  return Math.max(0, Math.round((value + Number.EPSILON) * 100) / 100)
}

export function toPaymentMinorUnits(value: number) {
  return Math.round(roundMoney(value) * 100)
}

export function calculateDiscountAmount(coupon: Coupon, subtotal: number, shippingFee = 0) {
  const rawDiscount =
    coupon.discountType === 'PERCENTAGE'
      ? Math.floor((subtotal * Number(coupon.discountValue)) / 100)
      : Number(coupon.discountValue)

  return roundMoney(Math.min(rawDiscount, subtotal + shippingFee))
}

export function calculateShippingForSubtotal(subtotal: number, pricing?: PricingSettings) {
  if (!pricing) return calculateShipping(subtotal)
  if (pricing.freeShippingThreshold > 0 && subtotal >= pricing.freeShippingThreshold) return 0

  return pricing.shippingFee
}

export function calculateCheckoutTotals(
  items: ResolvedCheckoutItem[],
  coupon?: Coupon | null,
  pricing?: PricingSettings,
): CheckoutTotals {
  const subtotal = calculateSubtotal(items)
  const shippingFee = calculateShippingForSubtotal(subtotal, pricing)
  const discountAmount = coupon ? calculateDiscountAmount(coupon, subtotal, shippingFee) : 0
  const total = roundMoney(subtotal + shippingFee - discountAmount)

  return { subtotal, shippingFee, discountAmount, total }
}

export function validateCouponForSubtotal(coupon: Coupon, subtotal: number) {
  const now = new Date()

  if (!coupon.active) return false
  if (coupon.expiresAt && coupon.expiresAt <= now) return false
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return false
  if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) return false

  return true
}
