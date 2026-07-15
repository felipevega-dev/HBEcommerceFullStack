'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { BrandIcon } from '@/components/ui/brand-icon'
import type { ProductData, ValidationError, ValidationResult } from './product-wizard/types'
import {
  Step1Photos,
  Step2BasicInfo,
  Step3Pricing,
  Step4Category,
  Step5SizesColors,
  Step6Options,
} from './product-wizard/steps'
import {
  validateStep1Photos,
  validateStep2BasicInfo,
  validateStep3Pricing,
  validateStep4Category,
  validateStep5SizesColors,
  validateStep6Options,
} from './product-wizard/utils/validation-rules'

interface ProductEditFormProps {
  productId: string
  initialData: ProductData
  initialVariants: VariantDraft[]
  categories: Array<{ id: string; name: string; subcategories: string[] }>
}

interface VariantDraft {
  id?: string
  size: string
  color: string
  sku?: string | null
  stock: number
  active: boolean
}

function validationResults(data: ProductData): ValidationResult[] {
  return [
    validateStep1Photos(data.images),
    validateStep2BasicInfo(data.name, data.description, data.seoTitle, data.seoDescription),
    validateStep3Pricing(data.price, data.hasDiscount, data.originalPrice),
    validateStep4Category(data.categoryId, data.subCategory),
    validateStep5SizesColors(data.sizes, data.colors),
    validateStep6Options(data.stock, data),
  ]
}

function errorsByField(results: ValidationResult[]) {
  return results
    .flatMap((result) => result.errors)
    .reduce<Record<string, string>>((acc, error: ValidationError) => {
      if (!acc[error.field]) acc[error.field] = error.message
      return acc
    }, {})
}

async function uploadImages(images: Array<File | string>) {
  const urls: string[] = []

  for (const image of images) {
    if (typeof image === 'string') {
      urls.push(image)
      continue
    }

    const formData = new FormData()
    formData.append('images', image)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await response.json().catch(() => null)

    if (!response.ok || !data?.urls?.[0]) {
      const message = data?.results?.[0]?.error ?? data?.message ?? `No se pudo subir ${image.name}`
      throw new Error(message)
    }

    urls.push(data.urls[0])
  }

  return urls
}

function activeVariantStock(variants: VariantDraft[]) {
  return variants
    .filter((variant) => variant.active)
    .reduce((sum, variant) => sum + Math.max(0, variant.stock || 0), 0)
}

function buildPayload(data: ProductData, imageUrls: string[], variants: VariantDraft[]) {
  return {
    name: data.name.trim(),
    description: data.description.trim(),
    seoTitle: data.seoTitle?.trim() || null,
    seoDescription: data.seoDescription?.trim() || null,
    mercadoLibreUrl: data.mercadoLibreUrl?.trim() || null,
    mercadoLibreItemId: data.mercadoLibreItemId?.trim().toUpperCase() || null,
    mercadoLibreStatus: data.mercadoLibreStatus ?? 'INACTIVE',
    price: data.price,
    originalPrice: data.hasDiscount && data.originalPrice ? data.originalPrice : null,
    images: imageUrls,
    categoryId: data.categoryId,
    subCategory: data.subCategory,
    colors: data.colors,
    sizes: data.sizes,
    bestSeller: data.bestSeller,
    active: data.active,
    stock: variants.length ? activeVariantStock(variants) : data.stock,
  }
}

export function ProductEditForm({
  productId,
  initialData,
  initialVariants,
  categories,
}: ProductEditFormProps) {
  const router = useRouter()
  const [productData, setProductData] = useState<ProductData>(initialData)
  const [variants, setVariants] = useState<VariantDraft[]>(initialVariants)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [variantsTouched, setVariantsTouched] = useState(false)

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === productData.categoryId),
    [categories, productData.categoryId],
  )

  const missingVariantCombos = useMemo(() => {
    const sizes = productData.sizes.length ? productData.sizes : ['UNICA']
    const colors = productData.colors.length ? productData.colors : ['']
    const existing = new Set(variants.map((variant) => `${variant.size}::${variant.color || ''}`))

    return sizes.flatMap((size) =>
      colors.flatMap((color) => {
        const normalizedColor = color === 'Unico' ? '' : color
        return existing.has(`${size}::${normalizedColor}`)
          ? []
          : [{ size, color: normalizedColor, sku: null, stock: 0, active: true }]
      }),
    )
  }, [productData.colors, productData.sizes, variants])

  const variantSkuDuplicates = useMemo(() => {
    const seen = new Set<string>()
    const duplicates = new Set<string>()
    for (const variant of variants) {
      const sku = variant.sku?.trim()
      if (!sku) continue
      if (seen.has(sku)) duplicates.add(sku)
      seen.add(sku)
    }
    return duplicates
  }, [variants])

  const updateField = <K extends keyof ProductData>(field: K, value: ProductData[K]) => {
    setProductData((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const clearFieldError = (field: string) => {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = errorsByField(validationResults(productData))
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      toast.error('Revisá los campos marcados antes de guardar')
      const firstField = Object.keys(nextErrors)[0]
      document.querySelector<HTMLElement>(`[name="${firstField}"], #product-${firstField}`)?.focus()
      return
    }

    setSaving(true)
    try {
      const imageUrls = await uploadImages(productData.images)
      if (variantSkuDuplicates.size > 0) {
        toast.error(
          `Hay SKUs de variante repetidos: ${Array.from(variantSkuDuplicates).join(', ')}`,
        )
        return
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(productData, imageUrls, variants)),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        throw new Error(data?.message ?? 'No se pudo guardar el producto')
      }

      if (variantsTouched || variants.length > 0) {
        const variantResponse = await fetch(`/api/products/${productId}/variants`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variants }),
        })
        const variantData = await variantResponse.json().catch(() => null)

        if (!variantResponse.ok || !variantData?.success) {
          throw new Error(variantData?.message ?? 'No se pudieron guardar las variantes')
        }
      }

      toast.success('Producto actualizado')
      setVariantsTouched(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const updateVariant = (index: number, patch: Partial<VariantDraft>) => {
    setVariants((current) =>
      current.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, ...patch } : variant,
      ),
    )
    setVariantsTouched(true)
  }

  const addVariant = () => {
    setVariants((current) => [
      ...current,
      {
        size: productData.sizes[0] || 'UNICA',
        color: productData.colors[0] || '',
        stock: 0,
        sku: null,
        active: true,
      },
    ])
    setVariantsTouched(true)
  }

  const removeVariant = (index: number) => {
    setVariants((current) => current.filter((_, currentIndex) => currentIndex !== index))
    setVariantsTouched(true)
  }

  const syncMissingVariants = () => {
    setVariants((current) => [...current, ...missingVariantCombos])
    setVariantsTouched(true)
    toast.info(`${missingVariantCombos.length} variante(s) agregada(s)`)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-900">
            Volver a productos
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-gray-950">Editar producto</h1>
          <p className="mt-1 text-sm text-gray-500">
            Una sola pantalla para cambiar fotos, texto, precio, categoría, stock y estado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <BrandIcon name="save" className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Hay campos pendientes de corregir antes de guardar.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <Step1Photos productData={productData} updateField={updateField} errors={errors} />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <Step2BasicInfo
              productData={productData}
              updateField={updateField}
              errors={errors}
              clearFieldError={clearFieldError}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <Step3Pricing productData={productData} updateField={updateField} errors={errors} />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <Step6Options productData={productData} updateField={updateField} errors={errors} />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <Step4Category
              productData={productData}
              updateField={updateField}
              errors={errors}
              categories={categories}
            />
            {selectedCategory && (
              <p className="mt-4 text-xs text-gray-500">
                Categoría actual: {selectedCategory.name}
                {productData.subCategory ? ` / ${productData.subCategory}` : ''}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <Step5SizesColors productData={productData} updateField={updateField} errors={errors} />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <BrandIcon name="package" className="h-5 w-5" />
                  Stock por variante
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Edita talla, color, SKU, stock y visibilidad sin salir del producto.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Agregar variante
              </button>
            </div>

            {missingVariantCombos.length > 0 && (
              <div className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Hay {missingVariantCombos.length} combinación(es) de talla/color sin variante.
                </span>
                <button
                  type="button"
                  onClick={syncMissingVariants}
                  className="rounded-lg bg-amber-900 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800"
                >
                  Sincronizar variantes
                </button>
              </div>
            )}

            {variants.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                Este producto usa stock global. Agrega variantes si necesitas stock por talla/color.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Talla</th>
                      <th className="px-3 py-2">Color</th>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="px-3 py-2">Activa</th>
                      <th className="px-3 py-2 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {variants.map((variant, index) => (
                      <tr key={variant.id ?? index}>
                        <td className="px-3 py-2">
                          <input
                            value={variant.size}
                            onChange={(event) => updateVariant(index, { size: event.target.value })}
                            className="w-full rounded border px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={variant.color}
                            onChange={(event) =>
                              updateVariant(index, { color: event.target.value })
                            }
                            className="w-full rounded border px-2 py-1"
                            placeholder="Sin color"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={variant.sku ?? ''}
                            onChange={(event) =>
                              updateVariant(index, { sku: event.target.value || null })
                            }
                            className={`w-full rounded border px-2 py-1 ${
                              variant.sku && variantSkuDuplicates.has(variant.sku)
                                ? 'border-red-500'
                                : ''
                            }`}
                            placeholder="SKU variante"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            value={variant.stock}
                            onChange={(event) =>
                              updateVariant(index, {
                                stock: Math.max(0, Number.parseInt(event.target.value, 10) || 0),
                              })
                            }
                            className="w-24 rounded border px-2 py-1"
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
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {variants.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                Stock calculado por variantes activas:{' '}
                <span className="font-semibold text-gray-900">{activeVariantStock(variants)}</span>
              </p>
            )}
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-gray-200 bg-white/95 p-4 backdrop-blur sm:-mx-6">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <BrandIcon name="save" className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  )
}
