import Link from 'next/link'
import { EditorialPanel } from '@/components/store/editorial'

export default function PaymentPendingPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <EditorialPanel className="max-w-lg p-10 text-center" tone="soft">
        <div className="relative">
          <p className="ui-eyebrow">MercadoPago</p>
          <h1 className="ui-display mt-4 text-3xl">Pago pendiente</h1>
          <p className="mt-4 mb-8 text-[var(--color-text-secondary)]">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme.
          </p>
          <Link href="/orders" className="ui-button ui-button-primary">
            Ver mis pedidos
          </Link>
        </div>
      </EditorialPanel>
    </div>
  )
}
