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
  color: string
  image?: string | null
}

interface Order {
  id: string
  amount: number
  status: OrderStatus
  payment: boolean
  paymentMethod: string
  createdAt: string
  updatedAt: string
  addressSnapshot: unknown
  couponCode?: string | null
  discountAmount?: number | null
  items: OrderItem[]
  user: { name: string; email: string }
}

interface OrderStats {
  status: OrderStatus
  count: number
  total: number
}

interface Props {
  orders: Order[]
  total: number
  page: number
  limit: number
  stats: OrderStats[]
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

export function AdminOrderList({ orders, total, page, limit, stats }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get('status') as OrderStatus | null
  const currentSearch = searchParams.get('search') || ''
  const currentDateFrom = searchParams.get('dateFrom') || ''
  const currentDateTo = searchParams.get('dateTo') || ''
  const currentPaymentStatus = searchParams.get('paymentStatus') || ''

  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [dateFrom, setDateFrom] = useState(currentDateFrom)
  const [dateTo, setDateTo] = useState(currentDateTo)

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

  const handleBulkStatusChange = async (status: OrderStatus) => {
    if (selectedOrders.size === 0) {
      toast.error('Selecciona al menos una orden')
      return
    }

    const confirmed = confirm(
      `¿Cambiar el estado de ${selectedOrders.size} orden(es) a ${STATUS_LABELS[status]}?`
    )
    if (!confirmed) return

    try {
      const promises = Array.from(selectedOrders).map((orderId) =>
        fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      )

      await Promise.all(promises)
      toast.success(`${selectedOrders.size} orden(es) actualizadas`)
      setSelectedOrders(new Set())
      router.refresh()
    } catch {
      toast.error('Error al actualizar órdenes')
    }
  }

  const toggleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)))
    }
  }

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Fecha',
      'Cliente',
      'Email',
      'Monto',
      'Estado',
      'Pago',
      'Método de Pago',
      'Cupón',
      'Descuento',
    ]
    const rows = orders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString('es-CL'),
      o.user.name,
      o.user.email,
      o.amount,
      STATUS_LABELS[o.status],
      o.payment ? 'Pagado' : 'Pendiente',
      o.paymentMethod,
      o.couponCode || '',
      o.discountAmount || 0,
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ordenes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (currentStatus) params.set('status', currentStatus)
    if (searchInput) params.set('search', searchInput)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    if (currentPaymentStatus) params.set('paymentStatus', currentPaymentStatus)
    router.push(`/admin/orders?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchInput('')
    setDateFrom('')
    setDateTo('')
    router.push('/admin/orders')
  }

  const totalRevenue = stats.reduce((sum, s) => sum + s.total, 0)
  const paidOrders = orders.filter((o) => o.payment).length

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Total Órdenes</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Ingresos Totales</p>
          <p className="text-2xl font-bold">${totalRevenue.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Órdenes Pagadas</p>
          <p className="text-2xl font-bold">
            {paidOrders} <span className="text-sm text-gray-500">/ {orders.length}</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Promedio por Orden</p>
          <p className="text-2xl font-bold">
            ${total > 0 ? Math.round(totalRevenue / total).toLocaleString('es-CL') : 0}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 transition-colors"
          >
            {showFilters ? '✕ Ocultar filtros' : '🔍 Filtros'}
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 transition-colors"
          >
            📥 Exportar CSV
          </button>
        </div>

        {selectedOrders.size > 0 && (
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm text-gray-600">{selectedOrders.size} seleccionadas</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusChange(e.target.value as OrderStatus)
                  e.target.value = ''
                }
              }}
              className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              defaultValue=""
            >
              <option value="" disabled>
                Cambiar estado...
              </option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl border space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Buscar</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ID, nombre, email..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado de Pago</label>
              <select
                value={currentPaymentStatus}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString())
                  if (e.target.value) {
                    params.set('paymentStatus', e.target.value)
                  } else {
                    params.delete('paymentStatus')
                  }
                  router.push(`/admin/orders?${params.toString()}`)
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Todos</option>
                <option value="paid">Pagado</option>
                <option value="unpaid">Sin pagar</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              Aplicar filtros
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Filter Presets */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/admin/orders"
          className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
            !currentStatus ? 'bg-gray-800 text-white border-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          Todas ({total})
        </Link>
        <Link
          href={`/admin/orders?status=PENDING&dateTo=${new Date().toISOString().split('T')[0]}`}
          className={`px-3 py-1 text-sm border border-yellow-300 rounded-lg transition-colors hover:bg-yellow-50`}
        >
          Hoy pendientes
        </Link>
        <Link
          href="/admin/orders?status=PROCESSING"
          className={`px-3 py-1 text-sm border border-blue-300 rounded-lg transition-colors hover:bg-blue-50`}
        >
          Lista para enviar
        </Link>
        <Link
          href="/admin/orders?status=PENDING&paymentStatus=unpaid"
          className={`px-3 py-1 text-sm border border-red-300 rounded-lg transition-colors hover:bg-red-50`}
        >
          Sin pagar
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map((s) => {
          const stat = stats.find((st) => st.status === s)
          return (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                currentStatus === s ? STATUS_COLORS[s] : 'hover:bg-gray-100'
              }`}
            >
              {STATUS_LABELS[s]} ({stat?.count || 0})
            </Link>
          )
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={selectedOrders.size === orders.length && orders.length > 0}
              onChange={toggleSelectAll}
              className="rounded"
            />
            <span>Seleccionar todas</span>
          </div>
        )}

        {orders.map((order) => {
          const address = order.addressSnapshot as Record<string, string> | null
          const isSelected = selectedOrders.has(order.id)

          return (
            <div
              key={order.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                isSelected ? 'ring-2 ring-black' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectOrder(order.id)}
                  className="rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                    {order.couponCode && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
                        🎟️ {order.couponCode}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {order.user.name} — {order.user.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-right">
                    <p className="font-semibold">${Number(order.amount).toLocaleString('es-CL')}</p>
                    {order.discountAmount && order.discountAmount > 0 && (
                      <p className="text-xs text-green-600">
                        -${Number(order.discountAmount).toLocaleString('es-CL')}
                      </p>
                    )}
                  </div>
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
                    {order.payment ? '✓ Pagado' : '⏳ Pendiente'}
                  </span>
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="text-sm text-gray-500 hover:text-black transition-colors"
                  >
                    {expanded === order.id ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t p-4 bg-gray-50 space-y-4">
                  {/* Order Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-sm bg-white p-3 rounded-lg">
                      <p className="font-medium mb-2">Información de Pago</p>
                      <div className="space-y-1 text-gray-600">
                        <p>
                          <span className="font-medium">Método:</span> {order.paymentMethod}
                        </p>
                        <p>
                          <span className="font-medium">Estado:</span>{' '}
                          {order.payment ? 'Pagado' : 'Pendiente'}
                        </p>
                        {order.couponCode && (
                          <>
                            <p>
                              <span className="font-medium">Cupón:</span> {order.couponCode}
                            </p>
                            <p>
                              <span className="font-medium">Descuento:</span> $
                              {Number(order.discountAmount).toLocaleString('es-CL')}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    {address && (
                      <div className="text-sm bg-white p-3 rounded-lg">
                        <p className="font-medium mb-2">Dirección de Envío</p>
                        <div className="text-gray-600 space-y-1">
                          <p>
                            {address.firstname} {address.lastname}
                          </p>
                          <p>
                            {address.street}, {address.city}
                          </p>
                          {address.phone && <p>📞 {address.phone}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Productos ({order.items.length})</p>
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm bg-white p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-gray-500 text-xs">
                              Talla: {item.size}
                              {item.color && ` · Color: ${item.color}`} · Cant: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">
                          ${(Number(item.price) * item.quantity).toLocaleString('es-CL')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Timeline */}
                  <div className="text-xs text-gray-500 bg-white p-3 rounded-lg">
                    <p>
                      <span className="font-medium">Creada:</span>{' '}
                      {new Date(order.createdAt).toLocaleString('es-CL')}
                    </p>
                    <p>
                      <span className="font-medium">Última actualización:</span>{' '}
                      {new Date(order.updatedAt).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
            <p className="text-lg mb-2">📦</p>
            <p>No hay órdenes que coincidan con los filtros</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {page > 1 && (
            <Link
              href={`/admin/orders?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page - 1) }).toString()}`}
              className="px-3 py-1 rounded-lg text-sm border hover:bg-gray-100"
            >
              ← Anterior
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let p = i + 1
            if (totalPages > 5) {
              if (page <= 3) {
                p = i + 1
              } else if (page >= totalPages - 2) {
                p = totalPages - 4 + i
              } else {
                p = page - 2 + i
              }
            }
            return (
              <Link
                key={p}
                href={`/admin/orders?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(p) }).toString()}`}
                className={`px-3 py-1 rounded-lg text-sm border ${p === page ? 'bg-black text-white border-black' : 'hover:bg-gray-100'}`}
              >
                {p}
              </Link>
            )
          })}
          {page < totalPages && (
            <Link
              href={`/admin/orders?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page + 1) }).toString()}`}
              className="px-3 py-1 rounded-lg text-sm border hover:bg-gray-100"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
