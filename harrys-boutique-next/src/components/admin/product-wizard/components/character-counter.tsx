'use client'

import { BrandIcon } from '@/components/ui/brand-icon'

/**
 * Character counter component props
 */
interface CharacterCounterProps {
  /** Current character count */
  current: number
  /** Maximum allowed characters */
  max: number
  /** Optional CSS classes for the counter */
  className?: string
  /** Threshold percentage to turn red (default: 90%) */
  warningThreshold?: number
}

/**
 * Character counter component for input fields
 * 
 * Features:
 * - Shows "X/MAX caracteres" format
 * - Turns red when approaching limit (default: 90% threshold)
 * - Fully typed with TypeScript
 * - Accessible with aria-live for screen readers
 * 
 * @example
 * ```tsx
 * <CharacterCounter current={25} max={100} />
 * // Displays: "25/100 caracteres"
 * 
 * <CharacterCounter current={95} max={100} />
 * // Displays in red: "95/100 caracteres"
 * ```
 */
export function CharacterCounter({
  current,
  max,
  className = '',
  warningThreshold = 0.9
}: CharacterCounterProps) {
  // Calculate if we're approaching the limit
  const isApproachingLimit = current >= max * warningThreshold
  const isOverLimit = current > max

  // Determine color classes
  const colorClass = isOverLimit
    ? 'text-red-600 font-medium'
    : isApproachingLimit
    ? 'text-amber-600 font-medium'
    : 'text-gray-400'

  // Determine aria-live level based on state
  const ariaLive = isOverLimit ? 'assertive' : isApproachingLimit ? 'polite' : 'off'

  return (
    <div
      className={`text-xs ${colorClass} ${className}`}
      aria-live={ariaLive}
      aria-atomic="true"
      role="status"
    >
      <span aria-label={`${current} de ${max} caracteres`}>
        {current}/{max} caracteres
      </span>
      {isOverLimit && (
        <span className="ml-1 inline-flex align-middle" aria-label="Límite excedido">
          <BrandIcon name="alert" className="h-3 w-3" />
        </span>
      )}
    </div>
  )
}
