import type { Metadata } from 'next'
import { CartPageClient } from '@/components/store/cart-page-client'

export const metadata: Metadata = {
  title: "Carrito — Harry's Boutique",
  robots: { index: false },
}

export default function CartPage() {
  return <CartPageClient />
}
