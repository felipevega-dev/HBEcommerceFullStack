'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { OrderStatus } from '@prisma/client'

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_DOT_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500',
  PROCESSING: 'bg-blue-500',
  SHIPPED: 'bg-green-500',
  DELIVERED: 'bg-purple-500',
  CANCELLED: 'bg-red-500',
}

const SHIPPING_FEE = 10

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  size: string
  image?: string | null
}

export interface OrderWithItems {
  id: string
  amount: number
  status: OrderStatus
  payment: boolean
  paymentMethod: string
  createdAt: string
  addressSnapshot: unknown
  items: OrderItem[]
}

export function OrdersList({ orders }: { orders: OrderWithItems[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (orders.length === 0) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-center">No tienes pedidos aún. ¡Empieza a comprar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const address = order.addressSnapshot as Record<string, string> | null
        const isExpanded = expanded === order.id

        return (
          <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden border">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Orden #{order.id.slice(-8).toUpperCase()}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xl font-medium">
                      ${Number(order.amount).toLocaleString('es-CL')}
                    </p>
                    <span className="text-sm text-gray-500">
                      {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('es-CL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[order.status]}`} />
                    <span className="text-sm">{STATUS_LABELS[order.status]}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{order.paymentMethod}</span>
                    <span
                      className={`text-sm ${order.payment ? 'text-green-500' : 'text-yellow-500'}`}
                    >
                      {order.payment ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>

                  <button
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-4 bg-gray-50 p-6 rounded-lg space-y-6">
                  {/* Products */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Productos</h3>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm"
                      >
                        {item.image && (
                          <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>Talla: {item.size}</span>
                            <span>Cantidad: {item.quantity}</span>
                            <span>${Number(item.price).toLocaleString('es-CL')}</span>
                          </div>
                        </div>
                        <p className="font-medium">
                          ${(Number(item.price) * item.quantity).toLocaleString('es-CL')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Cost breakdown */}
                  <div className="bg-white p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>${(Number(order.amount) - SHIPPING_FEE).toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío:</span>
                      <span>${SHIPPING_FEE.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>${Number(order.amount).toLocaleString('es-CL')}</span>
                    </div>
                  </div>

                  {/* Shipping info */}
                  {address && (
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium mb-4">Información de envío</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Nombre:</span>
                          <p>
                            {address.firstname} {address.lastname}
                          </p>
                        </div>
                        {address.email && (
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <p>{address.email}</p>
                          </div>
                        )}
                        {address.phone && (
                          <div>
                            <span className="text-gray-600">Teléfono:</span>
                            <p>{address.phone}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Dirección:</span>
                          <p>{address.street}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Ciudad:</span>
                          <p>{address.city}</p>
                        </div>
                        {address.region && (
                          <div>
                            <span className="text-gray-600">Región:</span>
                            <p>{address.region}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
