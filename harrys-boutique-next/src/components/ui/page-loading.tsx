'use client'

import { motion } from 'framer-motion'
import { LoadingPaw } from './loading-spinner'

interface Props {
  message?: string
}

export function PageLoading({ message = 'Cargando...' }: Props) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <LoadingPaw className="text-5xl" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[var(--color-text-muted)] text-lg"
      >
        {message}
      </motion.p>
    </div>
  )
}

export function FullPageLoading({ message = 'Cargando...' }: Props) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6">
      <LoadingPaw className="text-6xl" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[var(--color-text-muted)] text-xl font-medium"
      >
        {message}
      </motion.p>
    </div>
  )
}
