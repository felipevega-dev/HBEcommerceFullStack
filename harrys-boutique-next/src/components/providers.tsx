'use client'

import { SessionProvider } from 'next-auth/react'
import { CartSyncProvider } from '@/components/store/cart-sync-provider'
import { AnalyticsProvider } from '@/components/analytics-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AnalyticsProvider />
      <CartSyncProvider />
      {children}
    </SessionProvider>
  )
}
