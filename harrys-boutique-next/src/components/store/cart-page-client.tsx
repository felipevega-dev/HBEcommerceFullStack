'use client'

import { getCartLineKey, useCartStore } from '@/store/cart-store'
import Link from 'next/link'
import Image from 'next/image'
import {
  DEFAULT_PRICING_SETTINGS,
  calculateShippingForSubtotal,
  type PricingSettings,
} from '@/lib/checkout'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { TrustStrip } from '@/components/ui/trust-strip'

export function CartPageClient({
  pricingSettings = DEFAULT_PRICING_SETTINGS,
}: {
  pricingSettings?: PricingSettings
}) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()

  if (items.length === 0) {
    return (
      <div>
        <PageHeader
          title="Carrito"
          breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Carrito' }]}
        />
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <p className="text-[var(--color-text-secondary)]">Tu carrito está vacío.</p>
          <Button href="/collection">Ver colección</Button>
        </div>
      </div>
    )
  }

  const subtotal = getTotal()
  const shippingFee = calculateShippingForSubtotal(subtotal, pricingSettings)
  const total = subtotal + shippingFee

  return (
    <div>
      <PageHeader
        title="Carrito"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Carrito' }]}
      />

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-grow space-y-4">
          {items.map((item) => (
            <div
              key={getCartLineKey(item)}
              className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--color-border)] py-6 sm:grid-cols-[4fr_2fr_auto]"
            >
              <Link href={`/product/${item.productId}`} className="flex items-start gap-4">
                {item.image && (
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">{item.name}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Talla: {item.size}</p>
                  <p className="mt-1 text-sm font-medium">
                    ${(item.price * item.quantity).toLocaleString('es-CL')}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.productId, item.size, item.color)}
                className="text-sm text-[var(--color-error)] hover:underline"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:w-80">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Subtotal</span>
              <span>${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Envío</span>
              <span>${shippingFee.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-base font-medium">
              <span>Total</span>
              <span>${total.toLocaleString('es-CL')}</span>
            </div>
          </div>
          <Button href="/checkout" className="mt-6 w-full">
            Ir al checkout
          </Button>
          <div className="mt-4">
            <TrustStrip variant="inline" />
          </div>
        </aside>
      </div>
    </div>
  )
}
