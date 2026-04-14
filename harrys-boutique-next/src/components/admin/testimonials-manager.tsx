'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

interface Testimonial {
  id: string
  name: string
  role: string
  comment: string
  rating: number
  active: boolean
  order: number
}

interface Props {
  testimonials: Testimonial[]
}

const EMPTY_FORM = { name: '', role: '', comment: '', rating: 5 }

export function TestimonialsManager({ testimonials }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.comment.trim()) {
      toast.error('Nombre y comentario son requeridos')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Testimonio creado')
        setForm(EMPTY_FORM)
        setShowForm(false)
        router.refresh()
      } else {
        toast.error(data.message ?? 'Error al crear')
      }
    } catch {
      toast.error('Error al crear el testimonio')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string, active: boolean) => {
    setToggling(id)
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(active ? 'Testimonio activado' : 'Testimonio desactivado')
        router.refresh()
      } else {
        toast.error(data.message ?? 'Error')
      }
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este testimonio?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Testimonio eliminado')
        router.refresh()
      } else {
        toast.error(data.message ?? 'Error')
      }
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'

  return (
    <div className="space-y-6">
      {/* Add button */}
      <button
        onClick={() => setShowForm((v) => !v)}
        className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
      >
        {showForm ? 'Cancelar' : '+ Nuevo testimonio'}
      </button>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Nuevo testimonio</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
                placeholder="María García"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rol / Descripción</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className={inputClass}
                placeholder="Dueña de Harry"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Comentario *</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              className={inputClass}
              rows={3}
              placeholder="Excelente producto..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Calificación</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, rating: s }))}
                  className={`text-2xl transition-transform hover:scale-110 ${s <= form.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar testimonio'}
          </button>
        </form>
      )}

      {/* List */}
      <div className="space-y-3">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className={`bg-white rounded-xl border p-4 flex gap-4 items-start ${!t.active ? 'opacity-60' : ''}`}
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{t.name}</span>
                {t.role && <span className="text-xs text-gray-400">{t.role}</span>}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                >
                  {t.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={`text-sm ${s <= t.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 italic">&ldquo;{t.comment}&rdquo;</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleToggle(t.id, !t.active)}
                disabled={toggling === t.id}
                className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {t.active ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                disabled={deleting === t.id}
                className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {testimonials.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
            No hay testimonios. Creá el primero.
          </div>
        )}
      </div>
    </div>
  )
}
