'use client'

import { useEffect, useRef, useState } from 'react'
import { ButtonWithFeedback } from '@/components/ui/button-with-feedback'

interface StickyAddToCartProps {
  productName: string
  price: number
  disabled: boolean
  onAddToCart: () => Promise<void>
}

export function StickyAddToCart({
  productName,
  price,
  disabled,
  onAddToCart,
}: StickyAddToCartProps) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(anchor)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={anchorRef} aria-hidden className="h-px w-full lg:hidden" />
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-background)]/95 p-4 backdrop-blur-md transition-transform duration-200 lg:hidden ${
          visible && !disabled ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
              {productName}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              ${price.toLocaleString('es-CL')}
            </p>
          </div>
          <ButtonWithFeedback
            onClick={onAddToCart}
            variant="primary"
            size="md"
            className="shrink-0"
            disabled={disabled}
          >
            Añadir
          </ButtonWithFeedback>
        </div>
      </div>
    </>
  )
}
