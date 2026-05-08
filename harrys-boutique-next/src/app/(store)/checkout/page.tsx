import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { CheckoutPageClient } from '@/components/store/checkout-page-client'
import { getPricingSettings } from '@/lib/commerce-settings'

export const metadata: Metadata = {
  title: "Checkout — Harry's Boutique",
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/checkout')
  }
  const pricingSettings = await getPricingSettings()

  return (
    <Suspense>
      <CheckoutPageClient pricingSettings={pricingSettings} />
    </Suspense>
  )
}
