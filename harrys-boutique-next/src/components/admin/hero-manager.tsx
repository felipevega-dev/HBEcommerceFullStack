'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { motion, Reorder } from 'framer-motion'
import { BrandIcon } from '@/components/ui/brand-icon'

interface Product {
  id: string
  name: string
  images: string[]
}

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  image: string
  order: number
  product: { id: string; name: string }
}

interface Props {
  slides: HeroSlide[]
  products: Product[]
}

export function HeroManager({ slides: initial, products }: Props) {
  const router = useRouter()
  const [slides, setSlides] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', subtitle: '' })
  const [newSlide, setNewSlide] = useState({ title: '', subtitle: '', productId: '', image: '' })
  const [previewSlide, setPreviewSlide] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      setNewSlide((prev) => ({
        ...prev,
        productId: product.id,
        image: product.images[0] ?? '',
        title: product.name,
      }))
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSlide.productId) return toast.error('Selecciona un producto')
    setSaving(true)
    try {
      const res = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlide),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Slide añadido')
        setNewSlide({ title: '', subtitle: '', productId: '', image: '' })
        router.refresh()
      } else {
        toast.error(data.message ?? 'Error al crear slide')
      }
    } catch {
      toast.error('Error al crear slide')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/hero-slides/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSlides((prev) => prev.filter((s) => s.id !== id))
        toast.success('Slide eliminado')
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (slide: HeroSlide) => {
    setEditingId(slide.id)
    setEditForm({ title: slide.title, subtitle: slide.subtitle })
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/hero-slides/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (data.success) {
        setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...editForm } : s)))
        setEditingId(null)
        toast.success('Slide actualizado')
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const handleReorder = async (newOrder: HeroSlide[]) => {
    setSlides(newOrder)
    setIsReordering(true)
    try {
      const updates = newOrder.map((slide, index) => ({
        id: slide.id,
        order: index,
      }))
      const res = await fetch('/api/hero-slides/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: updates }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Orden actualizado')
        router.refresh()
      } else {
        toast.error(data.message ?? 'Error al reordenar')
      }
    } catch {
      toast.error('Error al reordenar')
    } finally {
      setIsReordering(false)
    }
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'

  return (
    <div className="space-y-8">
      {/* Preview Modal */}
      {previewSlide !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewSlide(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-6xl h-[600px] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fondo decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            </div>

            {/* Imagen centrada */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full h-full max-w-4xl max-h-[80%]">
                <Image
                  src={slides[previewSlide].image}
                  alt={slides[previewSlide].title}
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Gradientes para el texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Contenido de texto */}
            <div className="absolute inset-0 flex items-center px-16 pointer-events-none">
              <div className="text-white space-y-6 max-w-2xl pointer-events-auto">
                <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <p className="text-sm uppercase tracking-widest">
                    {slides[previewSlide].subtitle}
                  </p>
                </div>
                <h1 className="text-6xl font-light leading-tight drop-shadow-2xl">
                  {slides[previewSlide].title}
                </h1>
                <div className="flex gap-4">
                  <button className="bg-white text-gray-900 px-8 py-4 rounded-xl text-base font-medium hover:bg-gray-100 transition-all">
                    Comprar ahora
                  </button>
                  <button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl border border-white/20 text-base font-medium hover:bg-white/20 transition-all">
                    Ver más
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPreviewSlide(null)}
              className="absolute top-4 right-4 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full p-3 transition-colors z-10"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <form onSubmit={handleCreate} className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Añadir nuevo slide</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
              <select
                value={newSlide.productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Selecciona un producto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                value={newSlide.title}
                onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo *</label>
              <input
                value={newSlide.subtitle}
                onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            {newSlide.image && (
              <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                <Image
                  src={newSlide.image}
                  alt="preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Vista previa
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Añadiendo...
                </span>
              ) : (
                'Añadir slide'
              )}
            </button>
          </form>
        </div>

      {/* Slides list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Slides actuales</h2>
              <p className="text-sm text-gray-500">{slides.length} slide{slides.length !== 1 ? 's' : ''} configurado{slides.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {slides.length > 1 && (
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              Arrastra para reordenar
            </div>
          )}
        </div>

        {slides.length === 0 && (
          <div className="bg-white rounded-xl border-2 border-dashed p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No hay slides configurados</p>
            <p className="text-sm text-gray-400 mt-1">Añade tu primer slide usando el formulario</p>
          </div>
        )}

        <Reorder.Group axis="y" values={slides} onReorder={handleReorder} className="space-y-3">
          {slides.map((slide, index) => (
            <Reorder.Item
              key={slide.id}
              value={slide}
              className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                    {index + 1}
                  </div>
                </div>
                <div
                  className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
                  onClick={() => setPreviewSlide(index)}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === slide.id ? (
                    <div className="space-y-2">
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className={inputClass}
                        placeholder="Título"
                      />
                      <input
                        value={editForm.subtitle}
                        onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                        className={inputClass}
                        placeholder="Subtítulo"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(slide.id)}
                          className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold truncate text-gray-900">{slide.title}</p>
                      <p className="text-sm text-gray-600 truncate mt-0.5">{slide.subtitle}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">Producto:</span>
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {slide.product.name}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleEdit(slide)}
                          className="px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="inline-flex items-center gap-1">
                            <BrandIcon name="edit" className="h-3 w-3" />
                            Editar
                          </span>
                        </button>
                        <button
                          onClick={() => setPreviewSlide(index)}
                          className="px-3 py-1.5 text-xs font-medium border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <span className="inline-flex items-center gap-1">
                            <BrandIcon name="eye" className="h-3 w-3" />
                            Vista previa
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(slide.id)}
                          disabled={deleting === slide.id}
                          className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <span className="inline-flex items-center gap-1">
                            <BrandIcon
                              name={deleting === slide.id ? 'loader' : 'trash'}
                              className={`h-3 w-3 ${deleting === slide.id ? 'animate-spin' : ''}`}
                            />
                            {deleting === slide.id ? 'Eliminando...' : 'Eliminar'}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      </div>
    </div>
  )
}
