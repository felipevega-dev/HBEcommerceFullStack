'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Truck, Lock, CreditCard } from 'lucide-react'

const badges = [
  {
    icon: ShieldCheck,
    title: 'Compra Segura',
    description: 'Protección SSL',
  },
  {
    icon: Truck,
    title: 'Envío Gratis',
    description: 'En compras +$50.000',
  },
  {
    icon: Lock,
    title: 'Pago Seguro',
    description: 'Datos protegidos',
  },
  {
    icon: CreditCard,
    title: 'Múltiples Métodos',
    description: 'Tarjeta o efectivo',
  },
]

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-6 sm:py-8 px-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
      {badges.map((badge, index) => {
        const Icon = badge.icon
        return (
          <motion.div
            key={badge.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center text-center gap-2"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                {badge.title}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] hidden sm:block">
                {badge.description}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
