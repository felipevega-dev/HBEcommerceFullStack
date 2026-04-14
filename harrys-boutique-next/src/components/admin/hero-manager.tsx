'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

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

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div>
        <form onSubmit={handleCreate} className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Añadir nuevo slide</h2>
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
            <div className="relative h-40 rounded-lg overflow-hidden bg-gray-100">
              <Image src={newSlide.image} alt="preview" fill className="object-cover" />
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Añadiendo...' : 'Añadir slide'}
          </button>
        </form>
      </div>

      {/* Slides list */}
      <div className="space-y-4">
        <h2 className="font-semibold">Slides actuales ({slides.length})</h2>
        {slides.length === 0 && (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
            No hay slides
          </div>
        )}
        {slides.map((slide) => (
          <div key={slide.id} className="bg-white rounded-xl border overflow-hidden">
            <div className="flex gap-4 p-4">
              <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image src={slide.image} alt={slide.title} fill className="object-cover" />
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
                        className="px-3 py-1 bg-black text-white rounded-lg text-xs hover:bg-gray-800"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 border rounded-lg text-xs hover:bg-gray-100"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-medium truncate">{slide.title}</p>
                    <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
                    <p className="text-xs text-gray-400 mt-1">Producto: {slide.product.name}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(slide)}
                        className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        disabled={deleting === slide.id}
                        className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        {deleting === slide.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
