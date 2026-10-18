import { describe, expect, it } from 'vitest'
import {
  MERCADO_LIBRE_AVAILABILITY_LABELS,
  getMercadoLibreListingAvailability,
  isMercadoLibreListingPurchasable,
  mapMercadoLibreItemStatus,
  resolveMercadoLibreListing,
  resolveProductPurchaseChannel,
} from '../mercado-libre'

const url = 'https://articulo.mercadolibre.cl/MLC-4144018020-collar-bordado-_JM'
const syncedAt = new Date('2026-10-18T12:00:00.000Z')

describe('Mercado Libre listing availability', () => {
  it('is unknown until the listing has been synced, regardless of the manual status', () => {
    expect(getMercadoLibreListingAvailability({ mercadoLibreStatus: 'PAUSED' })).toBe('unknown')
    expect(
      getMercadoLibreListingAvailability({
        mercadoLibreStatus: 'ACTIVE',
        mercadoLibreAvailable: false,
        mercadoLibreSyncedAt: null,
      }),
    ).toBe('unknown')
    expect(
      getMercadoLibreListingAvailability({
        mercadoLibreStatus: 'ACTIVE',
        mercadoLibreSyncedAt: 'not a date',
      }),
    ).toBe('unknown')
  })

  it.each([
    ['ACTIVE', true, 'available'],
    ['ACTIVE', null, 'available'],
    ['ACTIVE', false, 'sold_out'],
    ['PAUSED', true, 'paused'],
    ['INACTIVE', true, 'closed'],
  ] as const)('maps synced status %s with available=%s to %s', (status, available, expected) => {
    expect(
      getMercadoLibreListingAvailability({
        mercadoLibreStatus: status,
        mercadoLibreAvailable: available,
        mercadoLibreSyncedAt: syncedAt,
      }),
    ).toBe(expected)
  })

  it('exposes availability and the sync timestamp on the resolved listing', () => {
    const listing = resolveMercadoLibreListing({
      mercadoLibreUrl: url,
      mercadoLibreStatus: 'ACTIVE',
      mercadoLibreAvailable: false,
      mercadoLibreSyncedAt: syncedAt.toISOString(),
    })

    expect(listing).toEqual({
      url,
      itemId: 'MLC4144018020',
      availability: 'sold_out',
      syncedAt: '2026-10-18T12:00:00.000Z',
    })
  })

  it('keeps the Mercado Libre channel even when the listing is paused', () => {
    const channel = resolveProductPurchaseChannel({
      mercadoLibreUrl: url,
      mercadoLibreStatus: 'PAUSED',
      mercadoLibreSyncedAt: syncedAt,
    })

    expect(channel.type).toBe('mercadolibre')
    expect(channel.type === 'mercadolibre' && channel.listing.availability).toBe('paused')
  })

  it('only links out for available or unknown listings', () => {
    expect(isMercadoLibreListingPurchasable('available')).toBe(true)
    expect(isMercadoLibreListingPurchasable('unknown')).toBe(true)
    expect(isMercadoLibreListingPurchasable('sold_out')).toBe(false)
    expect(isMercadoLibreListingPurchasable('paused')).toBe(false)
    expect(isMercadoLibreListingPurchasable('closed')).toBe(false)
  })

  it('has a label for every availability state', () => {
    for (const state of ['available', 'unknown', 'sold_out', 'paused', 'closed'] as const) {
      expect(MERCADO_LIBRE_AVAILABILITY_LABELS[state]).toBeTruthy()
    }
  })
})

describe('mapMercadoLibreItemStatus', () => {
  it.each([
    ['active', 'ACTIVE'],
    ['Active', 'ACTIVE'],
    ['paused', 'PAUSED'],
    ['under_review', 'PAUSED'],
    ['payment_required', 'PAUSED'],
    ['closed', 'INACTIVE'],
    ['inactive', 'INACTIVE'],
    ['something_new', 'INACTIVE'],
    [undefined, 'INACTIVE'],
    [null, 'INACTIVE'],
  ])('maps %s to %s', (status, expected) => {
    expect(mapMercadoLibreItemStatus(status)).toBe(expected)
  })
})
