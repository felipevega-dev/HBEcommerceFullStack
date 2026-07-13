export const ANALYTICS_EVENTS = [
  'view_item',
  'select_item_variant',
  'use_catalog_filter',
  'search_catalog',
  'click_mercadolibre',
  'start_direct_checkout',
  'complete_direct_purchase',
  'product_without_mercadolibre_listing',
  'invalid_mercadolibre_link',
] as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number]
export type MercadoLibreCtaLocation =
  | 'product_page'
  | 'product_card'
  | 'featured_section'
  | 'search_results'
  | 'cart'

type AnalyticsPayload = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (command: 'event', event: string, payload: AnalyticsPayload) => void
  }
}

let missingConfigurationReported = false

export function trackAnalyticsEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  if (typeof window === 'undefined') return

  if (!process.env.NEXT_PUBLIC_GA_ID || !window.gtag) {
    if (process.env.NODE_ENV === 'production' && !missingConfigurationReported) {
      missingConfigurationReported = true
      console.warn('[Analytics] NEXT_PUBLIC_GA_ID is not configured; events are disabled.')
    }
    return
  }

  window.gtag('event', event, payload)
}
