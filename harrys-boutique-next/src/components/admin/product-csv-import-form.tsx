'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

interface Category {
  id: string
  name: string
  subcategories: string[]
}

interface Props {
  categories: Category[]
}

interface CsvDraft {
  row: number
  name: string
  description: string
  seoTitle?: string
  seoDescription?: string
  price: number | null
  originalPrice?: number
  imageUrls: string[]
  categoryId: string
  categoryLabel: string
  subCategory: string
  colors: string[]
  sizes: string[]
  sku?: string
  stock: number
  active: boolean
  bestSeller: boolean
  errors: string[]
}

const REQUIRED_COLUMNS = ['name', 'description', 'price', 'imageUrls', 'category', 'subCategory']

function parseCsv(text: string) {
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && next === '"') {
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

function parseList(value: string) {
  return value
    .split(/[|;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseMoney(value: string) {
  const normalized = value.replace(/\$/g, '').replace(/\./g, '').replace(',', '.').trim()
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function parseBoolean(value: string, fallback: boolean) {
  if (!value) return fallback
  return ['1', 'true', 'si', 'sí', 'yes', 'activo', 'active'].includes(value.trim().toLowerCase())
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase()
}

function buildTemplate() {
  const headers = [
    'name',
    'description',
    'seoTitle',
    'seoDescription',
    'price',
    'imageUrls',
    'category',
    'subCategory',
    'colors',
    'sizes',
    'stock',
    'sku',
    'active',
    'bestSeller',
  ]
  const example = [
    'Arnes premium para perro',
    'Arnes ajustable y comodo para paseos diarios',
    'Arnes premium para perro | Harrys Boutique',
    'Compra arnes ajustable para perros. Material comodo, resistente y despacho en Chile.',
    '24990',
    'https://example.com/arnes.jpg',
    'Perros',
    'Arneses',
    'Negro|Rojo',
    'S|M|L',
    '20',
    'ARNES-PREMIUM-001',
    'true',
    'false',
  ]

  return `${headers.join(',')}\n${example.map((value) => `"${value}"`).join(',')}\n`
}

export function ProductCsvImportForm({ categories }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [drafts, setDrafts] = useState<CsvDraft[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)

  const categoryByIdOrName = useMemo(() => {
    const map = new Map<string, Category>()
    for (const category of categories) {
      map.set(category.id.toLowerCase(), category)
      map.set(category.name.toLowerCase(), category)
    }
    return map
  }, [categories])

  const summary = useMemo(() => {
    const invalid = drafts.filter((draft) => draft.errors.length > 0).length
    return {
      total: drafts.length,
      valid: drafts.length - invalid,
      invalid,
    }
  }, [drafts])

  async function handleFile(file: File) {
    const text = await file.text()
    const rows = parseCsv(text)

    if (rows.length < 2) {
      toast.error('El CSV debe incluir encabezados y al menos una fila')
      return
    }

    const headers = rows[0].map(normalizeHeader)
    const missingColumns = REQUIRED_COLUMNS.filter(
      (column) => !headers.includes(column.toLowerCase()),
    )
    if (missingColumns.length > 0) {
      toast.error(`Faltan columnas obligatorias: ${missingColumns.join(', ')}`)
      return
    }

    const nextDrafts = rows.slice(1).map((row, index) => {
      const get = (name: string) => row[headers.indexOf(name.toLowerCase())] ?? ''
      const categoryRaw = get('category')
      const category = categoryByIdOrName.get(categoryRaw.toLowerCase())
      const imageUrls = parseList(get('imageUrls'))
      const price = parseMoney(get('price'))
      const originalPrice = parseMoney(get('originalPrice'))
      const subCategory = get('subCategory')
      const stock = Math.max(0, Number.parseInt(get('stock') || '0', 10) || 0)
      const errors: string[] = []

      if (!get('name')) errors.push('Nombre requerido')
      if (!get('description')) errors.push('Descripcion requerida')
      if (get('seoTitle').length > 70) errors.push('Titulo SEO supera 70 caracteres')
      if (get('seoDescription').length > 160) {
        errors.push('Descripcion SEO supera 160 caracteres')
      }
      if (!price) errors.push('Precio invalido')
      if (imageUrls.length === 0) errors.push('Al menos una imagen requerida')
      if (imageUrls.some((url) => !isValidUrl(url))) errors.push('URL de imagen invalida')
      if (!category) errors.push(`Categoria no encontrada: ${categoryRaw}`)
      if (category && !category.subcategories.includes(subCategory)) {
        errors.push(`Subcategoria no existe en ${category.name}`)
      }

      return {
        row: index + 2,
        name: get('name'),
        description: get('description'),
        seoTitle: get('seoTitle') || undefined,
        seoDescription: get('seoDescription') || undefined,
        price,
        originalPrice: originalPrice ?? undefined,
        imageUrls,
        categoryId: category?.id ?? '',
        categoryLabel: category?.name ?? categoryRaw,
        subCategory,
        colors: parseList(get('colors')).length ? parseList(get('colors')) : ['Unico'],
        sizes: parseList(get('sizes')).length ? parseList(get('sizes')) : ['UNICA'],
        sku: get('sku') || undefined,
        stock,
        active: parseBoolean(get('active'), true),
        bestSeller: parseBoolean(get('bestSeller'), false),
        errors,
      }
    })

    setDrafts(nextDrafts)
    setFileName(file.name)
  }

  function downloadTemplate() {
    const blob = new Blob([buildTemplate()], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'plantilla-productos-harrysboutique.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function importValidRows() {
    const validRows = drafts.filter((draft) => draft.errors.length === 0)
    if (validRows.length === 0) {
      toast.error('No hay filas validas para importar')
      return
    }

    setImporting(true)
    try {
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: validRows.map((draft) => ({
            name: draft.name.trim(),
            description: draft.description.trim(),
            seoTitle: draft.seoTitle?.trim() || undefined,
            seoDescription: draft.seoDescription?.trim() || undefined,
            price: draft.price,
            originalPrice: draft.originalPrice,
            images: draft.imageUrls,
            categoryId: draft.categoryId,
            subCategory: draft.subCategory,
            colors: draft.colors,
            sizes: draft.sizes,
            sku: draft.sku,
            stock: draft.stock,
            active: draft.active,
            bestSeller: draft.bestSeller,
          })),
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? 'No se pudo importar el CSV')
      }

      toast.success(`${data.created} productos importados`)
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al importar productos')
    } finally {
      setImporting(false)
    }
  }

  return (
    <section className="space-y-4 rounded-xl border bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Importar productos por CSV</h2>
          <p className="mt-1 text-sm text-gray-600">
            Usa URLs de imagen, categorias existentes y separa colores/tallas con <code>|</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadTemplate}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Descargar plantilla
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Seleccionar CSV
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
          event.target.value = ''
        }}
      />

      {drafts.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 text-sm">
            <span className="font-medium text-gray-800">{fileName}</span>
            <div className="flex gap-3">
              <span className="text-gray-600">{summary.total} filas</span>
              <span className="text-green-700">{summary.valid} validas</span>
              <span className="text-red-700">{summary.invalid} con errores</span>
            </div>
          </div>

          <div className="max-h-96 overflow-auto rounded-lg border">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Fila</th>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Precio</th>
                  <th className="px-3 py-2">Categoria</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Errores</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {drafts.map((draft) => (
                  <tr key={draft.row} className={draft.errors.length ? 'bg-red-50' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono text-xs">{draft.row}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">{draft.name || 'Sin nombre'}</div>
                      <div className="text-xs text-gray-500">{draft.sku || 'Sin SKU'}</div>
                    </td>
                    <td className="px-3 py-2">
                      {draft.price ? `$${draft.price.toLocaleString('es-CL')}` : '-'}
                    </td>
                    <td className="px-3 py-2">
                      {draft.categoryLabel} / {draft.subCategory || '-'}
                    </td>
                    <td className="px-3 py-2">{draft.stock}</td>
                    <td className="px-3 py-2">{draft.active ? 'Activo' : 'Inactivo'}</td>
                    <td className="px-3 py-2">
                      {draft.errors.length ? (
                        <span className="text-xs text-red-700">{draft.errors.join('; ')}</span>
                      ) : (
                        <span className="text-xs text-green-700">Lista</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={summary.valid === 0 || importing}
              onClick={importValidRows}
              className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {importing ? 'Importando...' : `Importar ${summary.valid} productos validos`}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
