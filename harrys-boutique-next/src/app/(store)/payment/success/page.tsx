import { Button } from '@/components/ui/button'
import { BrandIcon } from '@/components/ui/brand-icon'

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 rounded-full bg-[var(--color-surface-2)] p-4 text-[var(--color-success)]">
        <BrandIcon name="check-circle" className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-medium text-[var(--color-text-primary)]">¡Pago exitoso!</h1>
      <p className="mt-3 mb-8 max-w-md text-[var(--color-text-secondary)]">
        Tu pedido ha sido confirmado. Recibirás un email con los detalles.
      </p>
      <Button href="/orders">Ver mis pedidos</Button>
    </div>
  )
}
