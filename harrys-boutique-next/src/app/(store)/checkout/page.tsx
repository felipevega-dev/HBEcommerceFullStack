import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { CheckoutPageClient } from '@/components/store/checkout-page-client'

export const metadata: Metadata = {
  title: "Checkout — Harry's Boutique",
  robots: { index: false },
}

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/checkout')
  }

  return (
    <Suspense>
      <CheckoutPageClient />
    </Suspense>
  )
}
