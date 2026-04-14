'use client'

import { useCartStore } from '@/store/cart-store'
import Link from 'next/link'
import Image from 'next/image'

const SHIPPING_FEE = 10

export function CartPageClient() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 border-t pt-14">
        <h1 className="text-3xl font-medium text-center">Carro de Compras</h1>
        <div className="flex flex-col items-center gap-4">
          <svg
            className="w-24 h-24 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
          <h2 className="text-xl font-medium text-gray-600">Tu Carro está vacío</h2>
          <p className="text-gray-500 text-center max-w-md">
            ¡Aprovecha! Tenemos miles de productos en oferta y oportunidades únicas.
          </p>
          <Link href="/collection">
            <button className="bg-black text-white px-8 py-3 mt-4 rounded-lg hover:bg-gray-800 transition-colors">
              Ver ofertas
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = getTotal()
  const total = subtotal + SHIPPING_FEE

  return (
    <div className="flex flex-col border-t pt-14">
      <h1 className="text-3xl font-medium mb-8 text-center">Carro de Compras</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product list */}
        <div className="flex-grow">
          <div className="hidden sm:grid grid-cols-[4fr_2fr_0.5fr] items-center gap-4 text-sm text-gray-500 pb-4 border-b">
            <div>Producto</div>
            <div>Cantidad</div>
            <div />
          </div>

          {items.map((item, index) => (
            <div
              key={`${item.productId}-${item.size}`}
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
                  <p className="text-sm sm:text-base font-medium group-hover:text-blue-600 transition-colors">
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
                    value={item.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (value > 0) updateQuantity(item.productId, item.size, value)
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
                onClick={() => removeItem(item.productId, item.size)}
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
              <span>${SHIPPING_FEE.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-3">
              <span>Total</span>
              <span>${total.toLocaleString('es-CL')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/collection">
              <button className="w-full px-6 py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Seguir comprando
              </button>
            </Link>
            <Link href="/checkout">
              <button className="w-full px-6 py-3 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
                Continuar Compra
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
