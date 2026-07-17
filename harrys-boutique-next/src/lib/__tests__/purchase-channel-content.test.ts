import { describe, expect, it } from 'vitest'
import {
  getDirectShippingSummary,
  getFaqSections,
  getPurchaseChannelHelp,
} from '@/lib/purchase-channel-content'

describe('purchase channel help content', () => {
  it('describes the configured direct shipping threshold', () => {
    const summary = getDirectShippingSummary({
      shippingFee: 3990,
      freeShippingThreshold: 60000,
    })

    expect(summary).toContain('$60.000')
    expect(summary).toContain('$3.990')
  })

  it('does not promise free shipping when the threshold is disabled', () => {
    const pricing = { shippingFee: 4990, freeShippingThreshold: 0 }
    const summary = getDirectShippingSummary(pricing)
    const faqText = getFaqSections(pricing)
      .flatMap((section) => section.items)
      .map((item) => item.a)
      .join(' ')

    expect(summary).not.toContain('gratis')
    expect(faqText).not.toContain('compras directas, el despacho es gratis')
    expect(faqText).toContain('$4.990')
  })

  it('keeps Mercado Libre and direct conditions separate', () => {
    const channels = getPurchaseChannelHelp({
      shippingFee: 3990,
      freeShippingThreshold: 50000,
    })
    const mercadoLibre = channels.find((item) => item.channel === 'mercadolibre')
    const direct = channels.find((item) => item.channel === 'direct')

    expect(mercadoLibre?.description).toContain('stock')
    expect(mercadoLibre?.highlights.join(' ')).toContain('Mercado Libre')
    expect(mercadoLibre?.highlights.join(' ')).not.toContain('$50.000')
    expect(direct?.highlights.join(' ')).toContain('$50.000')
  })

  it('uses the same FAQ data shape rendered by FAQ JSON-LD', () => {
    const sections = getFaqSections({ shippingFee: 3990, freeShippingThreshold: 50000 })
    const items = sections.flatMap((section) => section.items)

    expect(items.some((item) => item.a.includes('10 días'))).toBe(true)
    expect(items.some((item) => item.a.includes('seis meses'))).toBe(true)
    expect(items.some((item) => item.a.includes('Mis compras'))).toBe(true)
  })
})
