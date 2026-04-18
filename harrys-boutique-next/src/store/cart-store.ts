'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  size: string
  color: string
  image: string
}

interface DbCartItem {
  id: string
  quantity: number
  size: string
  color: string | null
  product: {
    id: string
    name: string
    price: number | { toNumber: () => number } | string
    images: string[]
  }
}

export function mapDbCartToStoreItems(dbItems: DbCartItem[]): CartItem[] {
  return dbItems.map((item) => ({
    id: item.id,
    productId: item.product.id,
    name: item.product.name,
    price: Number(item.product.price),
    quantity: item.quantity,
    size: item.size,
    color: item.color ?? '',
    image: item.product.images[0] ?? '',
  }))
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  setItems: (items: CartItem[]) => void
  openDrawer: () => void
  closeDrawer: () => void
  getCount: () => number
  getTotal: () => number
  mergeWithServer: () => Promise<void>
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.size === item.size,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
              isOpen: true,
            }
          }
          return {
            items: [
              ...state.items,
              { ...item, id: `${item.productId}-${item.size}-${Date.now()}` },
            ],
            isOpen: true,
          }
        })
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.productId === productId && i.size === size)),
        }))
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size ? { ...i, quantity } : i,
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      setItems: (items) => set({ items }),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),

      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      mergeWithServer: async () => {
        const localItems = get().items
        try {
          if (localItems.length === 0) {
            const res = await fetch('/api/cart')
            if (!res.ok) {
              console.error('[Cart] Failed to fetch cart:', res.status)
              return
            }
            const data = await res.json()
            if (data.success && data.cart) {
              get().setItems(mapDbCartToStoreItems(data.cart.items ?? []))
            }
          } else {
            const res = await fetch('/api/cart/merge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: localItems.map((i) => ({
                  productId: i.productId,
                  quantity: i.quantity,
                  size: i.size,
                  color: i.color,
                })),
              }),
            })
            const { cart } = await res.json()
            get().setItems(mapDbCartToStoreItems(cart.items ?? []))
          }
        } catch (err) {
          console.error('[Cart] Merge failed, retaining local cart', err)
        }
      },
    }),
    { name: 'harrys-cart', skipHydration: true },
  ),
)
