'use client'

import { getCartLineKey, useCartStore } from '@/store/cart-store'
import Link from 'next/link'
import Image from 'next/image'
import {
  DEFAULT_PRICING_SETTINGS,
  calculateShippingForSubtotal,
  type PricingSettings,
} from '@/lib/checkout'
import { trackAnalyticsEvent } from '@/lib/analytics'
import { BrandIcon } from '@/components/ui/brand-icon'

export function CartPageClient({
  pricingSettings = DEFAULT_PRICING_SETTINGS,
}: {
  pricingSettings?: PricingSettings
}) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-14">
        <section className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-[#e5d6c8] bg-[linear-gradient(135deg,#fffaf4_0%,#f5e8dc_100%)] p-8 text-center shadow-[0_18px_45px_rgba(70,48,35,0.07)] sm:p-12">
          <div className="pointer-events-none absolute inset-3 rounded-[1.45rem] border border-dashed border-[#d8ba83]/70" />
          <div className="relative">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-[var(--color-accent-strong)]">
              <BrandIcon name="shopping-bag" className="h-6 w-6" />
            </span>
            <p className="ui-eyebrow mt-5">Compra directa</p>
            <h1
              className="mt-3 text-4xl text-[var(--color-text-primary)] sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tu carrito está esperando una pieza especial.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
              Este carrito está reservado para productos de compra directa y encargos coordinados
              con Harry&apos;s. Los productos publicados en Mercado Libre se compran desde su ficha
              oficial.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/tienda" className="ui-button ui-button-primary">
                Explorar tienda
              </Link>
              <Link href="/experiencias#atelier" className="ui-button ui-button-secondary">
                Conocer el Atelier
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const subtotal = getTotal()
  const shippingFee = calculateShippingForSubtotal(subtotal, pricingSettings)
  const total = subtotal + shippingFee

  return (
    <div className="flex flex-col border-t pt-14">
      <div className="mb-8 text-center">
        <p className="ui-eyebrow">Compra directa Harry&apos;s</p>
        <h1
          className="mt-3 text-4xl text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Carrito de compras
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          Aquí solo aparecen productos directos. El despacho y el total se confirman antes de pagar.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product list */}
        <div className="flex-grow">
          <div className="hidden sm:grid grid-cols-[4fr_2fr_0.5fr] items-center gap-4 text-sm text-gray-500 pb-4 border-b">
            <div>Producto</div>
            <div>Cantidad</div>
            <div />
          </div>

          {items.map((item) => (
            <div
              key={getCartLineKey(item)}
              className="py-6 border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <Link
                href={`/product/${item.productId}`}
                className="flex items-start gap-4 group hover:opacity-90 transition-opacity"
              >
                {item.image && (
                  <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={107}
                      className="w-20 sm:w-24 aspect-[3/4] object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <p className="text-sm sm:text-base font-medium group-hover:text-[var(--color-accent-dark)] transition-colors">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm sm:text-base">${item.price.toLocaleString('es-CL')}</p>
                    <span className="px-2 py-1 text-xs border rounded-md bg-gray-50">
                      {item.size}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="relative">
                <div className="sm:hidden absolute -top-4 left-0 text-xs text-gray-500">
                  Cantidad
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    aria-label={`Cantidad de ${item.name}`}
                    value={item.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (value > 0) {
                        updateQuantity(item.productId, item.size, item.color, value)
                      }
                    }}
                    className="w-16 px-2 py-1 border rounded-md focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none text-sm"
                  />
                  <p className="hidden sm:block text-sm text-gray-500">
                    × ${item.price.toLocaleString('es-CL')}
                  </p>
                </div>
                <p className="hidden sm:block text-sm font-medium mt-1">
                  ${(item.price * item.quantity).toLocaleString('es-CL')}
                </p>
              </div>

              <button
                onClick={() => removeItem(item.productId, item.size, item.color)}
                className="group p-2 hover:bg-red-50 rounded-full transition-colors"
                title="Eliminar producto"
              >
                <svg
                  className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-[380px] space-y-6">
          <div className="border rounded-xl p-6 space-y-3">
            <h2 className="font-semibold text-lg">Resumen del pedido</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Envío</span>
              <span>
                {shippingFee === 0 ? 'Gratis' : `$${shippingFee.toLocaleString('es-CL')}`}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-3">
              <span>Total</span>
              <span>${total.toLocaleString('es-CL')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/tienda" className="ui-button ui-button-secondary w-full">
              Seguir comprando
            </Link>
            <Link
              href="/checkout"
              className="ui-button ui-button-primary w-full"
              onClick={() =>
                trackAnalyticsEvent('start_direct_checkout', {
                  cta_location: 'cart',
                  item_count: items.length,
                  value: total,
                })
              }
            >
              Finalizar compra
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
