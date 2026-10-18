import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/auth'
import { CheckoutPageClient } from '@/components/store/checkout-page-client'
import { getPricingSettings, isCashOnDeliveryEnabled } from '@/lib/commerce-settings'

export const metadata: Metadata = {
  title: "Finalizar compra — Harry's Boutique",
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const [session, pricingSettings, codEnabled] = await Promise.all([
    auth(),
    getPricingSettings(),
    isCashOnDeliveryEnabled(),
  ])

  const viewer = session?.user ? { email: session.user.email, name: session.user.name } : null

  return (
    <Suspense>
      <CheckoutPageClient
        pricingSettings={pricingSettings}
        viewer={viewer}
        codEnabled={codEnabled}
      />
    </Suspense>
  )
}
