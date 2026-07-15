'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { resolveProductPurchaseChannel } from '@/lib/mercado-libre'

export function CartSyncProvider() {
  const { status } = useSession()
  const mergeWithServer = useCartStore((state) => state.mergeWithServer)
  const hasMerged = useRef(false)
  const hasValidatedLocalCart = useRef(false)
  const hydrationPromise = useRef<Promise<void> | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    hydrationPromise.current ??= Promise.resolve(useCartStore.persist.rehydrate())
    let cancelled = false

    const syncCart = async () => {
      await hydrationPromise.current
      if (cancelled) return

      if (status === 'authenticated' && !hasMerged.current) {
        hasMerged.current = true
        await mergeWithServer()
        return
      }

      if (status !== 'unauthenticated' || hasValidatedLocalCart.current) return
      hasValidatedLocalCart.current = true

      const items = useCartStore.getState().items
      const productIds = [...new Set(items.map((item) => item.productId))]
      const mercadoLibreIds = new Set<string>()

      await Promise.all(
        productIds.map(async (productId) => {
          try {
            const response = await fetch(`/api/products/${productId}`)
            if (!response.ok) return
            const data = await response.json()
            if (
              data.success &&
              resolveProductPurchaseChannel(data.product).type === 'mercadolibre'
            ) {
              mercadoLibreIds.add(productId)
            }
          } catch {
            // Keep the item when validation is unavailable; the order endpoint validates again.
          }
        }),
      )

      if (!cancelled && mercadoLibreIds.size > 0) {
        const currentItems = useCartStore.getState().items
        useCartStore
          .getState()
          .setItems(currentItems.filter((item) => !mercadoLibreIds.has(item.productId)))
      }
    }

    void syncCart()

    return () => {
      cancelled = true
    }
  }, [status, mergeWithServer])

  return null
}
