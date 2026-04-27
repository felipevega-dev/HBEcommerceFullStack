'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Step {
  number: number
  label: string
  icon: string
}

const steps: Step[] = [
  { number: 1, label: 'Dirección', icon: '📍' },
  { number: 2, label: 'Pago', icon: '💳' },
  { number: 3, label: 'Confirmación', icon: '✅' },
]

interface Props {
  currentStep: number
}

export function CheckoutProgress({ currentStep }: Props) {
  return (
    <div className="w-full py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Desktop version */}
        <div className="hidden sm:flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-[var(--color-border)]">
            <motion.div
              className="h-full bg-[var(--color-accent)]"
              initial={{ width: '0%' }}
              animate={{
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
              }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>

          {/* Steps */}
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number
            const isCurrent = currentStep === step.number
            const isUpcoming = currentStep < step.number

            return (
              <div key={step.number} className="relative flex flex-col items-center z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                    isCompleted
                      ? 'bg-[var(--color-accent)] text-white shadow-lg'
                      : isCurrent
                        ? 'bg-[var(--color-accent)] text-white shadow-lg ring-4 ring-[var(--color-accent-light)]'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-2 border-[var(--color-border)]'
                  }`}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <span className="text-lg">{step.icon}</span>
                  )}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                  className={`mt-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                    isCurrent
                      ? 'text-[var(--color-accent)]'
                      : isCompleted
                        ? 'text-[var(--color-text-secondary)]'
                        : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {step.label}
                </motion.p>
              </div>
            )
          })}
        </div>

        {/* Mobile version */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              Paso {currentStep} de {steps.length}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {steps[currentStep - 1]?.label}
            </span>
          </div>
          <div className="relative h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`text-xs ${
                  currentStep >= step.number
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {step.icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
