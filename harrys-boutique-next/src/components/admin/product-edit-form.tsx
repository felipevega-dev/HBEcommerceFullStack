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
  categories: Array<{ id: string; name: string; subcategories: string[] }>
}

function validationResults(data: ProductData): ValidationResult[] {
  return [
    validateStep1Photos(data.images),
    validateStep2BasicInfo(data.name, data.description, data.seoTitle, data.seoDescription),
    validateStep3Pricing(data.price, data.hasDiscount, data.originalPrice),
    validateStep4Category(data.categoryId, data.subCategory),
    validateStep5SizesColors(data.sizes, data.colors),
    validateStep6Options(data.stock),
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

function buildPayload(data: ProductData, imageUrls: string[]) {
  return {
    name: data.name.trim(),
    description: data.description.trim(),
    seoTitle: data.seoTitle?.trim() || null,
    seoDescription: data.seoDescription?.trim() || null,
    price: data.price,
    originalPrice: data.hasDiscount && data.originalPrice ? data.originalPrice : null,
    images: imageUrls,
    categoryId: data.categoryId,
    subCategory: data.subCategory,
    colors: data.colors,
    sizes: data.sizes,
    bestSeller: data.bestSeller,
    active: data.active,
    stock: data.stock,
  }
}

export function ProductEditForm({ productId, initialData, categories }: ProductEditFormProps) {
  const router = useRouter()
  const [productData, setProductData] = useState<ProductData>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === productData.categoryId),
    [categories, productData.categoryId],
  )

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
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(productData, imageUrls)),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        throw new Error(data?.message ?? 'No se pudo guardar el producto')
      }

      toast.success('Producto actualizado')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar el producto')
    } finally {
      setSaving(false)
    }
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
