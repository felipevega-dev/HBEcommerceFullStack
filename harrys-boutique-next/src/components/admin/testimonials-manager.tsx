'use client'

import { useState, useMemo, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Search, Plus, X, Edit2, Save, GripVertical, Eye, Star, Check, XCircle } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: string
  comment: string
  rating: number
  active: boolean
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  order: number
  avatar?: string | null
}

interface Props {
  testimonials: Testimonial[]
}

const EMPTY_FORM = { name: '', role: '', comment: '', rating: 5, avatar: '' }

export function TestimonialsManager({ testimonials: initialTestimonials }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Testimonial>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [reordering, setReordering] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null)
  const [processingBulk, setProcessingBulk] = useState(false)

  // Statistics
  const stats = useMemo(() => {
    const pending = testimonials.filter((t) => t.status === 'PENDING').length
    const approved = testimonials.filter((t) => t.status === 'APPROVED').length
    const rejected = testimonials.filter((t) => t.status === 'REJECTED').length
    const avgRating =
      testimonials.length > 0
        ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
        : '0'
    return { total: testimonials.length, pending, approved, rejected, avgRating }
  }, [testimonials])

  // Filtered testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.role.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        filterStatus === 'all' ||
        t.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [testimonials, searchQuery, filterStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.comment.trim()) {
      toast.error('Nombre y comentario son requeridos')
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { ...form }
      if (!payload.avatar || !(payload.avatar as string).trim()) {
        delete payload.avatar
      }

      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id)
    setEditForm({
      name: testimonial.name,
      role: testimonial.role,
      comment: testimonial.comment,
      rating: testimonial.rating,
      avatar: testimonial.avatar || '',
    })
  }

  const handleSaveEdit = async (id: string) => {
    if (!editForm.name?.trim() || !editForm.comment?.trim()) {
      toast.error('Nombre y comentario son requeridos')
      return
    }
    setSaving(true)
    try {
      const payload = { ...editForm }
      if (!payload.avatar?.trim()) delete payload.avatar

      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Testimonio actualizado')
        setEditingId(null)
        setEditForm({})
        router.refresh()
      } else {
        toast.error(data.message ?? 'Error al actualizar')
      }
    } catch {
      toast.error('Error al actualizar el testimonio')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
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

  const handleStatusChange = async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    setToggling(id)
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(
          status === 'APPROVED'
            ? 'Testimonio aprobado'
            : status === 'REJECTED'
              ? 'Testimonio rechazado'
              : 'Testimonio marcado como pendiente'
        )
        router.refresh()
      } else {
        toast.error(data.message ?? 'Error')
      }
    } catch {
      toast.error('Error al actualizar estado')
    } finally {
      setToggling(null)
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleBulkAction = async () => {
    if (selectedIds.size === 0 || !bulkAction) return
    const newStatus = bulkAction === 'approve' ? 'APPROVED' : 'REJECTED'
    setProcessingBulk(true)
    try {
      const updates = Array.from(selectedIds).map((id) =>
        fetch(`/api/testimonials/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      )
      await Promise.all(updates)
      toast.success(
        bulkAction === 'approve'
          ? `${selectedIds.size} testimonios aprobados`
          : `${selectedIds.size} testimonios rechazados`
      )
      setSelectedIds(new Set())
      router.refresh()
    } catch {
      toast.error('Error en operación masiva')
    } finally {
      setProcessingBulk(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = testimonials.findIndex((t) => t.id === active.id)
    const newIndex = testimonials.findIndex((t) => t.id === over.id)

    const reordered = arrayMove(testimonials, oldIndex, newIndex).map((t, idx) => ({
      ...t,
      order: idx + 1,
    }))

    setTestimonials(reordered)
    setReordering(true)

    try {
      const updates = reordered.map((t) =>
        fetch(`/api/testimonials/${t.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: t.order }),
        })
      )
      await Promise.all(updates)
      toast.success('Orden actualizado')
      router.refresh()
    } catch {
      toast.error('Error al reordenar')
      setTestimonials(initialTestimonials)
    } finally {
      setReordering(false)
    }
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all'

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} color="bg-blue-50 text-blue-700" />
        <StatCard label="Pendientes" value={stats.pending} color="bg-yellow-50 text-yellow-700" />
        <StatCard label="Aprobados" value={stats.approved} color="bg-green-50 text-green-700" />
        <StatCard label="Rechazados" value={stats.rejected} color="bg-red-50 text-red-700" />
        <StatCard
          label="Rating promedio"
          value={
            <span className="inline-flex items-center gap-1">
              {stats.avgRating}
              <Star className="h-5 w-5 fill-current" />
            </span>
          }
          color="bg-yellow-50 text-yellow-700"
        />
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, rol o comentario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <FilterButton
            active={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
            label="Todos"
          />
          <FilterButton
            active={filterStatus === 'PENDING'}
            onClick={() => setFilterStatus('PENDING')}
            label="Pendientes"
          />
          <FilterButton
            active={filterStatus === 'APPROVED'}
            onClick={() => setFilterStatus('APPROVED')}
            label="Aprobados"
          />
          <FilterButton
            active={filterStatus === 'REJECTED'}
            onClick={() => setFilterStatus('REJECTED')}
            label="Rechazados"
          />
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm text-blue-700">{selectedIds.size} seleccionados</span>
            <button
              onClick={() => {
                setBulkAction('approve')
                handleBulkAction()
              }}
              disabled={processingBulk}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Aprobar todos
            </button>
            <button
              onClick={() => {
                setBulkAction('reject')
                handleBulkAction()
              }}
              disabled={processingBulk}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" /> Rechazar todos
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowForm((v) => !v)}
        className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        {showForm ? (
          <>
            <X className="w-4 h-4" /> Cancelar
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" /> Nuevo testimonio
          </>
        )}
      </button>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border p-6 space-y-4 shadow-sm"
        >
          <h2 className="font-semibold text-lg">Nuevo testimonio</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
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
                placeholder="Cliente frecuente"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL del Avatar (opcional)</label>
            <input
              type="url"
              value={form.avatar}
              onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
              className={inputClass}
              placeholder="https://ejemplo.com/avatar.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Comentario <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              className={inputClass}
              rows={3}
              placeholder="Excelente producto, superó mis expectativas..."
              maxLength={500}
              required
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {form.comment.length}/500 caracteres
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Calificación</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, rating: s }))}
                  className={`text-3xl transition-all hover:scale-110 ${s <= form.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? 'Guardando...' : 'Guardar testimonio'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List with drag and drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={filteredTestimonials.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {reordering && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                Actualizando orden...
              </div>
            )}
            {filteredTestimonials.map((t) => (
              <TestimonialItem
                key={t.id}
                testimonial={t}
                isEditing={editingId === t.id}
                editForm={editForm}
                setEditForm={setEditForm}
                onEdit={handleEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                handleToggleSelect={handleToggleSelect}
                selectedIds={selectedIds}
                toggling={toggling}
                deleting={deleting}
                saving={saving}
                inputClass={inputClass}
              />
            ))}
            {filteredTestimonials.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                {searchQuery || filterStatus !== 'all'
                  ? 'No se encontraron testimonios con los filtros aplicados.'
                  : 'No hay testimonios. Creá el primero.'}
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: ReactNode
  color: string
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  )
}

// Filter Button Component
function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-black text-white'
          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

// Sortable Testimonial Item
function TestimonialItem({
  testimonial: t,
  isEditing,
  editForm,
  setEditForm,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onToggle,
  onDelete,
  onStatusChange,
  handleToggleSelect,
  selectedIds,
  toggling,
  deleting,
  saving,
  inputClass,
}: {
  testimonial: Testimonial
  isEditing: boolean
  editForm: Partial<Testimonial>
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Testimonial>>>
  onEdit: (t: Testimonial) => void
  onSaveEdit: (id: string) => void
  onCancelEdit: () => void
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => void
  handleToggleSelect: (id: string) => void
  selectedIds: Set<string>
  toggling: string | null
  deleting: string | null
  saving: boolean
  inputClass: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: t.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-xl border-2 border-black p-6 space-y-4 shadow-md"
      >
        <h3 className="font-semibold text-lg">Editar testimonio</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editForm.name || ''}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rol / Descripción</label>
            <input
              type="text"
              value={editForm.role || ''}
              onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">URL del Avatar (opcional)</label>
          <input
            type="url"
            value={editForm.avatar || ''}
            onChange={(e) => setEditForm((f) => ({ ...f, avatar: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Comentario <span className="text-red-500">*</span>
          </label>
          <textarea
            value={editForm.comment || ''}
            onChange={(e) => setEditForm((f) => ({ ...f, comment: e.target.value }))}
            className={inputClass}
            rows={3}
            maxLength={500}
            required
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {(editForm.comment || '').length}/500 caracteres
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Calificación</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setEditForm((f) => ({ ...f, rating: s }))}
                className={`text-3xl transition-all hover:scale-110 ${s <= (editForm.rating || 5) ? 'text-yellow-400' : 'text-gray-200'}`}
              >
                <Star className="h-8 w-8 fill-current" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onSaveEdit(t.id)}
            disabled={saving}
            className="px-6 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            onClick={onCancelEdit}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border p-4 flex gap-4 items-start hover:shadow-md transition-all ${!t.active ? 'opacity-60' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {t.avatar && (
        <img
          src={t.avatar}
          alt={t.name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      )}

      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{t.name}</span>
          {t.role && <span className="text-xs text-gray-400">{t.role}</span>}
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              t.status === 'APPROVED'
                ? 'bg-green-100 text-green-800'
                : t.status === 'REJECTED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {t.status === 'APPROVED' ? 'Aprobado' : t.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
          </span>
          <span className="text-xs text-gray-400">Orden: {t.order}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-4 h-4 ${s <= t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 italic break-words">&ldquo;{t.comment}&rdquo;</p>
      </div>

      <div className="flex gap-2 flex-shrink-0 flex-wrap">
        <button
          onClick={() => handleToggleSelect(t.id)}
          className={`p-2 text-xs border rounded-lg transition-colors ${
            selectedIds.has(t.id)
              ? 'bg-black text-white border-black'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
          title={selectedIds.has(t.id) ? 'Deseleccionar' : 'Seleccionar'}
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(t)}
          className="p-2 text-xs border rounded-lg hover:bg-gray-50 transition-colors"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        {t.status === 'PENDING' && (
          <>
            <button
              onClick={() => onStatusChange(t.id, 'APPROVED')}
              disabled={toggling === t.id}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Aprobar
            </button>
            <button
              onClick={() => onStatusChange(t.id, 'REJECTED')}
              disabled={toggling === t.id}
              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Rechazar
            </button>
          </>
        )}
        {t.status === 'APPROVED' && (
          <button
            onClick={() => onStatusChange(t.id, 'REJECTED')}
            disabled={toggling === t.id}
            className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            Rechazar
          </button>
        )}
        {t.status === 'REJECTED' && (
          <button
            onClick={() => onStatusChange(t.id, 'PENDING')}
            disabled={toggling === t.id}
            className="px-3 py-1.5 text-xs border border-yellow-200 text-yellow-600 rounded-lg hover:bg-yellow-50 disabled:opacity-50 transition-colors"
          >
            Pendiente
          </button>
        )}
        <button
          onClick={() => onDelete(t.id)}
          disabled={deleting === t.id}
          className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
