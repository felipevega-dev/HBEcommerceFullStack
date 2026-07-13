import { describe, expect, it } from 'vitest'
import {
  getMercadoLibreValidationError,
  resolveMercadoLibreListing,
  validateMercadoLibreUrl,
} from '../mercado-libre'

const activeListing = {
  mercadoLibreStatus: 'ACTIVE' as const,
  mercadoLibreItemId: 'MLC4144018020',
  mercadoLibreUrl:
    'https://www.mercadolibre.cl/poleron-para-perro-thundercats-con-capucha-rojo---negro/up/MLCU4196933505?pdp_filters=item_id:MLC4144018020',
}

describe('Mercado Libre listing validation', () => {
  it('accepts the configured Chile listing', () => {
    expect(resolveMercadoLibreListing(activeListing)).toMatchObject({
      itemId: 'MLC4144018020',
      url: activeListing.mercadoLibreUrl,
    })
  })

  it('rejects a listing that is not active', () => {
    expect(
      resolveMercadoLibreListing({ ...activeListing, mercadoLibreStatus: 'PAUSED' }),
    ).toBeNull()
  })

  it('rejects external hosts, insecure protocols, and non-listing routes', () => {
    expect(
      validateMercadoLibreUrl('http://www.mercadolibre.cl/MLC-4144018020-example-_JM'),
    ).toBeNull()
    expect(
      validateMercadoLibreUrl('https://mercadolibre.cl.evil.example/MLC-4144018020-example-_JM'),
    ).toBeNull()
    expect(validateMercadoLibreUrl('https://www.mercadolibre.cl/listado/mascotas')).toBeNull()
  })

  it('rejects an item ID that does not belong to the destination URL', () => {
    expect(
      resolveMercadoLibreListing({ ...activeListing, mercadoLibreItemId: 'MLC9999999999' }),
    ).toBeNull()
  })

  it('rejects an external URL even when the listing is inactive', () => {
    expect(
      getMercadoLibreValidationError({
        mercadoLibreStatus: 'INACTIVE',
        mercadoLibreUrl: 'https://example.com/MLC-4144018020-example-_JM',
      }),
    ).toBeTruthy()
  })
})
