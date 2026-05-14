import { describe, expect, it } from 'vitest'
import {
  buildProductImportPayload,
  findImageForRow,
  normalizeImportKey,
  parseProductImportCsv,
} from '../product-import-utils'

const categories = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Perros',
    subcategories: ['Arneses', 'Camas'],
  },
]

function file(name: string) {
  return new File(['image'], name, { type: 'image/webp' })
}

describe('product import utils', () => {
  it('parses quoted CSV rows with commas and lists', () => {
    const csv = [
      'sku,name,description,price,imageFile,category,subCategory,colors,sizes,stock',
      '"HB-001","Arnés, premium","Cómodo y resistente","24.990","HB-001.webp","Perros","Arneses","Negro|Rojo","S|M","12"',
    ].join('\n')

    const result = parseProductImportCsv(csv, categories)

    expect(result.missingColumns).toEqual([])
    expect(result.rows[0]).toMatchObject({
      sku: 'HB-001',
      name: 'Arnés, premium',
      price: 24990,
      colors: ['Negro', 'Rojo'],
      sizes: ['S', 'M'],
      stock: 12,
      errors: [],
    })
  })

  it('matches images by sku before normalized name fallback', () => {
    const [row] = parseProductImportCsv(
      [
        'sku,name,description,price,imageFile,category,subCategory',
        '"HB-001","Arnés Premium","Desc","24990","","Perros","Arneses"',
      ].join('\n'),
      categories,
    ).rows

    expect(findImageForRow(row, [file('arnes-premium.webp'), file('HB-001.jpg')])?.name).toBe(
      'HB-001.jpg',
    )
  })

  it('falls back to normalized product name when sku image is missing', () => {
    const [row] = parseProductImportCsv(
      [
        'sku,name,description,price,imageFile,category,subCategory',
        '"HB-002","Arnés Premium","Desc","24990","","Perros","Arneses"',
      ].join('\n'),
      categories,
    ).rows

    expect(findImageForRow(row, [file('arnes premium.png')])?.name).toBe('arnes premium.png')
  })

  it('reports invalid rows and prevents payload creation', () => {
    const [row] = parseProductImportCsv(
      [
        'sku,name,description,price,imageFile,category,subCategory',
        '"HB-003","","Desc","0","","Perros","Arneses"',
      ].join('\n'),
      categories,
    ).rows

    expect(row.errors).toContain('Nombre requerido')
    expect(row.errors).toContain('Precio inválido')
    expect(buildProductImportPayload(row, ['https://example.com/a.webp'])).toBeNull()
  })

  it('normalizes accents, extensions, and separators', () => {
    expect(normalizeImportKey('Arnés Premium_01.WEBP')).toBe('arnes-premium-01')
  })
})
