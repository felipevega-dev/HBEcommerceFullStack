import { BrandIcon, type BrandIconName } from '@/components/ui/brand-icon'

interface Metrics {
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  totalUsers: number
  monthlyRevenue: number
  revenueChange: number
  monthlyOrdersCount: number
  ordersChange: number
  avgOrderValue: number
  aovChange: number
  pendingReviews: number
}

interface Card {
  label: string
  value: string | number
  change: number
  warning: boolean
  icon: BrandIconName
  iconColor: string
}

function formatChange(value: number) {
  const prefix = value >= 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}%`
}

function TrendIndicator({ change }: { change: number }) {
  if (change === 0) return null
  const isPositive = change > 0
  return (
    <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {formatChange(change)}
    </span>
  )
}

function WarningBadge() {
  return (
    <span className="inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800">
      Atención
    </span>
  )
}

function cards(metrics: Metrics): Card[] {
  return [
    {
      label: 'Ingresos del mes',
      value: `$${metrics.monthlyRevenue.toLocaleString('es-CL')}`,
      change: metrics.revenueChange,
      warning: metrics.revenueChange < -10,
      icon: 'price',
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Órdenes del mes',
      value: metrics.monthlyOrdersCount,
      change: metrics.ordersChange,
      warning: metrics.ordersChange < -10,
      icon: 'shopping-bag',
      iconColor: 'text-blue-500 bg-blue-50',
    },
    {
      label: 'Ticket promedio',
      value: `$${metrics.avgOrderValue.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`,
      change: metrics.aovChange,
      warning: metrics.aovChange < -10,
      icon: 'payment',
      iconColor: 'text-purple-500 bg-purple-50',
    },
    {
      label: 'Órdenes pendientes',
      value: metrics.pendingOrders,
      change: 0,
      warning: metrics.pendingOrders > 20,
      icon: 'alert',
      iconColor: 'text-yellow-600 bg-yellow-50',
    },
    {
      label: 'Reseñas pendientes',
      value: metrics.pendingReviews,
      change: 0,
      warning: metrics.pendingReviews > 10,
      icon: 'review',
      iconColor: 'text-red-500 bg-red-50',
    },
    {
      label: 'Productos activos',
      value: metrics.totalProducts,
      change: 0,
      warning: false,
      icon: 'package',
      iconColor: 'text-indigo-500 bg-indigo-50',
    },
    {
      label: 'Clientes registrados',
      value: metrics.totalUsers,
      change: 0,
      warning: false,
      icon: 'users',
      iconColor: 'text-green-500 bg-green-50',
    },
    {
      label: 'Órdenes totales',
      value: metrics.totalOrders,
      change: 0,
      warning: false,
      icon: 'layout-dashboard',
      iconColor: 'text-slate-500 bg-slate-50',
    },
  ]
}

export function DashboardMetrics({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {cards(metrics).map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border bg-white p-4 ${
            card.warning ? 'border-red-300' : 'border-[var(--color-border)]'
          }`}
        >
          <div className="mb-2 flex items-start justify-between">
            <div className={`inline-flex rounded-lg p-2 ${card.iconColor}`}>
              <BrandIcon name={card.icon} className="h-5 w-5" />
            </div>
            {card.warning && <WarningBadge />}
          </div>
          <p className="mb-1 text-xs text-gray-500">{card.label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold">{card.value}</p>
            <TrendIndicator change={card.change} />
          </div>
        </div>
      ))}
    </div>
  )
}
