'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'

export function CartSyncProvider() {
  const { status } = useSession()
  const mergeWithServer = useCartStore((state) => state.mergeWithServer)
  const hasMerged = useRef(false)

  useEffect(() => {
    if (status === 'authenticated' && !hasMerged.current) {
      hasMerged.current = true
      mergeWithServer()
    }
  }, [status, mergeWithServer])

  return null
}
