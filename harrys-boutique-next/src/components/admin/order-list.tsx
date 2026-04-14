'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import type { OrderStatus } from '@prisma/client'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  size: string
  image?: string | null
}

interface Order {
  id: string
  amount: number
  status: OrderStatus
  payment: boolean
  paymentMethod: string
  createdAt: string
  addressSnapshot: unknown
  items: OrderItem[]
  user: { name: string; email: string }
}

interface Props {
  orders: Order[]
  total: number
  page: number
  limit: number
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export function AdminOrderList({ orders, total, page, limit }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get('status') as OrderStatus | null
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const totalPages = Math.ceil(total / limit)

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Estado actualizado')
        router.refresh()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter by status */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/admin/orders"
          className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
            !currentStatus ? 'bg-gray-800 text-white border-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          Todas
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
              currentStatus === s ? STATUS_COLORS[s] : 'hover:bg-gray-100'
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="text-sm text-gray-500">{total} órdenes en total</div>

      <div className="space-y-3">
        {orders.map((order) => {
          const address = order.addressSnapshot as Record<string, string> | null
          return (
            <div key={order.id} className="bg-white rounded-xl border overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-600">
                    {order.user.name} — {order.user.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-semibold">${Number(order.amount).toLocaleString('es-CL')}</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  <select
                    value={order.status}
                    disabled={updating === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="text-sm border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {order.payment ? 'Pagado' : 'Sin pagar'}
                  </span>
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="text-sm text-gray-500 hover:text-black"
                  >
                    {expanded === order.id ? 'Ocultar ▲' : 'Ver detalles ▼'}
                  </button>
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t p-4 bg-gray-50 space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm bg-white p-3 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-500 text-xs">
                            Talla: {item.size} · Cant: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(Number(item.price) * item.quantity).toLocaleString('es-CL')}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Address */}
                  {address && (
                    <div className="text-sm bg-white p-3 rounded-lg">
                      <p className="font-medium mb-1">Dirección de envío</p>
                      <p className="text-gray-600">
                        {address.firstname} {address.lastname}
                      </p>
                      <p className="text-gray-600">
                        {address.street}, {address.city}
                      </p>
                      {address.phone && <p className="text-gray-600">{address.phone}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
            No hay órdenes
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?page=${p}`}
              className={`px-3 py-1 rounded-lg text-sm border ${p === page ? 'bg-black text-white border-black' : 'hover:bg-gray-100'}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
