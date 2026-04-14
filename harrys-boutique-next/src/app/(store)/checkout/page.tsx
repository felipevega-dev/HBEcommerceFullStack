import type { Metadata } from 'next'
import { CheckoutPageClient } from '@/components/store/checkout-page-client'

export const metadata: Metadata = {
  title: "Checkout — Harry's Boutique",
  robots: { index: false },
}

export default function CheckoutPage() {
  return <CheckoutPageClient />
}
