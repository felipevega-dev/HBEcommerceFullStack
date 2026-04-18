'use client'

import Link from 'next/link'

interface StatusCount {
  status: string
  _count: { status: number }
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  PROCESSING: { label: 'Procesando', color: 'text-blue-700', bg: 'bg-blue-100' },
  SHIPPED: { label: 'Enviado', color: 'text-purple-700', bg: 'bg-purple-100' },
  DELIVERED: { label: 'Entregado', color: 'text-green-700', bg: 'bg-green-100' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100' },
}

export function OrderStatusBreakdown({ ordersByStatus }: { ordersByStatus: StatusCount[] }) {
  const total = ordersByStatus.reduce((acc, s) => acc + s._count.status, 0)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Órdenes por estado</h3>
        <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
          Ver todas
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ordersByStatus.map((item) => {
          const config = statusConfig[item.status] || { label: item.status, color: 'text-gray-700', bg: 'bg-gray-100' }
          const percentage = total > 0 ? (item._count.status / total) * 100 : 0
          return (
            <Link
              key={item.status}
              href={`/admin/orders?status=${item.status}`}
              className="p-3 rounded-lg border border-[var(--color-border)] hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${config.bg}`} />
                <span className="text-sm text-gray-600">{config.label}</span>
              </div>
              <p className="text-xl font-semibold">{item._count.status}</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.bg}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}