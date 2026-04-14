import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AdminSettingsClient } from '@/components/admin/settings-client'

export const metadata: Metadata = { title: "Configuración — Admin Harry's Boutique" }

export default async function AdminSettingsPage() {
  const settings = await prisma.settings.findMany()
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Configuración</h1>
      <AdminSettingsClient settings={settingsMap} />
    </div>
  )
}
