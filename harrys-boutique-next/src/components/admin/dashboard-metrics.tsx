interface Metrics {
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  totalUsers: number
  monthlyRevenue: number
  lastMonthRevenue: number
  revenueChange: number
  monthlyOrdersCount: number
  lastMonthOrdersCount: number
  ordersChange: number
  avgOrderValue: number
  aovChange: number
  conversionRate: number
  pendingReviews: number
}

function formatChange(value: number): string {
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
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92A5.502 5.502 0 0014.62 19H5.38a5.502 5.502 0 00-2.782-5.98z" clipRule="evenodd" />
      </svg>
     Atención
    </span>
  )
}

const cards = (metrics: Metrics) => [
  {
    label: 'Ingresos del mes',
    value: `$${metrics.monthlyRevenue.toLocaleString('es-CL')}`,
    change: metrics.revenueChange,
    warning: metrics.revenueChange < -10,
    iconColor: 'text-emerald-600 bg-emerald-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Órdenes del mes',
    value: metrics.monthlyOrdersCount,
    change: metrics.ordersChange,
    warning: metrics.ordersChange < -10,
    iconColor: 'text-blue-500 bg-blue-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Ticket promedio',
    value: `$${metrics.avgOrderValue.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`,
    change: metrics.aovChange,
    warning: metrics.aovChange < -10,
    iconColor: 'text-purple-500 bg-purple-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Tasa de conversión',
    value: `${metrics.conversionRate.toFixed(1)}%`,
    change: 0,
    warning: false,
    iconColor: 'text-orange-500 bg-orange-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    label: 'Órdenes pendientes',
    value: metrics.pendingOrders,
    change: 0,
    warning: metrics.pendingOrders > 20,
    iconColor: 'text-yellow-500 bg-yellow-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Reseñas pendientes',
    value: metrics.pendingReviews,
    change: 0,
    warning: metrics.pendingReviews > 10,
    iconColor: 'text-red-500 bg-red-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    label: 'Productos activos',
    value: metrics.totalProducts,
    change: 0,
    warning: false,
    iconColor: 'text-indigo-500 bg-indigo-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: 'Clientes registrados',
    value: metrics.totalUsers,
    change: 0,
    warning: false,
    iconColor: 'text-green-500 bg-green-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export function DashboardMetrics({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards(metrics).map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl border p-4 ${card.warning ? 'border-red-300' : 'border-[var(--color-border)]'}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className={`inline-flex p-2 rounded-lg ${card.iconColor}`}>{card.icon}</div>
            {card.warning && <WarningBadge />}
          </div>
          <p className="text-xs text-gray-500 mb-1">{card.label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold">{card.value}</p>
            {card.change !== 0 && <TrendIndicator change={card.change} />}
          </div>
        </div>
      ))}
    </div>
  )
}
