'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Tooltip component props
 */
interface TooltipProps {
  /** The tooltip content to display */
  content: string
  /** Optional CSS classes for the tooltip container */
  className?: string
  /** Optional aria-label for accessibility */
  ariaLabel?: string
}

/**
 * Tooltip component with info icon and hover display
 * 
 * Features:
 * - Shows on hover with arrow pointing to icon
 * - Auto-hides after 5 seconds
 * - Fully accessible with ARIA attributes
 * - Responsive positioning
 * 
 * @example
 * ```tsx
 * <Tooltip content="Describí las características principales: material, tamaño, para qué mascota es" />
 * ```
 */
export function Tooltip({ content, className = '', ariaLabel }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    setIsVisible(true)
    
    // Auto-hide after 5 seconds
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 5000)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
    
    // Clear the auto-hide timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Info Icon */}
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 rounded-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        aria-label={ariaLabel || 'Más información'}
        aria-describedby={isVisible ? tooltipId.current : undefined}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Tooltip Content */}
      {isVisible && (
        <div
          id={tooltipId.current}
          role="tooltip"
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg animate-fade-in"
        >
          {/* Arrow pointing down to icon */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[1px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-gray-200" />
          
          {/* Tooltip text */}
          <p className="text-xs leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  )
}
