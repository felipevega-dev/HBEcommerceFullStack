import type { Metadata } from 'next'
import { AdminSettingsClient } from '@/components/admin/settings-client'
import { getSettingsMap } from '@/lib/commerce-settings'

export const metadata: Metadata = { title: "Configuracion - Admin Harry's Boutique" }

export default async function AdminSettingsPage() {
  const settingsMap = await getSettingsMap()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuracion</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ajustes operativos de tienda, envio, contacto e integraciones.
        </p>
      </div>
      <AdminSettingsClient settings={settingsMap} />
    </div>
  )
}
