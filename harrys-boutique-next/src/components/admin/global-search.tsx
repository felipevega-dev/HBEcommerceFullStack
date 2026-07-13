'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { BrandIcon } from '@/components/ui/brand-icon'

interface SearchResult {
  products: {
    id: string
    name: string
    price: number
    image: string | null
    active: boolean
    stock: number
  }[]
  orders: {
    id: string
    status: string
    amount: number
    createdAt: string
    customer: { name: string; email: string }
  }[]
  users: { id: string; name: string; email: string; createdAt: string }[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export function GlobalSearch() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'orders' | 'users'>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  const search = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults(null)
        return
      }
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${activeTab}`)
        const data = await res.json()
        setResults(data)
      } catch (e) {
        console.error('Search error:', e)
      } finally {
        setLoading(false)
      }
    },
    [activeTab],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const totalResults = results
    ? results.products.length + results.orders.length + results.users.length
    : 0

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--color-text-primary)]/50 pt-20">
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
      <div
        className="ui-panel relative w-full max-w-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Búsqueda administrativa"
      >
        <div className="flex items-center border-b px-4 py-3">
          <BrandIcon name="search" className="h-5 w-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar productos, pedidos, clientes..."
            className="ui-field flex-1 border-0 bg-transparent text-lg outline-none placeholder:text-[var(--color-text-muted)] focus:ring-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-500">
            ESC
          </kbd>
        </div>

        <div className="flex gap-1 border-b px-2 py-2">
          {(['all', 'products', 'orders', 'users'] as const).map((tab) => (
            <button
              key={tab}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'ui-button ui-button-primary'
                  : 'ui-button ui-button-ghost text-[var(--color-text-secondary)]'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all'
                ? 'Todo'
                : tab === 'products'
                  ? 'Productos'
                  : tab === 'orders'
                    ? 'Pedidos'
                    : 'Clientes'}
            </button>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {query.length < 2 && (
            <div className="py-12 text-center text-gray-500">
              Escribe al menos 2 caracteres para buscar
            </div>
          )}

          {query.length >= 2 && loading && (
            <div className="py-12 text-center text-gray-500">Buscando...</div>
          )}

          {query.length >= 2 && !loading && results && totalResults === 0 && (
            <div className="py-12 text-center text-gray-500">No se encontraron resultados</div>
          )}

          {results && totalResults > 0 && (
            <div className="space-y-4">
              {activeTab === 'all' && results.products.length > 0 && (
                <div>
                  <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                    Productos
                  </h3>
                  {results.products.map((p) => (
                    <button
                      key={p.id}
                      className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded-lg text-left"
                      onClick={() => {
                        router.push(`/admin/products/${p.id}/edit`)
                        setIsOpen(false)
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                        {p.image && (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-sm text-gray-500">
                          ${p.price.toLocaleString('es-CL')} • Stock: {p.stock}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'all' && results.orders.length > 0 && (
                <div>
                  <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                    Pedidos
                  </h3>
                  {results.orders.map((o) => (
                    <button
                      key={o.id}
                      className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded-lg text-left"
                      onClick={() => {
                        router.push(`/admin/orders?search=${o.id}`)
                        setIsOpen(false)
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{o.id.slice(0, 8)}...</p>
                        <p className="text-sm text-gray-500">
                          {o.customer.name} • ${o.amount.toLocaleString('es-CL')}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status]}`}
                      >
                        {STATUS_LABELS[o.status]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'all' && results.users.length > 0 && (
                <div>
                  <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                    Clientes
                  </h3>
                  {results.users.map((u) => (
                    <button
                      key={u.id}
                      className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded-lg text-left"
                      onClick={() => {
                        router.push(`/admin/customers?search=${u.email}`)
                        setIsOpen(false)
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{u.name}</p>
                        <p className="text-sm text-gray-500 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'products' &&
                results.products.map((p) => (
                  <button
                    key={p.id}
                    className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded-lg text-left"
                    onClick={() => {
                      router.push(`/admin/products/${p.id}/edit`)
                      setIsOpen(false)
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                      {p.image && (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-sm text-gray-500">
                        ${p.price.toLocaleString('es-CL')} • Stock: {p.stock}
                      </p>
                    </div>
                  </button>
                ))}

              {activeTab === 'orders' &&
                results.orders.map((o) => (
                  <button
                    key={o.id}
                    className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded-lg text-left"
                    onClick={() => {
                      router.push(`/admin/orders?search=${o.id}`)
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">Pedido #{o.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {o.customer.name} • ${o.amount.toLocaleString('es-CL')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </button>
                ))}

              {activeTab === 'users' &&
                results.users.map((u) => (
                  <button
                    key={u.id}
                    className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded-lg text-left"
                    onClick={() => {
                      router.push(`/admin/customers?search=${u.email}`)
                      setIsOpen(false)
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{u.name}</p>
                      <p className="text-sm text-gray-500 truncate">{u.email}</p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
          <span>
            {totalResults} resultado{totalResults !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5">↑↓</kbd>
            <span>navegar</span>
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5">↵</kbd>
            <span>seleccionar</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
