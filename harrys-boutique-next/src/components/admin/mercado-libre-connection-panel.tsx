'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import type {
  MercadoLibreIntegrationStatus,
  MercadoLibreSyncSummary,
} from '@/lib/mercado-libre-sync'

const NOTICES: Record<string, { type: 'success' | 'error' | 'warning'; message: string }> = {
  connected: { type: 'success', message: 'Cuenta de Mercado Libre conectada.' },
  not_configured: {
    type: 'warning',
    message: 'Faltan las credenciales de Mercado Libre en las variables de entorno.',
  },
  denied: { type: 'error', message: 'Mercado Libre no autorizó el acceso.' },
  invalid_state: {
    type: 'error',
    message: 'La autorización expiró o no coincide. Vuelve a intentarlo.',
  },
  exchange_failed: {
    type: 'error',
    message: 'No se pudo obtener el token de Mercado Libre. Revisa las credenciales.',
  },
}

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Santiago',
})

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : '—'
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number
  tone?: 'default' | 'warn'
}) {
  return (
    <div className="rounded-lg border border-gray-200 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`text-lg font-semibold ${tone === 'warn' && value > 0 ? 'text-amber-700' : 'text-gray-900'}`}
      >
        {value}
      </p>
    </div>
  )
}

export function MercadoLibreConnectionPanel({
  status,
  notice,
}: {
  status: MercadoLibreIntegrationStatus
  notice?: string
}) {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [lastSummary, setLastSummary] = useState<MercadoLibreSyncSummary | null>(null)

  useEffect(() => {
    if (!notice) return
    const entry = NOTICES[notice]
    if (entry) toast[entry.type](entry.message)
    window.history.replaceState(null, '', '/admin/settings')
  }, [notice])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/admin/mercadolibre/sync', { method: 'POST' })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No se pudo sincronizar con Mercado Libre')
      }

      const summary = data.summary as MercadoLibreSyncSummary
      setLastSummary(summary)
      toast.success(
        `Sincronizadas ${summary.synced} de ${summary.total} publicaciones` +
          (summary.failed > 0 ? ` (${summary.failed} con error)` : ''),
      )
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    if (
      !window.confirm('¿Desconectar la cuenta de Mercado Libre? La sincronización se detendrá.')
    ) {
      return
    }

    setDisconnecting(true)
    try {
      const response = await fetch('/api/admin/mercadolibre/connection', { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No se pudo desconectar')
      }
      toast.success('Cuenta de Mercado Libre desconectada')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al desconectar')
    } finally {
      setDisconnecting(false)
    }
  }

  const { connection, listings } = status

  return (
    <section className="rounded-xl border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Mercado Libre</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sincroniza precio, estado y disponibilidad de las publicaciones vinculadas a productos.
          </p>
        </div>
        {connection ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Conectado{connection.nickname ? ` como ${connection.nickname}` : ''}
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            Sin conectar
          </span>
        )}
      </div>

      {!status.configured && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Falta configurar la aplicación de Mercado Libre.</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Crea una aplicación en el portal de desarrolladores de Mercado Libre Chile con
              permisos de lectura y <code>offline_access</code>.
            </li>
            <li>
              Registra como URI de redirección:{' '}
              <code className="break-all">{status.redirectUri}</code>
            </li>
            <li>
              Define <code>MERCADOLIBRE_CLIENT_ID</code> y <code>MERCADOLIBRE_CLIENT_SECRET</code>{' '}
              en el entorno y vuelve a desplegar.
            </li>
          </ol>
        </div>
      )}

      {status.configured && !connection && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="/api/admin/mercadolibre/connect"
            className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Conectar con Mercado Libre
          </a>
          <p className="text-xs text-gray-500">
            Se abrirá Mercado Libre para autorizar la cuenta vendedora de la tienda.
          </p>
        </div>
      )}

      {connection && (
        <div className="mt-4 space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-gray-500">Conectado el</dt>
              <dd className="font-medium text-gray-900">{formatDate(connection.connectedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Última sincronización</dt>
              <dd className="font-medium text-gray-900">{formatDate(connection.lastSyncAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Sincronización automática</dt>
              <dd className="font-medium text-gray-900">
                {status.cronConfigured ? 'Diaria (Vercel Cron)' : 'Pendiente: define CRON_SECRET'}
              </dd>
            </div>
          </dl>

          {connection.lastSyncError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Último error: {connection.lastSyncError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <Stat label="Vinculadas" value={listings.total} />
            <Stat label="Activas" value={listings.active} />
            <Stat label="Pausadas" value={listings.paused} tone="warn" />
            <Stat label="Finalizadas" value={listings.inactive} tone="warn" />
            <Stat label="Sin sincronizar" value={listings.unsynced} tone="warn" />
            <Stat label="Con error" value={listings.withErrors} tone="warn" />
            <Stat label="Sin item ID" value={listings.withoutItemId} tone="warn" />
          </div>

          {lastSummary && (
            <p className="text-xs text-gray-500">
              Última ejecución manual: {lastSummary.active} activas, {lastSummary.paused} pausadas,{' '}
              {lastSummary.closed} finalizadas, {lastSummary.missing} no encontradas,{' '}
              {lastSummary.failed} con error ({Math.round(lastSummary.durationMs / 100) / 10} s).
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || disconnecting}
              className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={syncing || disconnecting}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {disconnecting ? 'Desconectando...' : 'Desconectar'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
