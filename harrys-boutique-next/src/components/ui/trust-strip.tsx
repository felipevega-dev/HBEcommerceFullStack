import { BrandIcon } from '@/components/ui/brand-icon'

type TrustStripProps = {
  variant?: 'default' | 'compact' | 'inline'
  className?: string
}

const items = [
  {
    icon: 'shipping' as const,
    title: 'Envío a todo Chile',
    description: 'Despacho rápido y seguimiento',
  },
  {
    icon: 'check-circle' as const,
    title: 'Devolución 7 días',
    description: 'Compra con tranquilidad',
  },
  {
    icon: 'payment' as const,
    title: 'Pago seguro',
    description: 'MercadoPago y tarjetas',
  },
]

export function TrustStrip({ variant = 'default', className = '' }: TrustStripProps) {
  if (variant === 'inline') {
    return (
      <p className={`text-xs text-[var(--color-text-muted)] sm:text-sm ${className}`} role="note">
        Envío a todo Chile · Devolución 7 días · Pago seguro MercadoPago
      </p>
    )
  }

  if (variant === 'compact') {
    return (
      <ul
        className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--color-text-secondary)] sm:text-sm ${className}`}
      >
        {items.map((item) => (
          <li key={item.title} className="flex items-center gap-2">
            <BrandIcon name={item.icon} className="h-4 w-4 text-[var(--color-accent-dark)]" />
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section
      className={`grid gap-4 border-y border-[var(--color-border)] py-8 sm:grid-cols-3 ${className}`}
      aria-label="Garantías de compra"
    >
      {items.map((item) => (
        <div key={item.title} className="flex items-start gap-3 text-center sm:text-left">
          <div className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] sm:mx-0">
            <BrandIcon name={item.icon} className="h-5 w-5 text-[var(--color-accent-dark)]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.title}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{item.description}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
