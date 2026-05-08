'use client'

import { SessionProvider } from 'next-auth/react'
import { CartSyncProvider } from '@/components/store/cart-sync-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartSyncProvider />
      {children}
    </SessionProvider>
  )
}
