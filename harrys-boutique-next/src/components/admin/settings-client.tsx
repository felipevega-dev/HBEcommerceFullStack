'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'

const SETTING_LABELS: Record<string, string> = {
  store_name: 'Nombre de la tienda',
  shipping_fee: 'Costo de envío base',
  free_shipping_threshold: 'Envío gratis desde (0 = desactivado)',
  currency: 'Símbolo de moneda',
  max_billing_addresses: 'Máximo de direcciones por usuario',
}

export function AdminSettingsClient({ settings: initial }: { settings: Record<string, string> }) {
  const [settings, setSettings] = useState(initial)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (data.success) toast.success('Configuración guardada')
      else toast.error(data.message)
    } catch {
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-4 bg-white p-6 rounded-xl border">
      {Object.entries(settings).map(([key, value]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {SETTING_LABELS[key] ?? key}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
