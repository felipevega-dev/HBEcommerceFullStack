import Link from 'next/link'
import { BrandIcon } from '@/components/ui/brand-icon'
import { EditorialPanel } from '@/components/store/editorial'

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <EditorialPanel className="max-w-lg p-10 text-center" tone="soft">
        <div className="relative">
          <div className="mx-auto mb-6 w-fit rounded-full bg-[color-mix(in_srgb,var(--color-success)_12%,white)] p-4 text-[var(--color-success)]">
            <BrandIcon name="check-circle" className="h-12 w-12" />
          </div>
          <h1 className="ui-display mb-4 text-3xl">¡Pago exitoso!</h1>
          <p className="mb-8 text-[var(--color-text-secondary)]">
            Tu pedido ha sido confirmado. Recibirás un email con los detalles.
          </p>
          <Link href="/orders" className="ui-button ui-button-primary">
            Ver mis pedidos
          </Link>
        </div>
      </EditorialPanel>
    </div>
  )
}
