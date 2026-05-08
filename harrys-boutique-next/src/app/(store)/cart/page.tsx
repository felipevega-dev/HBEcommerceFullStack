import type { Metadata } from 'next'
import { CartPageClient } from '@/components/store/cart-page-client'
import { getPricingSettings } from '@/lib/commerce-settings'

export const metadata: Metadata = {
  title: "Carrito — Harry's Boutique",
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const pricingSettings = await getPricingSettings()
  return <CartPageClient pricingSettings={pricingSettings} />
}
