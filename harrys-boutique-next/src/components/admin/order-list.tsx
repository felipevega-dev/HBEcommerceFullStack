'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import type { OrderStatus } from '@prisma/client'
import { BrandIcon } from '@/components/ui/brand-icon'

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

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`
}

export function AdminOrderList({ orders, total, page, limit, stats }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get('status') as OrderStatus | null
  const currentSearch = searchParams.get('search') || ''
  const currentPaymentStatus = searchParams.get('paymentStatus') || ''
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '')
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '')
  const totalPages = Math.ceil(total / limit)

  const setStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message ?? 'Error al actualizar')
      toast.success('Estado actualizado')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar')
    } finally {
      setUpdating(null)
    }
  }

  const setBulkStatus = async (status: OrderStatus) => {
    if (selectedOrders.size === 0) {
      toast.error('Selecciona al menos una orden')
      return
    }
    if (!confirm(`¿Cambiar ${selectedOrders.size} orden(es) a ${STATUS_LABELS[status]}?`)) return

    await Promise.all(Array.from(selectedOrders).map((id) => setStatus(id, status)))
    setSelectedOrders(new Set())
  }

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders((current) => {
      const next = new Set(current)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedOrders((current) => {
      if (current.size === orders.length) return new Set()
      return new Set(orders.map((order) => order.id))
    })
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
      'Método de pago',
      'Cupón',
      'Descuento',
    ]
    const rows = orders.map((order) => [
      order.id,
      new Date(order.createdAt).toLocaleDateString('es-CL'),
      order.user.name,
      order.user.email,
      order.amount,
      STATUS_LABELS[order.status],
      order.payment ? 'Pagado' : 'Pendiente',
      order.paymentMethod,
      order.couponCode || '',
      order.discountAmount || 0,
    ])
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ordenes-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
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

  const setPaymentFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('paymentStatus', value)
    else params.delete('paymentStatus')
    params.delete('page')
    router.push(`/admin/orders?${params.toString()}`)
  }

  const totalRevenue = stats.reduce((sum, stat) => sum + stat.total, 0)
  const paidOrders = orders.filter((order) => order.payment).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Total órdenes</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Ingresos filtrados</p>
          <p className="text-2xl font-bold">${totalRevenue.toLocaleString('es-CL')}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Órdenes pagadas</p>
          <p className="text-2xl font-bold">
            {paidOrders} <span className="text-sm text-gray-500">/ {orders.length}</span>
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Promedio por orden</p>
          <p className="text-2xl font-bold">
            ${total > 0 ? Math.round(totalRevenue / total).toLocaleString('es-CL') : 0}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters((value) => !value)}
            className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-gray-100"
          >
            <span className="inline-flex items-center gap-2">
              <BrandIcon name={showFilters ? 'x' : 'filter'} className="h-4 w-4" />
              {showFilters ? 'Ocultar filtros' : 'Filtros'}
            </span>
          </button>
          <button
            onClick={exportToCSV}
            className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-gray-100"
          >
            <span className="inline-flex items-center gap-2">
              <BrandIcon name="download" className="h-4 w-4" />
              Exportar CSV
            </span>
          </button>
        </div>
        {selectedOrders.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">{selectedOrders.size} seleccionadas</span>
            <select
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) void setBulkStatus(event.target.value as OrderStatus)
                event.target.value = ''
              }}
            >
              <option value="" disabled>
                Cambiar estado...
              </option>
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
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

      {showFilters && (
        <div className="space-y-3 rounded-xl border bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="ID, nombre, email..."
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <select
              value={currentPaymentStatus}
              onChange={(event) => setPaymentFilter(event.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Todos los pagos</option>
              <option value="paid">Pagado</option>
              <option value="unpaid">Sin pagar</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
            >
              Aplicar filtros
            </button>
            <button
              onClick={() => router.push('/admin/orders')}
              className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-gray-100"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
            !currentStatus ? 'border-gray-800 bg-gray-800 text-white' : 'hover:bg-gray-100'
          }`}
        >
          Todas ({total})
        </Link>
        {ALL_STATUSES.map((status) => {
          const stat = stats.find((item) => item.status === status)
          return (
            <Link
              key={status}
              href={`/admin/orders?status=${status}`}
              className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
                currentStatus === status ? STATUS_COLORS[status] : 'hover:bg-gray-100'
              }`}
            >
              {STATUS_LABELS[status]} ({stat?.count || 0})
            </Link>
          )
        })}
      </div>

      <div className="space-y-3">
        {orders.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={selectedOrders.size === orders.length && orders.length > 0}
              onChange={toggleSelectAll}
            />
            Seleccionar todas
          </label>
        )}

        {orders.map((order) => {
          const address = order.addressSnapshot as Record<string, string> | null
          const isSelected = selectedOrders.has(order.id)
          return (
            <div
              key={order.id}
              className={`overflow-hidden rounded-xl border bg-white transition-all ${
                isSelected ? 'ring-2 ring-black' : ''
              }`}
            >
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectOrder(order.id)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                    {order.couponCode && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                        {order.couponCode}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-gray-600">
                    {order.user.name} — {order.user.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString('es-CL')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold">${order.amount.toLocaleString('es-CL')}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  <select
                    value={order.status}
                    disabled={updating === order.id}
                    onChange={(event) =>
                      void setStatus(order.id, event.target.value as OrderStatus)
                    }
                    className="rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                  >
                    {ALL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      order.payment
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.payment ? 'Pagado' : 'Pendiente'}
                  </span>
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="text-sm text-gray-500 transition-colors hover:text-black"
                  >
                    {expanded === order.id ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              {expanded === order.id && (
                <div className="space-y-4 border-t bg-gray-50 p-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-lg bg-white p-3 text-sm">
                      <p className="mb-2 font-medium">Pago</p>
                      <p className="text-gray-600">Método: {order.paymentMethod}</p>
                      <p className="text-gray-600">
                        Estado: {order.payment ? 'Pagado' : 'Pendiente'}
                      </p>
                      {order.discountAmount ? (
                        <p className="text-gray-600">
                          Descuento: ${order.discountAmount.toLocaleString('es-CL')}
                        </p>
                      ) : null}
                    </div>
                    {address && (
                      <div className="rounded-lg bg-white p-3 text-sm">
                        <p className="mb-2 font-medium">Dirección de envío</p>
                        <p className="text-gray-600">
                          {address.firstname} {address.lastname}
                        </p>
                        <p className="text-gray-600">
                          {address.street}, {address.city}
                        </p>
                        {address.phone && (
                          <p className="text-gray-600">Teléfono: {address.phone}</p>
                        )}
                      </div>
                    )}
                    <div className="rounded-lg bg-white p-3 text-sm">
                      <p className="mb-2 font-medium">Timeline</p>
                      <p className="text-gray-600">
                        Creada: {new Date(order.createdAt).toLocaleString('es-CL')}
                      </p>
                      <p className="text-gray-600">
                        Última actualización: {new Date(order.updatedAt).toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Productos ({order.items.length})</p>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              Talla: {item.size}
                              {item.color ? ` · Color: ${item.color}` : ''} · Cant: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">
                          ${(item.price * item.quantity).toLocaleString('es-CL')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {orders.length === 0 && (
          <div className="rounded-xl border bg-white py-12 text-center text-gray-500">
            <BrandIcon name="package" className="mx-auto mb-2 h-6 w-6" />
            <p>No hay órdenes que coincidan con los filtros</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', String(p))
            return (
              <Link
                key={p}
                href={`/admin/orders?${params.toString()}`}
                className={`rounded-lg border px-3 py-1 text-sm ${
                  p === page ? 'border-black bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                {p}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
