import type { OrderStatus, PaymentStatus } from '@prisma/client'
import { BrandIcon, type BrandIconName } from '@/components/ui/brand-icon'

interface StoryStep {
  status: OrderStatus
  title: string
  description: string
  icon: BrandIconName
}

interface OrderStoryTrackerProps {
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
  courier?: string | null
  trackingNumber?: string | null
  paidAt?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
}

const STORY_STEPS: StoryStep[] = [
  {
    status: 'PENDING',
    title: 'Pedido recibido',
    description: 'Tu selección quedó guardada y estamos validando el pago.',
    icon: 'shopping-bag',
  },
  {
    status: 'PROCESSING',
    title: 'Preparando la prenda',
    description: 'Estamos revisando talla, prendas y detalles antes de empacar.',
    icon: 'shirt',
  },
  {
    status: 'SHIPPED',
    title: 'Camino a casa',
    description: 'El paquete ya salió. Pronto podrán estrenar su nueva prenda.',
    icon: 'shipping',
  },
  {
    status: 'DELIVERED',
    title: 'Pedido entregado',
    description: 'Tu mascota ya puede estrenar. Si quieres, comparte el resultado con Harry’s.',
    icon: 'camera',
  },
]

const STEP_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
}

function formatDate(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
  })
}

function getStepDate(step: OrderStatus, props: OrderStoryTrackerProps) {
  if (step === 'PENDING') return formatDate(props.createdAt)
  if (step === 'PROCESSING') return formatDate(props.paidAt)
  if (step === 'SHIPPED') return formatDate(props.shippedAt)
  if (step === 'DELIVERED') return formatDate(props.deliveredAt)
  return null
}

export function OrderStoryTracker(props: OrderStoryTrackerProps) {
  const activeIndex = STEP_INDEX[props.status]
  const paymentNeedsAttention =
    props.paymentStatus === 'FAILED' || props.paymentStatus === 'PENDING'
  const cancelled = props.status === 'CANCELLED'

  if (cancelled) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-full bg-white p-2 text-red-600">
            <BrandIcon name="x-circle" className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-red-900">Pedido cancelado</p>
            <p className="mt-1 text-sm leading-6 text-red-800">
              Este pedido quedó cerrado. Si fue un error o quieres elegir otra prenda, contáctanos
              para ayudarte con una nueva selección.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-dark)]">
            Seguimiento del pedido
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">
            Tu pedido avanza paso a paso
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Cada estado muestra de forma clara en qué etapa se encuentra.
          </p>
        </div>
        {props.trackingNumber ? (
          <div className="rounded-lg bg-[var(--color-surface)] px-3 py-2 text-sm">
            <p className="font-semibold text-[var(--color-text-primary)]">
              {props.courier ?? 'Courier'}
            </p>
            <p className="text-[var(--color-text-secondary)]">{props.trackingNumber}</p>
          </div>
        ) : null}
      </div>

      {paymentNeedsAttention ? (
        <div className="mb-5 rounded-lg border border-[var(--color-warning)]/40 bg-[var(--color-gold-light)]/60 p-4">
          <div className="flex items-start gap-3">
            <BrandIcon name="payment" className="mt-0.5 h-5 w-5 text-[var(--color-warning)]" />
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              {props.paymentStatus === 'FAILED'
                ? 'El pago necesita revisión antes de preparar el pedido.'
                : 'Cuando el pago se confirme, el pedido pasa a preparación.'}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        {STORY_STEPS.map((step, index) => {
          const done = index < activeIndex
          const active = index === activeIndex
          const date = getStepDate(step.status, props)

          return (
            <div
              key={step.status}
              className={`relative rounded-xl border p-4 ${
                done || active
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                  : 'border-[var(--color-border)] bg-[var(--color-background)]'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`rounded-full p-2 ${
                    done
                      ? 'bg-[var(--color-success)] text-white'
                      : active
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-white text-[var(--color-text-muted)]'
                  }`}
                >
                  <BrandIcon name={done ? 'check' : step.icon} className="h-4 w-4" />
                </span>
                {date ? (
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                    {date}
                  </span>
                ) : null}
              </div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{step.title}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                {step.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
