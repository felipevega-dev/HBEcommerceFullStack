'use client'

import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import {
  STORE_SETTING_DEFINITIONS,
  STORE_SETTING_GROUP_LABELS,
  type StoreSettingDefinition,
  type StoreSettingGroup,
} from '@/lib/store-settings'

type SettingsMap = Record<string, string>

const GROUP_ORDER: StoreSettingGroup[] = ['store', 'shipping', 'contact', 'integrations']

function SettingField({
  definition,
  value,
  onChange,
}: {
  definition: StoreSettingDefinition
  value: string
  onChange: (value: string) => void
}) {
  const id = `setting-${definition.key}`

  if (definition.type === 'textarea') {
    return (
      <label htmlFor={id} className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">{definition.label}</span>
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <span className="mt-1 block text-xs text-gray-500">{definition.description}</span>
      </label>
    )
  }

  if (definition.type === 'boolean') {
    return (
      <label htmlFor={id} className="flex items-start gap-3 rounded-lg border p-3">
        <input
          id={id}
          type="checkbox"
          checked={value === 'true'}
          onChange={(event) => onChange(event.target.checked ? 'true' : 'false')}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />
        <span>
          <span className="block text-sm font-medium text-gray-700">{definition.label}</span>
          <span className="block text-xs text-gray-500">{definition.description}</span>
        </span>
      </label>
    )
  }

  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{definition.label}</span>
      <input
        id={id}
        type={definition.type === 'number' ? 'number' : definition.type}
        min={definition.min}
        max={definition.max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />
      <span className="mt-1 block text-xs text-gray-500">{definition.description}</span>
    </label>
  )
}

export function AdminSettingsClient({ settings: initial }: { settings: SettingsMap }) {
  const [settings, setSettings] = useState<SettingsMap>(initial)
  const [saving, setSaving] = useState(false)

  const groupedSettings = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        fields: STORE_SETTING_DEFINITIONS.filter((definition) => definition.group === group),
      })),
    [],
  )

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = Object.fromEntries(
        STORE_SETTING_DEFINITIONS.map((definition) => [
          definition.key,
          settings[definition.key] ?? definition.defaultValue,
        ]),
      )

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        const message = data.errors
          ? Object.values(data.errors).filter(Boolean).join(', ')
          : data.message
        throw new Error(message || 'No se pudo guardar configuracion')
      }

      setSettings(data.settings)
      toast.success('Configuracion guardada')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar configuracion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {groupedSettings.map(({ group, fields }) => (
        <section key={group} className="rounded-xl border bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {STORE_SETTING_GROUP_LABELS[group]}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {fields.map((definition) => (
              <SettingField
                key={definition.key}
                definition={definition}
                value={settings[definition.key] ?? definition.defaultValue}
                onChange={(value) =>
                  setSettings((current) => ({ ...current, [definition.key]: value }))
                }
              />
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar configuracion'}
        </button>
      </div>
    </form>
  )
}
