'use client'

import Link from 'next/link'
import type { OrderStatus } from '@prisma/client'

interface RecentOrder {
  id: string
  amount: number
  status: OrderStatus
  createdAt: string
  user: { name: string; email: string }
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

export function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  return (
    <div className="bg-white rounded-xl border">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold">Órdenes recientes</h2>
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-black">
          Ver todas →
        </Link>
      </div>
      <div className="divide-y">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{order.user.name}</p>
              <p className="text-gray-500 text-xs">{order.user.email}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">${Number(order.amount).toLocaleString('es-CL')}</p>
              <p className="text-gray-500 text-xs">
                {new Date(order.createdAt).toLocaleDateString('es-CL')}
              </p>
            </div>
            <span
              className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-center text-gray-500 py-8 text-sm">No hay órdenes recientes</p>
        )}
      </div>
    </div>
  )
}
