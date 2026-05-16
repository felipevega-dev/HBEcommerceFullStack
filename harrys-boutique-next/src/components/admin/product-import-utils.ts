export interface ImportCategory {
  id: string
  name: string
  subcategories: string[]
}

export interface ParsedProductRow {
  row: number
  name: string
  description: string
  seoTitle?: string
  seoDescription?: string
  price: number | null
  originalPrice?: number
  imageUrls: string[]
  imageFile?: string
  categoryId: string
  categoryLabel: string
  subCategory: string
  colors: string[]
  sizes: string[]
  sku?: string
  variantSku?: string
  variantSize?: string
  variantColor?: string
  variantStock?: number
  variantActive?: boolean
  stock: number
  active: boolean
  bestSeller: boolean
  errors: string[]
  warnings: string[]
}

export interface ImageMatch {
  file: File
  key: string
  preview: string
}

export interface ProductImportPayload {
  name: string
  description: string
  seoTitle?: string
  seoDescription?: string
  price: number
  originalPrice?: number
  images: string[]
  categoryId: string
  subCategory: string
  colors: string[]
  sizes: string[]
  sku?: string
  stock: number
  active: boolean
  bestSeller: boolean
  variants?: ProductImportVariantPayload[]
}

export interface ProductImportVariantPayload {
  size: string
  color?: string
  sku?: string
  stock: number
  active: boolean
}

export const REQUIRED_IMPORT_COLUMNS = ['name', 'description', 'price', 'category', 'subCategory']

const MONEY_CLEANUP_RE = /\$/g
const THOUSANDS_SEPARATOR_RE = /\./g
const FILE_EXTENSION_RE = /\.[^/.]+$/
const SAFE_NAME_RE = /[^a-z0-9]+/g

export function parseCsvRows(text: string) {
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      i++
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(current.trim())
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++
      row.push(current.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      current = ''
      continue
    }

    current += char
  }

  row.push(current.trim())
  if (row.some(Boolean)) rows.push(row)

  return rows
}

export function normalizeImportKey(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(FILE_EXTENSION_RE, '')
    .replace(SAFE_NAME_RE, ' ')
    .trim()
    .replace(/\s+/g, '-')
}

export function parseImportList(value: string) {
  return value
    .split(/[|;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function parseImportMoney(value: string) {
  const normalized = value
    .replace(MONEY_CLEANUP_RE, '')
    .replace(THOUSANDS_SEPARATOR_RE, '')
    .replace(',', '.')
    .trim()
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function parseImportBoolean(value: string, fallback: boolean) {
  if (!value) return fallback
  return ['1', 'true', 'si', 'sí', 'yes', 'activo', 'active'].includes(value.trim().toLowerCase())
}

export function isValidImportUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function parseProductImportCsv(text: string, categories: ImportCategory[]) {
  const rows = parseCsvRows(text)
  if (rows.length < 2) {
    return { rows: [] as ParsedProductRow[], missingColumns: REQUIRED_IMPORT_COLUMNS }
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase())
  const missingColumns = REQUIRED_IMPORT_COLUMNS.filter(
    (column) => !headers.includes(column.toLowerCase()),
  )
  if (missingColumns.length > 0) {
    return { rows: [] as ParsedProductRow[], missingColumns }
  }

  const categoryByIdOrName = new Map<string, ImportCategory>()
  for (const category of categories) {
    categoryByIdOrName.set(category.id.toLowerCase(), category)
    categoryByIdOrName.set(category.name.toLowerCase(), category)
  }

  const parsedRows = rows.slice(1).map((row, index) => {
    const get = (name: string) => row[headers.indexOf(name.toLowerCase())] ?? ''
    const categoryRaw = get('category')
    const category = categoryByIdOrName.get(categoryRaw.toLowerCase())
    const imageUrls = parseImportList(get('imageUrls'))
    const imageFile = get('imageFile') || undefined
    const price = parseImportMoney(get('price'))
    const originalPrice = parseImportMoney(get('originalPrice'))
    const subCategory = get('subCategory')
    const stock = Math.max(0, Number.parseInt(get('stock') || '0', 10) || 0)
    const variantStockRaw = get('variantStock')
    const variantStock = variantStockRaw
      ? Math.max(0, Number.parseInt(variantStockRaw, 10) || 0)
      : undefined
    const variantSize = get('size') || undefined
    const variantColor = get('color') || undefined
    const variantSku = get('variantSku') || undefined
    const hasVariantData = Boolean(variantSize || variantColor || variantSku || variantStockRaw)
    const errors: string[] = []
    const warnings: string[] = []

    if (!get('name')) errors.push('Nombre requerido')
    if (!get('description')) errors.push('Descripción requerida')
    if (get('seoTitle').length > 70) errors.push('Título SEO supera 70 caracteres')
    if (get('seoDescription').length > 160) errors.push('Descripción SEO supera 160 caracteres')
    if (!price) errors.push('Precio inválido')
    if (imageUrls.some((url) => !isValidImportUrl(url))) errors.push('URL de imagen inválida')
    if (!imageUrls.length && !imageFile) warnings.push('Falta imagen local o URL')
    if (!category) errors.push(`Categoría no encontrada: ${categoryRaw}`)
    if (category && !category.subcategories.includes(subCategory)) {
      errors.push(`Subcategoría no existe en ${category.name}`)
    }

    if (hasVariantData && !variantSize) errors.push('Variante sin talla')
    if (variantSku && !variantSize) errors.push('variantSku requiere size')

    return {
      row: index + 2,
      name: get('name'),
      description: get('description'),
      seoTitle: get('seoTitle') || undefined,
      seoDescription: get('seoDescription') || undefined,
      price,
      originalPrice: originalPrice ?? undefined,
      imageUrls,
      imageFile,
      categoryId: category?.id ?? '',
      categoryLabel: category?.name ?? categoryRaw,
      subCategory,
      colors: parseImportList(get('colors')).length ? parseImportList(get('colors')) : ['Único'],
      sizes: parseImportList(get('sizes')).length ? parseImportList(get('sizes')) : ['ÚNICA'],
      sku: get('sku') || undefined,
      variantSku,
      variantSize,
      variantColor,
      variantStock,
      variantActive: hasVariantData ? parseImportBoolean(get('variantActive'), true) : undefined,
      stock,
      active: parseImportBoolean(get('active'), true),
      bestSeller: parseImportBoolean(get('bestSeller'), false),
      errors,
      warnings,
    }
  })

  return { rows: parsedRows, missingColumns: [] }
}

export function buildImageMatchMap(files: File[]) {
  const matches = new Map<string, File>()

  for (const file of files) {
    const withExtension = normalizeImportKey(file.name)
    const withoutPath = normalizeImportKey(file.name.split('/').pop() ?? file.name)
    matches.set(withExtension, file)
    matches.set(withoutPath, file)
  }

  return matches
}

export function findImageForRow(row: ParsedProductRow, files: File[]) {
  const matches = buildImageMatchMap(files)
  const candidates = [
    row.imageFile,
    row.sku,
    row.name,
    row.imageFile?.split('/').pop(),
    row.imageFile?.split('\\').pop(),
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeImportKey)

  for (const candidate of candidates) {
    const match = matches.get(candidate)
    if (match) return match
  }

  return null
}

export function buildProductImportPayload(row: ParsedProductRow, images: string[]) {
  if (!row.price) return null
  if (!images.length) return null
  if (row.errors.length) return null

  const payload: ProductImportPayload = {
    name: row.name.trim(),
    description: row.description.trim(),
    seoTitle: row.seoTitle?.trim() || undefined,
    seoDescription: row.seoDescription?.trim() || undefined,
    price: row.price,
    originalPrice: row.originalPrice,
    images,
    categoryId: row.categoryId,
    subCategory: row.subCategory,
    colors: row.colors,
    sizes: row.sizes,
    sku: row.sku,
    stock: row.stock,
    active: row.active,
    bestSeller: row.bestSeller,
  }

  return payload
}

function importGroupKey(row: ParsedProductRow) {
  return row.sku ? `sku:${row.sku}` : `name:${normalizeImportKey(row.name)}`
}

export function buildGroupedProductImportPayloads(
  rows: Array<{ row: ParsedProductRow; images: string[] }>,
) {
  const grouped = new Map<
    string,
    { source: ParsedProductRow; images: string[]; rows: ParsedProductRow[] }
  >()

  for (const item of rows) {
    const key = importGroupKey(item.row)
    const current = grouped.get(key)
    if (current) {
      current.rows.push(item.row)
      if (!current.images.length) current.images = item.images
    } else {
      grouped.set(key, { source: item.row, images: item.images, rows: [item.row] })
    }
  }

  return Array.from(grouped.values()).flatMap(({ source, images, rows }) => {
    const payload = buildProductImportPayload(source, images)
    if (!payload) return []

    const variants = rows.flatMap((row) => {
      if (!row.variantSize && !row.variantSku && row.variantStock === undefined) return []
      return [
        {
          size: row.variantSize || row.sizes[0] || 'UNICA',
          color: row.variantColor ?? row.colors[0] ?? '',
          sku: row.variantSku,
          stock: row.variantStock ?? row.stock,
          active: row.variantActive ?? true,
        },
      ]
    })

    if (variants.length > 0) {
      payload.variants = variants
      payload.stock = variants
        .filter((variant) => variant.active)
        .reduce((sum, variant) => sum + variant.stock, 0)
      payload.sizes = Array.from(new Set(variants.map((variant) => variant.size)))
      payload.colors = Array.from(new Set(variants.map((variant) => variant.color || 'Unico')))
    }

    return [payload]
  })
}

export function buildImportTemplate() {
  const headers = [
    'sku',
    'name',
    'description',
    'seoTitle',
    'seoDescription',
    'price',
    'originalPrice',
    'imageFile',
    'imageUrls',
    'category',
    'subCategory',
    'colors',
    'sizes',
    'stock',
    'size',
    'color',
    'variantSku',
    'variantStock',
    'variantActive',
    'active',
    'bestSeller',
  ]
  const example = [
    'HB-001',
    'Arnés premium para perro',
    'Arnés ajustable y cómodo para paseos diarios',
    'Arnés premium para perro | Harrys Boutique',
    'Compra arnés ajustable para perros. Material cómodo, resistente y despacho en Chile.',
    '24990',
    '29990',
    'HB-001.webp',
    '',
    'Perros',
    'Arneses',
    'Negro|Rojo',
    'S|M|L',
    '20',
    'S',
    'Negro',
    'HB-001-S-NEGRO',
    '8',
    'true',
    'true',
    'false',
  ]

  return `${headers.join(',')}\n${example.map((value) => `"${value}"`).join(',')}\n`
}
