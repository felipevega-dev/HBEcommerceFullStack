'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-toastify'

interface Category {
  id: string
  name: string
  subcategories: string[]
}

interface ProductData {
  id?: string
  name: string
  description: string
  price: number
  originalPrice?: number | null
  images: string[]
  categoryId: string
  subCategory: string
  colors: string[]
  sizes: string[]
  bestSeller: boolean
  active: boolean
  stock?: number
}

interface Props {
  categories: Category[]
  product?: ProductData
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL']
const AVAILABLE_COLORS = [
  { name: 'Negro', hex: '#000000' },
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Rojo', hex: '#FF0000' },
  { name: 'Azul', hex: '#0000FF' },
  { name: 'Verde', hex: '#008000' },
  { name: 'Amarillo', hex: '#FFFF00' },
  { name: 'Rosa', hex: '#FFC0CB' },
  { name: 'Morado', hex: '#800080' },
  { name: 'Naranja', hex: '#FFA500' },
  { name: 'Marrón', hex: '#8B4513' },
  { name: 'Beige', hex: '#F5F5DC' },
]

export function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const isEdit = !!product?.id
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice?.toString() ?? '')
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '')
  const [subCategory, setSubCategory] = useState(product?.subCategory ?? '')
  const [colors, setColors] = useState<string[]>(product?.colors ?? [])
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? [])
  const [bestSeller, setBestSeller] = useState(product?.bestSeller ?? false)
  const [active, setActive] = useState(product?.active ?? true)
  const [stock, setStock] = useState(product?.stock?.toString() ?? '0')
  const [currentImages, setCurrentImages] = useState<string[]>(product?.images ?? [])
  const [newImagePreviews, setNewImagePreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedCategory = categories.find((c) => c.id === categoryId)

  const toggleSize = (s: string) =>
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const toggleColor = (c: string) =>
    setColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setNewImagePreviews((prev) => {
        const next = [...prev]
        next[index] = reader.result as string
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  const uploadImages = async (): Promise<string[]> => {
    const uploaded: string[] = []
    for (let i = 0; i < 4; i++) {
      const input = fileInputRefs.current[i]
      if (!input?.files?.[0]) continue
      const fd = new FormData()
      fd.append('file', input.files[0])
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) uploaded.push(data.url)
      else throw new Error('Error al subir imagen')
    }
    return uploaded
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) return toast.error('Selecciona una categoría')
    if (!subCategory) return toast.error('Selecciona una subcategoría')
    if (colors.length === 0) return toast.error('Selecciona al menos un color')
    if (sizes.length === 0) return toast.error('Selecciona al menos una talla')
    if (currentImages.length === 0 && !fileInputRefs.current[0]?.files?.[0])
      return toast.error('Se requiere al menos una imagen')

    setSaving(true)
    setUploading(true)
    try {
      const newUrls = await uploadImages()
      setUploading(false)
      const allImages = [...currentImages, ...newUrls].slice(0, 4)

      const body = {
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        images: allImages,
        categoryId,
        subCategory,
        colors,
        sizes,
        bestSeller,
        active,
        stock: parseInt(stock) || 0,
      }

      const url = isEdit ? `/api/products/${product!.id}` : '/api/products'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
        router.push('/admin/products')
        router.refresh()
      } else {
        toast.error(data.message ?? 'Error al guardar')
      }
    } catch (err) {
      toast.error('Error al guardar el producto')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Images */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6 space-y-4 sticky top-6">
            <h2 className="font-semibold">Imágenes del producto</h2>

            {/* Current images */}
            {currentImages.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Imágenes actuales</p>
                <div className="grid grid-cols-2 gap-2">
                  {currentImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={img}
                          alt={`img-${i}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 200px"
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New image slots */}
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {currentImages.length > 0 ? 'Agregar más imágenes' : 'Subir imágenes'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <label key={i} className="cursor-pointer">
                    <div className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center overflow-hidden bg-gray-50">
                      {newImagePreviews[i] ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={newImagePreviews[i]!}
                            alt="preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-2xl">+</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => {
                        fileInputRefs.current[i] = el
                      }}
                      onChange={(e) => handleImageChange(e, i)}
                    />
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Máximo 4 imágenes. La primera será la principal.
              </p>
            </div>
          </div>
        </div>

        {/* Right columns - Form fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold">Información básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Ej: Polerón Naruto Uzumaki"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={inputClass}
                  placeholder="Describe el producto, sus características, materiales, etc."
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold">Precios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de venta *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`${inputClass} pl-7`}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio original
                  <span className="text-xs text-gray-400 ml-1">(opcional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className={`${inputClass} pl-7`}
                    min="0"
                    step="0.01"
                    placeholder="Para mostrar descuento"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock disponible</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className={inputClass}
                  min="0"
                  step="1"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold">Categoría</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría principal *</label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value)
                    setSubCategory('')
                  }}
                  className={inputClass}
                  required
                >
                  <option value="">Selecciona una categoría...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría *</label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className={inputClass}
                  required
                  disabled={!categoryId}
                >
                  <option value="">Selecciona una subcategoría...</option>
                  {selectedCategory?.subcategories.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sizes & Colors */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold">Variantes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Tallas disponibles *</p>
                <div className="flex gap-2 flex-wrap">
                  {AVAILABLE_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${sizes.includes(s) ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Colores disponibles *</p>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_COLORS.map(({ name: colorName, hex }) => (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => toggleColor(colorName)}
                      className={`px-3 py-2 rounded-lg text-xs transition-all border ${colors.includes(colorName) ? 'ring-2 ring-black ring-offset-1' : 'border-gray-200'}`}
                      style={{
                        backgroundColor: colors.includes(colorName) ? hex : 'white',
                        color:
                          colors.includes(colorName) &&
                          ['Blanco', 'Amarillo', 'Beige'].includes(colorName)
                            ? 'black'
                            : colors.includes(colorName)
                              ? 'white'
                              : 'black',
                      }}
                    >
                      {colorName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-xl border p-6 space-y-3">
            <h2 className="font-semibold">Opciones adicionales</h2>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                  className="w-5 h-5"
                />
                <div>
                  <span className="text-sm font-medium">Marcar como Más Vendido</span>
                  <p className="text-xs text-gray-500">Se mostrará con una insignia especial</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-5 h-5"
                />
                <div>
                  <span className="text-sm font-medium">Producto activo</span>
                  <p className="text-xs text-gray-500">Visible en la tienda para los clientes</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end bg-white rounded-xl border p-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading
                ? 'Subiendo imágenes...'
                : saving
                  ? 'Guardando...'
                  : isEdit
                    ? 'Guardar cambios'
                    : 'Crear producto'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
