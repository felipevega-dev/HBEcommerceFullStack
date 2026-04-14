'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

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
          expiresAt: form.expiresAt || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Cupón creado')
        setShowForm(false)
        setForm({
          code: '',
          discountType: 'PERCENTAGE',
          discountValue: '',
          minOrderAmount: '',
          maxUses: '',
          expiresAt: '',
        })
        router.refresh()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Error al crear cupón')
    } finally {
      setSaving(false)
    }
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
      }
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
      >
        {showForm ? 'Cancelar' : '+ Nuevo cupón'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border p-6 space-y-4 max-w-lg">
          <h2 className="font-semibold">Crear cupón</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className={inputClass}
                placeholder="DESCUENTO20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })
                }
                className={inputClass}
              >
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className={inputClass}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto mínimo</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className={inputClass}
                min="0"
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className={inputClass}
                min="1"
                placeholder="Sin límite"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expira el</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Creando...' : 'Crear cupón'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Descuento</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">
                Usos
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">
                Expira
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium">{coupon.code}</td>
                <td className="px-4 py-3">
                  {coupon.discountType === 'PERCENTAGE'
                    ? `${Number(coupon.discountValue)}%`
                    : `$${Number(coupon.discountValue).toLocaleString('es-CL')}`}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                  {coupon.usedCount}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                  {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('es-CL') : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(coupon.id, coupon.active)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${coupon.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {coupon.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  No hay cupones
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
