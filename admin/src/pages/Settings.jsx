import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const SETTING_LABELS = {
  store_name: 'Nombre de la tienda',
  shipping_fee: 'Costo de envío base ($)',
  free_shipping_threshold: 'Envío gratis desde ($, 0 = desactivado)',
  currency: 'Símbolo de moneda',
  max_billing_addresses: 'Máximo de direcciones por usuario',
}

const Settings = ({ token }) => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.data.success) setSettings(res.data.settings)
      } catch {
        toast.error('Error al cargar configuración')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [token])

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await axios.put(`${backendUrl}/api/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        toast.success('Configuración guardada')
      } else {
        toast.error(res.data.message)
      }
    } catch {
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Cargando configuración...</div>

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">Configuración de la tienda</h2>
      <form onSubmit={handleSave} className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {SETTING_LABELS[key] || key}
            </label>
            <input
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) =>
                handleChange(
                  key,
                  typeof value === 'number' ? Number(e.target.value) : e.target.value,
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

export default Settings
