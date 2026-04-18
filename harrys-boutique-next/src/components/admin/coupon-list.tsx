'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Trash2, Edit2, Search, X } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  active: boolean
  createdAt: string
}

export function AdminCouponList({ coupons: initial }: { coupons: Coupon[] }) {
  const router = useRouter()
  const [coupons, setCoupons] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>(
    'all'
  )
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    expiresAt: '',
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones adicionales
    if (form.discountType === 'PERCENTAGE' && parseFloat(form.discountValue) > 100) {
      toast.error('El porcentaje no puede ser mayor a 100%')
      return
    }

    if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
      toast.error('La fecha de expiración debe ser futura')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Cupón creado exitosamente')
        setShowForm(false)
        resetForm()
        router.refresh()
      } else {
        toast.error(data.message || 'Error al crear cupón')
      }
    } catch {
      toast.error('Error al crear cupón')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id)
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      maxUses: coupon.maxUses?.toString() || '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
    })
    setShowForm(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    // Validaciones adicionales
    if (form.discountType === 'PERCENTAGE' && parseFloat(form.discountValue) > 100) {
      toast.error('El porcentaje no puede ser mayor a 100%')
      return
    }

    if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
      toast.error('La fecha de expiración debe ser futura')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/coupons/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Cupón actualizado exitosamente')
        setShowForm(false)
        setEditingId(null)
        resetForm()
        router.refresh()
      } else {
        toast.error(data.message || 'Error al actualizar cupón')
      }
    } catch {
      toast.error('Error al actualizar cupón')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setForm({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '',
      maxUses: '',
      expiresAt: '',
    })
    setEditingId(null)
  }

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      })
      const data = await res.json()
      if (data.success) {
        setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: !active } : c)))
        toast.success(`Cupón ${!active ? 'activado' : 'desactivado'}`)
      }
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`¿Estás seguro de eliminar el cupón "${code}"?`)) return

    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id))
        toast.success('Cupón eliminado')
      }
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.active) return 'inactive'
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return 'expired'
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return 'exhausted'
    return 'active'
  }

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      // Filtro de búsqueda
      const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
      if (!matchesSearch) return false

      // Filtro de estado
      if (filterStatus === 'all') return true
      const status = getCouponStatus(coupon)
      if (filterStatus === 'active') return status === 'active'
      if (filterStatus === 'inactive') return status === 'inactive'
      if (filterStatus === 'expired') return status === 'expired' || status === 'exhausted'
      return true
    })
  }, [coupons, searchTerm, filterStatus])

  const stats = useMemo(() => {
    const active = coupons.filter((c) => getCouponStatus(c) === 'active').length
    const expired = coupons.filter((c) => {
      const status = getCouponStatus(c)
      return status === 'expired' || status === 'exhausted'
    }).length
    const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0)
    return { active, expired, totalUses, total: coupons.length }
  }, [coupons])

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'

  const getStatusBadge = (coupon: Coupon) => {
    const status = getCouponStatus(coupon)
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-600',
      expired: 'bg-red-100 text-red-800',
      exhausted: 'bg-orange-100 text-orange-800',
    }
    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      expired: 'Expirado',
      exhausted: 'Agotado',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600">Total cupones</div>
          <div className="text-2xl font-semibold mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600">Activos</div>
          <div className="text-2xl font-semibold mt-1 text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600">Expirados</div>
          <div className="text-2xl font-semibold mt-1 text-red-600">{stats.expired}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600">Usos totales</div>
          <div className="text-2xl font-semibold mt-1">{stats.totalUses}</div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false)
              resetForm()
            } else {
              setShowForm(true)
            }
          }}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nuevo cupón'}
        </button>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Búsqueda */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro de estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="expired">Expirados/Agotados</option>
          </select>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <form
          onSubmit={editingId ? handleUpdate : handleCreate}
          className="bg-white rounded-xl border p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              {editingId ? 'Editar cupón' : 'Crear cupón'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className={inputClass}
                placeholder="DESCUENTO20"
                maxLength={20}
                disabled={!!editingId}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 20 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de descuento <span className="text-red-500">*</span>
              </label>
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })
                }
                className={inputClass}
                disabled={!!editingId}
              >
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED">Monto fijo ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor del descuento <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className={inputClass}
                min="0"
                max={form.discountType === 'PERCENTAGE' ? '100' : undefined}
                step="0.01"
                disabled={!!editingId}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.discountType === 'PERCENTAGE'
                  ? 'Entre 0 y 100%'
                  : 'Monto en pesos chilenos'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto mínimo de compra
              </label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className={inputClass}
                min="0"
                placeholder="Sin mínimo"
                disabled={!!editingId}
              />
              <p className="text-xs text-gray-500 mt-1">Opcional</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usos máximos
              </label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className={inputClass}
                min="1"
                placeholder="Sin límite"
              />
              <p className="text-xs text-gray-500 mt-1">Dejar vacío para ilimitado</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de expiración
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className={inputClass}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">Opcional</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving
                ? editingId
                  ? 'Actualizando...'
                  : 'Creando...'
                : editingId
                  ? 'Actualizar cupón'
                  : 'Crear cupón'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>

          {editingId && (
            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
              ℹ️ Solo se pueden editar los usos máximos y la fecha de expiración. Para cambiar
              otros valores, crea un nuevo cupón.
            </p>
          )}
        </form>
      )}

      {/* Tabla de cupones */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Descuento</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">
                  Mínimo
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">
                  Usos
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">
                  Expira
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-black">{coupon.code}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {coupon.discountType === 'PERCENTAGE'
                      ? `${Number(coupon.discountValue)}%`
                      : `$${Number(coupon.discountValue).toLocaleString('es-CL')}`}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                    {coupon.minOrderAmount
                      ? `$${Number(coupon.minOrderAmount).toLocaleString('es-CL')}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-gray-900 font-medium">{coupon.usedCount}</span>
                    <span className="text-gray-500">
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ' / ∞'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString('es-CL')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(coupon)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggle(coupon.id, coupon.active)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          coupon.active
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={coupon.active ? 'Desactivar' : 'Activar'}
                      >
                        {coupon.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    {searchTerm || filterStatus !== 'all'
                      ? 'No se encontraron cupones con los filtros aplicados'
                      : 'No hay cupones creados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen de resultados */}
        {filteredCoupons.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
            Mostrando {filteredCoupons.length} de {coupons.length} cupones
          </div>
        )}
      </div>
    </div>
  )
}
