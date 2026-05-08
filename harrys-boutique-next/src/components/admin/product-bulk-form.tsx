'use client'

import { DragEvent, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { ImageOptimizer } from '@/components/admin/image-optimizer'

interface Category {
  id: string
  name: string
  subcategories: string[]
}

interface BulkDraft {
  id: string
  file: File
  preview: string
  name: string
  description: string
  price: string
  categoryId: string
  subCategory: string
  colors: string
  sizes: string
}

interface Props {
  categories: Category[]
}

interface BulkDefaults {
  price: string
  categoryId: string
  subCategory: string
  description: string
  colors: string
  sizes: string
}

function normalizeNameFromFile(filename: string) {
  const base = filename.replace(/\.[^/.]+$/, '')
  const cleaned = base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!cleaned) return 'Producto'
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

const SIZE_PRESETS: Record<string, string[]> = {
  Polerones: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Poleras: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Pantalones: ['28', '30', '32', '34', '36', '38', '40'],
  Zapatillas: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
  Zapatos: ['35', '36', '37', '38', '39', '40', '41', '42'],
  Botas: ['35', '36', '37', '38', '39', '40', '41', '42'],
  default: ['XS', 'S', 'M', 'L', 'XL'],
}

const ALL_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '28',
  '30',
  '32',
  '34',
  '36',
  '38',
  '40',
  '41',
  '42',
  '43',
  '44',
]
const ALL_COLORS = [
  'Negro',
  'Blanco',
  'Gris',
  'Rojo',
  'Azul',
  'Verde',
  'Rosa',
  'Morado',
  'Amarillo',
  'Naranja',
  'Beige',
  'Marrón',
]

const COLOR_PRESETS = ['Negro', 'Blanco', 'Gris', 'Rojo', 'Azul', 'Verde', 'Rosa', 'Morado']

function getSizePreset(categoryName: string): string {
  const key = Object.keys(SIZE_PRESETS).find((k) =>
    categoryName.toLowerCase().includes(k.toLowerCase()),
  )
  return key ? SIZE_PRESETS[key].join(', ') : SIZE_PRESETS.default.join(', ')
}

function getDefaultColors(): string {
  return COLOR_PRESETS.slice(0, 3).join(', ')
}

function createDraft(file: File, categories: Category[]): BulkDraft {
  const firstCategory = categories[0]
  const firstSub = firstCategory?.subcategories?.[0] ?? ''
  const categoryName = firstCategory?.name ?? ''
  const presetSizes = getSizePreset(categoryName)
  const presetColors = getDefaultColors()

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    preview: URL.createObjectURL(file),
    name: normalizeNameFromFile(file.name),
    description: 'Producto nuevo',
    price: '',
    categoryId: firstCategory?.id ?? '',
    subCategory: firstSub,
    colors: presetColors,
    sizes: presetSizes,
  }
}

export function ProductBulkForm({ categories }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<BulkDraft[]>([])
  const [saving, setSaving] = useState(false)
  const [showOptimizer, setShowOptimizer] = useState(false)
  const [defaults, setDefaults] = useState<BulkDefaults>({
    price: '',
    categoryId: categories[0]?.id ?? '',
    subCategory: categories[0]?.subcategories?.[0] ?? '',
    description: '',
    colors: getDefaultColors(),
    sizes: getSizePreset(categories[0]?.name ?? ''),
  })

  const canSave = useMemo(() => {
    if (items.length === 0) return false
    return items.every((item) => {
      return (
        item.name.trim().length > 0 &&
        item.description.trim().length > 0 &&
        Number(item.price) > 0 &&
        item.categoryId &&
        item.subCategory &&
        item.colors.trim().length > 0 &&
        item.sizes.trim().length > 0
      )
    })
  }, [items])

  const defaultSubcategories =
    categories.find((cat) => cat.id === defaults.categoryId)?.subcategories ?? []

  const upsertFiles = (files: FileList | null) => {
    if (!files?.length) return
    const next = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => createDraft(file, categories))

    if (next.length === 0) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    setItems((prev) => [...prev, ...next])
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    upsertFiles(event.dataTransfer.files)
  }

  const updateItem = (id: string, patch: Partial<BulkDraft>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const applyDefaultsToAll = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        price: defaults.price || item.price,
        categoryId: defaults.categoryId || item.categoryId,
        subCategory: defaults.subCategory || item.subCategory,
        description: defaults.description || item.description,
        colors: defaults.colors || item.colors,
        sizes: defaults.sizes || item.sizes,
      })),
    )
    toast.success('Valores aplicados a todos los productos')
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((item) => item.id !== id)
    })
  }

  const uploadAllImages = async () => {
    const formData = new FormData()
    for (const item of items) formData.append('images', item.file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (
      !response.ok ||
      !data.success ||
      !Array.isArray(data.urls) ||
      data.urls.length !== items.length
    ) {
      throw new Error(data.message ?? 'No se pudieron subir todas las imágenes')
    }

    return data.urls as string[]
  }

  const handleSubmit = async () => {
    if (!canSave) {
      toast.error('Completa todos los campos obligatorios')
      return
    }

    setSaving(true)
    try {
      const uploadedUrls = await uploadAllImages()
      const payload = {
        products: items.map((item, index) => ({
          name: item.name.trim(),
          description: item.description.trim(),
          price: Number(item.price),
          images: [uploadedUrls[index]],
          categoryId: item.categoryId,
          subCategory: item.subCategory,
          colors: item.colors
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
          sizes: item.sizes
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        })),
      }

      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message ?? 'No se pudieron crear los productos')
      }

      toast.success(`${data.created ?? items.length} productos creados correctamente`)
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado al crear productos'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl border border-dashed border-gray-300 bg-white p-6"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
          <span className="text-lg font-medium text-gray-900">Arrastra o selecciona imágenes</span>
          <span className="text-sm text-gray-500">
            Puedes cargar muchas fotos para crear productos en lote
          </span>
          <span className="rounded-lg bg-black px-4 py-2 text-sm text-white">
            Seleccionar imágenes
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => upsertFiles(e.target.files)}
          />
        </label>
      </div>

      {items.length > 0 ? (
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium text-gray-800">
            Aplicar valores rapidos a todos
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="number"
              min="1"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Precio para todos"
              value={defaults.price}
              onChange={(e) => setDefaults((prev) => ({ ...prev, price: e.target.value }))}
            />
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={defaults.categoryId}
              onChange={(e) => {
                const categoryId = e.target.value
                const category = categories.find((cat) => cat.id === categoryId)
                setDefaults((prev) => ({
                  ...prev,
                  categoryId,
                  subCategory: category?.subcategories?.[0] ?? '',
                }))
              }}
            >
              <option value="">Categoria para todos</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={defaults.subCategory}
              onChange={(e) => setDefaults((prev) => ({ ...prev, subCategory: e.target.value }))}
            >
              <option value="">Subcategoria para todos</option>
              {defaultSubcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:col-span-2"
              placeholder="Descripcion para todos"
              value={defaults.description}
              onChange={(e) => setDefaults((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Colores para todos</p>
              <div className="flex flex-wrap gap-2">
                {ALL_COLORS.map((color) => {
                  const selected = defaults.colors
                    .split(',')
                    .map((c) => c.trim())
                    .filter(Boolean)
                  const isSelected = selected.includes(color)

                  return (
                    <button
                      key={color}
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => {
                        const current = defaults.colors
                          .split(',')
                          .map((c) => c.trim())
                          .filter(Boolean)
                        const updated = isSelected
                          ? current.filter((c) => c !== color)
                          : [...current, color]
                        setDefaults((prev) => ({ ...prev, colors: updated.join(', ') }))
                      }}
                    >
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Tallas para todos</p>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => {
                  const selected = defaults.sizes
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                  const isSelected = selected.includes(size)

                  return (
                    <button
                      key={size}
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => {
                        const current = defaults.sizes
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                        const updated = isSelected
                          ? current.filter((s) => s !== size)
                          : [...current, size]
                        setDefaults((prev) => ({ ...prev, sizes: updated.join(', ') }))
                      }}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
              onClick={applyDefaultsToAll}
            >
              Aplicar a todos
            </button>
          </div>
        </div>
      ) : null}

      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => {
            const selectedCategory = categories.find((cat) => cat.id === item.categoryId)
            const availableSubcategories = selectedCategory?.subcategories ?? []

            return (
              <div key={item.id} className="rounded-xl border bg-white p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <div className="md:col-span-1">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <Image src={item.preview} alt={item.name} fill className="object-cover" />
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Titulo"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      />
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Precio"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, { price: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Colores</p>
                      <div className="flex flex-wrap gap-2">
                        {ALL_COLORS.map((color) => {
                          const selected = item.colors
                            .split(',')
                            .map((c) => c.trim())
                            .filter(Boolean)
                          const isSelected = selected.includes(color)
                          return (
                            <button
                              key={color}
                              type="button"
                              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                isSelected
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                              }`}
                              onClick={() => {
                                const current = item.colors
                                  .split(',')
                                  .map((c) => c.trim())
                                  .filter(Boolean)
                                const updated = isSelected
                                  ? current.filter((c) => c !== color)
                                  : [...current, color]
                                updateItem(item.id, { colors: updated.join(', ') })
                              }}
                            >
                              {color}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Tallas</p>
                      <div className="flex flex-wrap gap-2">
                        {ALL_SIZES.map((size) => {
                          const selected = item.sizes
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                          const isSelected = selected.includes(size)
                          return (
                            <button
                              key={size}
                              type="button"
                              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                isSelected
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                              }`}
                              onClick={() => {
                                const current = item.sizes
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                                const updated = isSelected
                                  ? current.filter((s) => s !== size)
                                  : [...current, size]
                                updateItem(item.id, { sizes: updated.join(', ') })
                              }}
                            >
                              {size}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Descripcion corta"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    />

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={item.categoryId}
                        onChange={(e) => {
                          const categoryId = e.target.value
                          const category = categories.find((cat) => cat.id === categoryId)
                          updateItem(item.id, {
                            categoryId,
                            subCategory: category?.subcategories?.[0] ?? '',
                          })
                        }}
                      >
                        <option value="">Selecciona categoria</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>

                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={item.subCategory}
                        onChange={(e) => updateItem(item.id, { subCategory: e.target.value })}
                      >
                        <option value="">Selecciona subcategoria</option>
                        {availableSubcategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowOptimizer(!showOptimizer)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {showOptimizer ? 'Cerrar optimizador' : 'Optimizar todas las imágenes'}
          </button>
        </div>
      )}

      {showOptimizer && items.length > 0 && (
        <ImageOptimizer
          images={items.map((item) => item.file)}
          onImagesChange={(processedImages) => {
            setItems((prev) =>
              prev.map((item, idx) => {
                const processed = processedImages[idx]
                const preview =
                  processed instanceof File
                    ? URL.createObjectURL(processed)
                    : typeof processed === 'string'
                      ? processed
                      : item.preview

                return {
                  ...item,
                  file: processed instanceof File ? processed : item.file,
                  preview,
                }
              }),
            )
            setShowOptimizer(false)
          }}
        />
      )}

      <div className="flex items-center justify-between rounded-xl border bg-white p-4">
        <p className="text-sm text-gray-600">{items.length} producto(s) listos para crear</p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSave || saving}
          className="rounded-lg bg-black px-5 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {saving ? 'Creando...' : `Crear ${items.length} productos`}
        </button>
      </div>
    </div>
  )
}
