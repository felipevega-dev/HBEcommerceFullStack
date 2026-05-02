'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { BrandIcon } from '@/components/ui/brand-icon'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  active: boolean
  bestSeller: boolean
  category: { name: string } | null
  subCategory: string
  stock: number
}

interface Props {
  products: Product[]
  total: number
  page: number
  limit: number
  categories?: string[]
}

export function AdminProductList({ products, total, page, limit, categories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string>('')
  const [bulkValue, setBulkValue] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  
  const totalPages = Math.ceil(total / limit)

  // Real-time search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchQuery) {
        params.set('search', searchQuery)
      } else {
        params.delete('search')
      }
      params.delete('page') // Reset to page 1 on search
      
      startTransition(() => {
        router.push(`/admin/products?${params.toString()}`)
      })
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchQuery])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)))
    }
  }

  const handleBulkAction = async () => {
    if (selectedIds.size === 0) {
      toast.error('Seleccioná al menos un producto')
      return
    }

    if (!bulkAction) {
      toast.error('Seleccioná una acción')
      return
    }

    setProcessing(true)
    try {
      const ids = Array.from(selectedIds)
      
      let body: any = { ids }
      
      switch (bulkAction) {
        case 'activate':
          body.active = true
          break
        case 'deactivate':
          body.active = false
          break
        case 'setBestSeller':
          body.bestSeller = true
          break
        case 'unsetBestSeller':
          body.bestSeller = false
          break
        case 'updateStock':
          if (!bulkValue || isNaN(parseInt(bulkValue))) {
            toast.error('Ingresá un stock válido')
            setProcessing(false)
            return
          }
          body.stock = parseInt(bulkValue)
          break
        case 'updatePrice':
          if (!bulkValue || isNaN(parseFloat(bulkValue))) {
            toast.error('Ingresá un precio válido')
            setProcessing(false)
            return
          }
          body.price = parseFloat(bulkValue)
          break
        case 'applyDiscount':
          if (!bulkValue || isNaN(parseFloat(bulkValue))) {
            toast.error('Ingresá un porcentaje válido')
            setProcessing(false)
            return
          }
          body.discountPercent = parseFloat(bulkValue)
          break
        default:
          toast.error('Acción no válida')
          setProcessing(false)
          return
      }

      const res = await fetch('/api/products/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success(`${data.updated} productos actualizados`)
        setSelectedIds(new Set())
        setBulkAction('')
        setBulkValue('')
        router.refresh()
      } else {
        toast.error(data.message || 'Error al actualizar productos')
      }
    } catch (error) {
      toast.error('Error al procesar la acción')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Producto eliminado')
        router.refresh()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black pr-10"
          />
          {isPending && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
            </div>
          )}
          {searchQuery && !isPending && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <BrandIcon name="x" className="h-4 w-4" />
            </button>
          )}
        </div>
        {categories && categories.length > 0 && (
          <select
            name="category"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedIds.size} producto{selectedIds.size > 1 ? 's' : ''} seleccionado{selectedIds.size > 1 ? 's' : ''}
            </span>
            
            <select
              value={bulkAction}
              onChange={(e) => {
                setBulkAction(e.target.value)
                setBulkValue('')
              }}
              className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar acción...</option>
              <option value="activate">Activar</option>
              <option value="deactivate">Desactivar</option>
              <option value="setBestSeller">Marcar como Best Seller</option>
              <option value="unsetBestSeller">Quitar Best Seller</option>
              <option value="updateStock">Actualizar stock</option>
              <option value="updatePrice">Actualizar precio</option>
              <option value="applyDiscount">Aplicar descuento (%)</option>
            </select>

            {['updateStock', 'updatePrice', 'applyDiscount'].includes(bulkAction) && (
              <input
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder={
                  bulkAction === 'updateStock' ? 'Stock' :
                  bulkAction === 'updatePrice' ? 'Precio' :
                  'Porcentaje'
                }
                className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || processing}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Procesando...' : 'Aplicar'}
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-1.5 border border-blue-300 text-blue-700 rounded-lg text-sm hover:bg-blue-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === products.length && products.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">
                Categoría
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">
                Stock
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">
                Estado
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      {product.bestSeller && (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 font-medium">
                          <BrandIcon name="star" className="h-3 w-3" />
                          Best Seller
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                  {product.category?.name ?? '—'} / {product.subCategory}
                </td>
                <td className="px-4 py-3 font-medium">
                  ${typeof product.price === 'number' && !isNaN(product.price) 
                    ? product.price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                    : '0'}
                </td>
                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                  {product.stock ?? 0}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {product.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/product/${product.slug || product.id}`}
                      target="_blank"
                      className="px-3 py-1 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50"
                      title="Ver en tienda"
                    >
                      <span className="inline-flex items-center gap-1">
                        <BrandIcon name="eye" className="h-3 w-3" />
                        Ver
                      </span>
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-100"
                    >
                      Editar
                    </Link>
                    {confirmId === product.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                          {deleting === product.id ? '...' : 'Confirmar'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-100"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(product.id)}
                        className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">
                  {searchQuery ? 'No se encontraron productos' : 'No hay productos'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?page=${p}`}
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
