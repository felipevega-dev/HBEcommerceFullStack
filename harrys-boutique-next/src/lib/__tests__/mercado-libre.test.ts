import { describe, expect, it } from 'vitest'
import {
  getMercadoLibreValidationError,
  mergeMercadoLibreListingInput,
  resolveMercadoLibreListing,
  resolveProductPurchaseChannel,
  validateMercadoLibreUrl,
} from '../mercado-libre'

const userProductUrl =
  'https://www.mercadolibre.cl/poleron-para-perro/up/MLCU4196933505?pdp_filters=item_id:MLC4144018020'

describe('Mercado Libre listing validation', () => {
  it.each([
    userProductUrl,
    'https://articulo.mercadolibre.cl/MLC-4144018020-collar-bordado-_JM',
    'https://www.mercadolibre.cl/p/MLC4144018020',
  ])('accepts an official Chile listing: %s', (url) => {
    expect(validateMercadoLibreUrl(url)).not.toBeNull()
  })

  it('uses a valid URL as the purchase source without requiring status or item ID', () => {
    expect(resolveProductPurchaseChannel({ mercadoLibreUrl: userProductUrl })).toMatchObject({
      type: 'mercadolibre',
      listing: { itemId: 'MLC4144018020', url: userProductUrl },
    })
    expect(
      resolveMercadoLibreListing({
        mercadoLibreUrl: userProductUrl,
        mercadoLibreStatus: 'PAUSED',
      }),
    ).not.toBeNull()
  })

  it('uses direct checkout when the product has no URL', () => {
    expect(resolveProductPurchaseChannel({ mercadoLibreUrl: null })).toEqual({ type: 'direct' })
  })

  it('preserves listing fields during a partial product edit', () => {
    const current = {
      mercadoLibreUrl: userProductUrl,
      mercadoLibreItemId: 'MLC4144018020',
      mercadoLibreStatus: 'ACTIVE' as const,
    }

    expect(mergeMercadoLibreListingInput(current, {})).toEqual(current)
    expect(mergeMercadoLibreListingInput(current, { mercadoLibreUrl: null })).toEqual({
      ...current,
      mercadoLibreUrl: null,
    })
  })

  it('derives the item ID from the official URL when the admin leaves it empty', () => {
    expect(
      mergeMercadoLibreListingInput(
        { mercadoLibreUrl: null, mercadoLibreItemId: null, mercadoLibreStatus: 'INACTIVE' },
        { mercadoLibreUrl: userProductUrl },
      ),
    ).toEqual({
      mercadoLibreUrl: userProductUrl,
      mercadoLibreItemId: 'MLC4144018020',
      mercadoLibreStatus: 'INACTIVE',
    })
  })

  it.each([
    'http://www.mercadolibre.cl/MLC-4144018020-example-_JM',
    'https://mercadolibre.cl.evil.example/MLC-4144018020-example-_JM',
    'https://mercadolibre.cl/MLC-4144018020-example-_JM',
    'https://www.mercadolibre.cl/listado/mascotas',
    'https://www.mercadolibre.cl/poleron/up/MLCU4196933505',
  ])('rejects an unsafe or non-listing URL: %s', (url) => {
    expect(validateMercadoLibreUrl(url)).toBeNull()
  })

  it('rejects an item ID that does not belong to the destination URL', () => {
    const input = { mercadoLibreUrl: userProductUrl, mercadoLibreItemId: 'MLC9999999999' }
    expect(resolveMercadoLibreListing(input)).toBeNull()
    expect(getMercadoLibreValidationError(input)).toMatch(/no coincide/i)
  })

  it('rejects an external URL regardless of the technical status', () => {
    expect(
      getMercadoLibreValidationError({
        mercadoLibreStatus: 'INACTIVE',
        mercadoLibreUrl: 'https://example.com/MLC-4144018020-example-_JM',
      }),
    ).toMatch(/Mercado Libre Chile/i)
  })
})
