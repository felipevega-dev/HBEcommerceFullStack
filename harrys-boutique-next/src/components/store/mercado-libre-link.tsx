'use client'

import type { ReactNode } from 'react'
import { trackAnalyticsEvent, type MercadoLibreCtaLocation } from '@/lib/analytics'

interface MercadoLibreLinkProps {
  href: string
  itemId?: string
  productId: string
  productName: string
  productSlug?: string
  location: MercadoLibreCtaLocation
  className?: string
  children: ReactNode
}

export function MercadoLibreLink({
  href,
  itemId,
  productId,
  productName,
  productSlug,
  location,
  className,
  children,
}: MercadoLibreLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() =>
        trackAnalyticsEvent('click_mercadolibre', {
          item_id: productId,
          item_name: productName,
          item_slug: productSlug,
          mercado_libre_item_id: itemId,
          cta_location: location,
          destination_url: href,
        })
      }
    >
      {children}
    </a>
  )
}
