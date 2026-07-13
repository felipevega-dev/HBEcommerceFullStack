'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
  variantCount?: number
}

interface Category {
  id: string
  name: string
  subcategories: string[]
}

interface Props {
  products: Product[]
  total: number
  page: number
  limit: number
  categories?: Category[]
}

type QuickEditPatch = Partial<Pick<Product, 'price' | 'stock' | 'active' | 'bestSeller'>>

interface VariantDraft {
  id?: string
  size: string
  color: string
  stock: number
  sku?: string | null
  active: boolean
}

function formatPrice(value: number) {
  return value.toLocaleString('es-CL', { maximumFractionDigits: 0 })
}

export function AdminProductList({
  products: initialProducts,
  total,
  page,
  limit,
  categories = [],
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [products, setProducts] = useState(initialProducts)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState('')
  const [bulkValue, setBulkValue] = useState('')
  const [bulkCategoryId, setBulkCategoryId] = useState('')
  const [bulkSubCategory, setBulkSubCategory] = useState('')
  const [processing, setProcessing] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [variantProduct, setVariantProduct] = useState<Product | null>(null)
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>([])
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [savingVariants, setSavingVariants] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  useEffect(() => setProducts(initialProducts), [initialProducts])

  const totalPages = Math.ceil(total / limit)
  const searchParamsString = searchParams.toString()
  const categoryFilter = searchParams.get('category') || ''
  const subCategoryFilter = searchParams.get('subCategory') || ''
  const statusFilter = searchParams.get('status') || ''
  const stockFilter = searchParams.get('stock') || ''
  const bestSellerFilter = searchParams.get('bestSeller') || ''

  const availableSubcategories = useMemo(() => {
    const source = !categoryFilter
      ? categories.flatMap((category) => category.subcategories)
      : categories.find((category) => category.name === categoryFilter)?.subcategories ?? []

    return Array.from(new Set(source))
  }, [categories, categoryFilter])

  const bulkSubcategories = useMemo(() => {
    const source = categories.find((category) => category.id === bulkCategoryId)?.subcategories ?? []
    return Array.from(new Set(source))
  }, [bulkCategoryId, categories])

  const buildListHref = (nextPage?: number) => {
    const params = new URLSearchParams(searchParamsString)
    if (nextPage) params.set('page', String(nextPage))
    return `/admin/products${params.toString() ? `?${params.toString()}` : ''}`
  }

  const pushFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParamsString)
    if (value) params.set(key, value)
    else params.delete(key)
    if (key === 'category') params.delete('subCategory')
    params.delete('page')

    startTransition(() => {
      router.push(`/admin/products${params.toString() ? `?${params.toString()}` : ''}`)
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParamsString)
      if (searchQuery) params.set('search', searchQuery)
      else params.delete('search')
      params.delete('page')

      startTransition(() => {
        router.push(`/admin/products${params.toString() ? `?${params.toString()}` : ''}`)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [router, searchParamsString, searchQuery, startTransition])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === products.length) return new Set()
      return new Set(products.map((product) => product.id))
    })
  }

  const saveQuickEdit = async (product: Product, patch: QuickEditPatch) => {
    const previous = products
    setSavingId(product.id)
    setProducts((current) =>
      current.map((item) => (item.id === product.id ? { ...item, ...patch } : item)),
    )

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? 'No se pudo guardar el producto')
      }

      toast.success('Producto actualizado')
      router.refresh()
    } catch (error) {
      setProducts(previous)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar producto')
    } finally {
      setSavingId(null)
    }
  }

  const handleBulkAction = async () => {
    if (selectedIds.size === 0) {
      toast.error('Selecciona al menos un producto')
      return
    }

    if (!bulkAction) {
      toast.error('Selecciona una acción')
      return
    }

    setProcessing(true)
    try {
      const ids = Array.from(selectedIds)
      const body: Record<string, unknown> = { ids }

      switch (bulkAction) {
        case 'delete':
          body.delete = true
          break
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
          if (!bulkValue || Number.isNaN(Number.parseInt(bulkValue, 10))) {
            toast.error('Ingresa un stock válido')
            setProcessing(false)
            return
          }
          body.stock = Number.parseInt(bulkValue, 10)
          break
        case 'updatePrice':
          if (!bulkValue || Number.isNaN(Number.parseFloat(bulkValue))) {
            toast.error('Ingresa un precio válido')
            setProcessing(false)
            return
          }
          body.price = Number.parseFloat(bulkValue)
          break
        case 'applyDiscount':
          if (!bulkValue || Number.isNaN(Number.parseFloat(bulkValue))) {
            toast.error('Ingresa un porcentaje válido')
            setProcessing(false)
            return
          }
          body.discountPercent = Number.parseFloat(bulkValue)
          break
        case 'changeCategory':
          if (!bulkCategoryId || !bulkSubCategory) {
            toast.error('Selecciona categoría y subcategoría')
            setProcessing(false)
            return
          }
          body.categoryId = bulkCategoryId
          body.subCategory = bulkSubCategory
          break
        default:
          toast.error('Acción no válida')
          setProcessing(false)
          return
      }

      const response = await fetch('/api/products/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? 'Error al actualizar productos')
      }

      toast.success(data.message || `${data.updated} productos actualizados`)
      setSelectedIds(new Set())
      setBulkAction('')
      setBulkValue('')
      setBulkCategoryId('')
      setBulkSubCategory('')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar la acción')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message ?? 'Error al eliminar')
      toast.success('Producto eliminado')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar')
    } finally {
      setDeleting(null)
      setConfirmId(null)
    }
  }

  const handleDuplicate = async (id: string) => {
    setDuplicating(id)
    try {
      const response = await fetch(`/api/products/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al duplicar el producto')
      }
      toast.success('Producto duplicado como borrador')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al duplicar el producto')
    } finally {
      setDuplicating(null)
    }
  }

  const openVariantEditor = async (product: Product) => {
    setVariantProduct(product)
    setVariantDrafts([])
    setLoadingVariants(true)
    try {
      const response = await fetch(`/api/products/${product.id}/variants`)
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message ?? 'No se pudieron cargar las variantes')
      }
      setVariantDrafts(data.product.variants)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar variantes')
      setVariantProduct(null)
    } finally {
      setLoadingVariants(false)
    }
  }

  const updateVariant = (index: number, patch: Partial<VariantDraft>) => {
    setVariantDrafts((current) =>
      current.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, ...patch } : variant,
      ),
    )
  }

  const addVariant = () => {
    setVariantDrafts((current) => [
      ...current,
      { size: 'ÚNICA', color: '', stock: 0, sku: null, active: true },
    ])
  }

  const removeVariant = (index: number) => {
    setVariantDrafts((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }

  const saveVariants = async () => {
    if (!variantProduct) return
    setSavingVariants(true)
    try {
      const response = await fetch(`/api/products/${variantProduct.id}/variants`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants: variantDrafts }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message ?? 'No se pudieron guardar las variantes')
      }
      toast.success('Variantes actualizadas')
      setVariantProduct(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar variantes')
    } finally {
      setSavingVariants(false)
    }
  }

  const renderRowActions = (product: Product) => (
    <div className="flex flex-wrap justify-end gap-2">
      <Link
        href={`/product/${product.slug || product.id}`}
        target="_blank"
        className="rounded-lg border border-blue-200 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50"
        title="Ver en tienda"
      >
        <span className="inline-flex items-center gap-1">
          <BrandIcon name="eye" className="h-3 w-3" />
          Ver
        </span>
      </Link>
      <Link
        href={`/admin/products/${product.id}/edit`}
        className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-100"
      >
        Editar
      </Link>
      <button
        onClick={() => handleDuplicate(product.id)}
        disabled={duplicating === product.id}
        className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-100 disabled:opacity-50"
      >
        {duplicating === product.id ? '...' : 'Duplicar'}
      </button>
      <button
        onClick={() => void openVariantEditor(product)}
        className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-100"
      >
        Variantes
      </button>
      {confirmId === product.id ? (
        <>
          <button
            onClick={() => handleDelete(product.id)}
            disabled={deleting === product.id}
            className="rounded-lg bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
          >
            {deleting === product.id ? '...' : 'Confirmar'}
          </button>
          <button
            onClick={() => setConfirmId(null)}
            className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-100"
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirmId(product.id)}
          className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          Eliminar
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 xl:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          {isPending && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-black" />
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
        <select
          value={categoryFilter}
          onChange={(event) => pushFilter('category', event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={subCategoryFilter}
          onChange={(event) => pushFilter('subCategory', event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todas las subcategorías</option>
          {availableSubcategories.map((subCategory) => (
            <option key={subCategory} value={subCategory}>
              {subCategory}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => pushFilter('status', event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <select
          value={stockFilter}
          onChange={(event) => pushFilter('stock', event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todo el stock</option>
          <option value="out">Sin stock</option>
          <option value="low">Stock bajo (1-5)</option>
          <option value="available">Disponible (+5)</option>
        </select>
        <select
          value={bestSellerFilter}
          onChange={(event) => pushFilter('bestSeller', event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todos</option>
          <option value="true">Best sellers</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedIds.size} producto{selectedIds.size > 1 ? 's' : ''} seleccionado
              {selectedIds.size > 1 ? 's' : ''}
            </span>
            <select
              value={bulkAction}
              onChange={(event) => {
                setBulkAction(event.target.value)
                setBulkValue('')
                setBulkCategoryId('')
                setBulkSubCategory('')
              }}
              className="rounded-lg border border-blue-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar acción...</option>
              <option value="delete">Eliminar definitivamente</option>
              <option value="activate">Activar</option>
              <option value="deactivate">Desactivar</option>
              <option value="setBestSeller">Marcar como Best Seller</option>
              <option value="unsetBestSeller">Quitar Best Seller</option>
              <option value="updateStock">Actualizar stock</option>
              <option value="updatePrice">Actualizar precio</option>
              <option value="applyDiscount">Aplicar descuento (%)</option>
              <option value="changeCategory">Cambiar categoría</option>
            </select>
            {['updateStock', 'updatePrice', 'applyDiscount'].includes(bulkAction) && (
              <input
                type="number"
                value={bulkValue}
                onChange={(event) => setBulkValue(event.target.value)}
                placeholder={
                  bulkAction === 'updateStock'
                    ? 'Stock'
                    : bulkAction === 'updatePrice'
                      ? 'Precio'
                      : 'Porcentaje'
                }
                className="w-32 rounded-lg border border-blue-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {bulkAction === 'changeCategory' && (
              <>
                <select
                  value={bulkCategoryId}
                  onChange={(event) => {
                    setBulkCategoryId(event.target.value)
                    setBulkSubCategory('')
                  }}
                  className="rounded-lg border border-blue-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  value={bulkSubCategory}
                  onChange={(event) => setBulkSubCategory(event.target.value)}
                  className="rounded-lg border border-blue-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Subcategoría</option>
                  {bulkSubcategories.map((subCategory) => (
                    <option key={subCategory} value={subCategory}>
                      {subCategory}
                    </option>
                  ))}
                </select>
              </>
            )}
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || processing}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? 'Procesando...' : 'Aplicar'}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg border border-blue-300 px-4 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="hidden overflow-hidden rounded-xl border bg-white md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === products.length && products.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Producto</th>
              <th className="hidden px-4 py-3 text-left font-medium text-gray-600 lg:table-cell">
                Categoría
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Precio</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Stock</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
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
                    className="h-4 w-4 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="line-clamp-1 font-medium">{product.name}</p>
                      {product.bestSeller && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600">
                          <BrandIcon name="star" className="h-3 w-3" />
                          Best Seller
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-gray-600 lg:table-cell">
                  {product.category?.name ?? '-'} / {product.subCategory}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    value={Math.round(product.price)}
                    disabled={savingId === product.id}
                    onChange={(event) =>
                      setProducts((current) =>
                        current.map((item) =>
                          item.id === product.id
                            ? { ...item, price: Number(event.target.value) || 0 }
                            : item,
                        ),
                      )
                    }
                    onBlur={(event) => {
                      const nextPrice = Number(event.target.value)
                      if (
                        Number.isFinite(nextPrice) &&
                        nextPrice > 0 &&
                        nextPrice !== initialProducts.find((item) => item.id === product.id)?.price
                      ) {
                        void saveQuickEdit(product, { price: nextPrice })
                      }
                    }}
                    className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    value={product.stock}
                    disabled={savingId === product.id || Boolean(product.variantCount)}
                    onChange={(event) =>
                      setProducts((current) =>
                        current.map((item) =>
                          item.id === product.id
                            ? { ...item, stock: Number.parseInt(event.target.value, 10) || 0 }
                            : item,
                        ),
                      )
                    }
                    onBlur={(event) => {
                      const nextStock = Number.parseInt(event.target.value, 10)
                      if (
                        Number.isFinite(nextStock) &&
                        nextStock !== initialProducts.find((item) => item.id === product.id)?.stock
                      ) {
                        void saveQuickEdit(product, { stock: nextStock })
                      }
                    }}
                    title={product.variantCount ? 'Edita el stock desde Variantes' : undefined}
                    className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={product.active}
                        disabled={savingId === product.id}
                        onChange={(event) =>
                          void saveQuickEdit(product, { active: event.target.checked })
                        }
                      />
                      Activo
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={product.bestSeller}
                        disabled={savingId === product.id}
                        onChange={(event) =>
                          void saveQuickEdit(product, { bestSeller: event.target.checked })
                        }
                      />
                      Best Seller
                    </label>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">{renderRowActions(product)}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  {searchQuery ? 'No se encontraron productos' : 'No hay productos'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {products.map((product) => (
          <div key={product.id} className="rounded-xl border bg-white p-4">
            <div className="flex gap-3">
              <input
                type="checkbox"
                checked={selectedIds.has(product.id)}
                onChange={() => toggleSelect(product.id)}
                className="mt-1 h-4 w-4"
              />
              {product.images[0] && (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">
                  {product.category?.name ?? '-'} / {product.subCategory}
                </p>
                <p className="text-sm font-medium">
                  ${formatPrice(product.price)} · Stock {product.stock}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <button
                onClick={() => void saveQuickEdit(product, { active: !product.active })}
                className={`rounded-lg border px-3 py-2 ${
                  product.active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                }`}
              >
                {product.active ? 'Activo' : 'Inactivo'}
              </button>
              <button
                onClick={() => void saveQuickEdit(product, { bestSeller: !product.bestSeller })}
                className={`rounded-lg border px-3 py-2 ${
                  product.bestSeller ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-600'
                }`}
              >
                Best Seller
              </button>
            </div>
            <div className="mt-3">{renderRowActions(product)}</div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildListHref(p)}
              className={`rounded-lg border px-3 py-1 text-sm ${
                p === page ? 'border-black bg-black text-white' : 'hover:bg-gray-100'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}

      {variantProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Stock por variante</h2>
                <p className="text-sm text-gray-500">{variantProduct.name}</p>
              </div>
              <button
                onClick={() => setVariantProduct(null)}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>

            {loadingVariants ? (
              <div className="py-10 text-center text-sm text-gray-500">Cargando variantes...</div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-auto rounded-lg border">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-3 py-2">Talla</th>
                        <th className="px-3 py-2">Color</th>
                        <th className="px-3 py-2">Stock</th>
                        <th className="px-3 py-2">SKU</th>
                        <th className="px-3 py-2">Activa</th>
                        <th className="px-3 py-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {variantDrafts.map((variant, index) => (
                        <tr key={variant.id ?? index}>
                          <td className="px-3 py-2">
                            <input
                              value={variant.size}
                              onChange={(event) =>
                                updateVariant(index, { size: event.target.value })
                              }
                              className="w-full rounded-lg border px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={variant.color}
                              onChange={(event) =>
                                updateVariant(index, { color: event.target.value })
                              }
                              className="w-full rounded-lg border px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(event) =>
                                updateVariant(index, {
                                  stock: Math.max(0, Number.parseInt(event.target.value, 10) || 0),
                                })
                              }
                              className="w-24 rounded-lg border px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={variant.sku ?? ''}
                              onChange={(event) =>
                                updateVariant(index, { sku: event.target.value })
                              }
                              className="w-full rounded-lg border px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={variant.active}
                              onChange={(event) =>
                                updateVariant(index, { active: event.target.checked })
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => removeVariant(index)}
                              className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-gray-600">
                    Stock total:{' '}
                    {variantDrafts
                      .filter((variant) => variant.active)
                      .reduce((sum, variant) => sum + variant.stock, 0)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={addVariant}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Agregar variante
                    </button>
                    <button
                      onClick={() => void saveVariants()}
                      disabled={savingVariants || variantDrafts.length === 0}
                      className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:bg-gray-300"
                    >
                      {savingVariants ? 'Guardando...' : 'Guardar variantes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
