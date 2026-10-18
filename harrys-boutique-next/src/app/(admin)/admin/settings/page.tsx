import type { Metadata } from 'next'
import { AdminSettingsClient } from '@/components/admin/settings-client'
import { MercadoLibreConnectionPanel } from '@/components/admin/mercado-libre-connection-panel'
import { getSettingsMap } from '@/lib/commerce-settings'
import { getMercadoLibreIntegrationStatus } from '@/lib/mercado-libre-sync'

export const metadata: Metadata = { title: "Configuracion - Admin Harry's Boutique" }

interface Props {
  searchParams: Promise<{ mercadolibre?: string }>
}

export default async function AdminSettingsPage({ searchParams }: Props) {
  const [{ mercadolibre }, settingsMap, mercadoLibreStatus] = await Promise.all([
    searchParams,
    getSettingsMap(),
    getMercadoLibreIntegrationStatus(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuracion</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ajustes operativos de tienda, envio, contacto e integraciones.
        </p>
      </div>
      <MercadoLibreConnectionPanel status={mercadoLibreStatus} notice={mercadolibre} />
      <AdminSettingsClient settings={settingsMap} />
    </div>
  )
}
