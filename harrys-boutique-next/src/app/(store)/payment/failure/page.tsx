import Link from 'next/link'
import { BrandIcon } from '@/components/ui/brand-icon'
import { EditorialPanel } from '@/components/store/editorial'

export default function PaymentFailurePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <EditorialPanel className="max-w-lg p-10 text-center" tone="soft">
        <div className="relative">
          <div className="mx-auto mb-6 w-fit rounded-full bg-[color-mix(in_srgb,var(--color-error)_10%,var(--color-surface))] p-4 text-[var(--color-error)]">
            <BrandIcon name="x-circle" className="h-12 w-12" />
          </div>
          <h1 className="ui-display mb-4 text-3xl">Pago fallido</h1>
          <p className="mb-8 text-[var(--color-text-secondary)]">
            Hubo un problema con tu pago. Por favor intenta nuevamente.
          </p>
          <Link href="/checkout" className="ui-button ui-button-primary">
            Intentar de nuevo
          </Link>
        </div>
      </EditorialPanel>
    </div>
  )
}
