'use client'

import { useCartStore } from '@/store/cart-store'
import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

const FREE_SHIPPING_THRESHOLD = 50000

export function CartDrawer() {
  const { items, isOpen, closeDrawer, removeItem, updateQuantity, getTotal } = useCartStore()
  const router = useRouter()
  const total = getTotal()

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeDrawer])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleExploreCollection = () => {
    closeDrawer()
    router.push('/collection')
  }

  const shippingProgress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)
  const remaining = FREE_SHIPPING_THRESHOLD - total

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-[var(--color-background)] border-l border-[var(--color-border)] z-50 flex flex-col shadow-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-lg">Carrito ({items.length})</h2>
              <button
                onClick={closeDrawer}
                className="p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)] gap-4 py-12">
                  <svg
                    className="w-16 h-16 opacity-40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <div className="text-center">
                    <p className="font-medium text-[var(--color-text-primary)]">
                      Tu carrito está vacío
                    </p>
                    <p className="text-sm mt-1">Agregá productos para comenzar</p>
                  </div>
                  <button
                    onClick={handleExploreCollection}
                    className="px-6 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                  >
                    Explorar colección
                  </button>
                </div>
              ) : (
                <>
                  {/* Free shipping progress bar */}
                  <div className="bg-[var(--color-surface)] rounded-lg p-3 space-y-2">
                    {total >= FREE_SHIPPING_THRESHOLD ? (
                      <div className="flex items-center gap-2 text-[var(--color-success)] text-sm font-medium">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>¡Envío gratis!</span>
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Te faltan ${remaining.toLocaleString('es-CL')} para envío gratis
                      </p>
                    )}
                    <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${shippingProgress}%`,
                          backgroundColor: 'var(--color-accent)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Items */}
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                      {item.image && (
                        <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface)]">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">Talla: {item.size}</p>
                        {item.color && (
                          <p className="text-xs text-[var(--color-text-muted)]">
                            Color: {item.color}
                          </p>
                        )}
                        <p className="text-sm font-medium mt-1">
                          ${(item.price * item.quantity).toLocaleString('es-CL')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded border border-[var(--color-border)] flex items-center justify-center text-sm hover:bg-[var(--color-surface)] transition-colors"
                          >
                            −
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity + 1)
                            }
                            className="w-6 h-6 rounded border border-[var(--color-border)] flex items-center justify-center text-sm hover:bg-[var(--color-surface)] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-[var(--color-text-muted)] hover:text-red-500 self-start p-1 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-[var(--color-border)] space-y-3">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString('es-CL')}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="block w-full py-3 bg-black text-white text-center rounded-lg text-sm hover:bg-gray-800 transition-colors font-medium"
                >
                  Ir al checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="block w-full py-2 border border-[var(--color-border)] text-center rounded-lg text-sm hover:bg-[var(--color-surface)] transition-colors"
                >
                  Ver carrito
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
