'use client'

import { ChangeEvent, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { BrandIcon } from '@/components/ui/brand-icon'
import {
  buildImportTemplate,
  buildGroupedProductImportPayloads,
  findImageForRow,
  parseProductImportCsv,
  type ImportCategory,
  type ParsedProductRow,
  type ProductImportPayload,
} from './product-import-utils'

interface Props {
  categories: ImportCategory[]
}

interface UploadResult {
  success: boolean
  fileName: string
  url: string | null
  error: string | null
}

interface ImportFailure {
  row: number
  name: string
  error: string
}

const IMAGE_BATCH_SIZE = 10
const PRODUCT_BATCH_SIZE = 50

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

function getFilePreview(file: File | null) {
  return file ? URL.createObjectURL(file) : null
}

export function ProductCsvImportForm({ categories }: Props) {
  const router = useRouter()
  const csvInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [drafts, setDrafts] = useState<ParsedProductRow[]>([])
  const [fileName, setFileName] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [importing, setImporting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [createProgress, setCreateProgress] = useState({ done: 0, total: 0 })
  const [failures, setFailures] = useState<ImportFailure[]>([])

  const matchedRows = useMemo(() => {
    return drafts.map((draft) => {
      const localFile = findImageForRow(draft, imageFiles)
      return {
        draft,
        localFile,
        preview: getFilePreview(localFile),
        hasImage: draft.imageUrls.length > 0 || Boolean(localFile),
      }
    })
  }, [drafts, imageFiles])

  const summary = useMemo(() => {
    const invalid = matchedRows.filter(({ draft, hasImage }) => {
      return draft.errors.length > 0 || !hasImage
    }).length

    const productKeys = new Set(
      matchedRows.map(({ draft }) => draft.sku || draft.name.trim().toLowerCase()).filter(Boolean),
    )
    const variantRows = matchedRows.filter(
      ({ draft }) => draft.variantSize || draft.variantSku || draft.variantStock !== undefined,
    ).length

    return {
      total: matchedRows.length,
      products: productKeys.size,
      variants: variantRows,
      valid: matchedRows.length - invalid,
      invalid,
      matchedImages: matchedRows.filter((row) => row.localFile).length,
      urlImages: matchedRows.filter((row) => row.draft.imageUrls.length > 0).length,
    }
  }, [matchedRows])

  async function handleCsvFile(file: File) {
    const text = await file.text()
    const result = parseProductImportCsv(text, categories)

    if (result.missingColumns.length > 0) {
      toast.error(`Faltan columnas obligatorias: ${result.missingColumns.join(', ')}`)
      return
    }

    setDrafts(result.rows)
    setFileName(file.name)
    setFailures([])
    setUploadProgress({ done: 0, total: 0 })
    setCreateProgress({ done: 0, total: 0 })
  }

  function handleImageFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith('image/'),
    )
    setImageFiles(files)
    setFailures([])
    event.target.value = ''
  }

  function downloadTemplate() {
    const blob = new Blob([buildImportTemplate()], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'plantilla-productos-harrysboutique.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function uploadImages(files: File[]) {
    const uploaded = new Map<File, string>()
    const batches = chunk(files, IMAGE_BATCH_SIZE)
    setUploadProgress({ done: 0, total: files.length })

    for (const batch of batches) {
      const formData = new FormData()
      for (const file of batch) formData.append('images', file)

      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await response.json()
      const results = (Array.isArray(data.results) ? data.results : []) as UploadResult[]

      if (!response.ok || results.length === 0) {
        throw new Error(data.message ?? 'No se pudieron subir las imágenes')
      }

      for (const result of results) {
        const file = batch.find((item) => item.name === result.fileName)
        if (file && result.success && result.url) uploaded.set(file, result.url)
        if (file && !result.success) {
          setFailures((prev) => [
            ...prev,
            { row: 0, name: file.name, error: result.error ?? 'No se pudo subir la imagen' },
          ])
        }
      }

      setUploadProgress((prev) => ({ ...prev, done: prev.done + batch.length }))
    }

    return uploaded
  }

  async function createProducts(products: ProductImportPayload[]) {
    const batches = chunk(products, PRODUCT_BATCH_SIZE)
    let created = 0
    setCreateProgress({ done: 0, total: products.length })

    for (const batch of batches) {
      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: batch }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? 'No se pudo crear una tanda de productos')
      }

      created += data.created ?? batch.length
      setCreateProgress((prev) => ({ ...prev, done: prev.done + batch.length }))
    }

    return created
  }

  async function runImport(onlyFailed = false) {
    const candidates = onlyFailed
      ? matchedRows.filter(({ draft }) => failures.some((failure) => failure.row === draft.row))
      : matchedRows

    const validRows = candidates.filter(({ draft, hasImage }) => {
      return draft.errors.length === 0 && hasImage
    })

    if (validRows.length === 0) {
      toast.error('No hay filas válidas para importar')
      return
    }

    setImporting(true)
    setFailures([])

    try {
      const filesToUpload = Array.from(
        new Set(validRows.flatMap(({ localFile }) => (localFile ? [localFile] : []))),
      )
      const uploadedUrls = await uploadImages(filesToUpload)

      const rowsWithImages = validRows.map(({ draft, localFile }) => {
        const images = draft.imageUrls.length
          ? draft.imageUrls
          : localFile && uploadedUrls.get(localFile)
            ? [uploadedUrls.get(localFile)!]
            : []
        return { row: draft, images }
      })
      const payloads = buildGroupedProductImportPayloads(rowsWithImages)

      if (payloads.length === 0) {
        toast.error('No hay productos listos para crear después de subir imágenes')
        return
      }

      const created = await createProducts(payloads)
      toast.success(`${created} productos importados`)
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al importar productos')
    } finally {
      setImporting(false)
    }
  }

  const hasRetryableFailures = failures.length > 0

  return (
    <section className="space-y-5 rounded-xl border bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Importador guiado</h2>
          <p className="mt-1 text-sm text-gray-600">
            Sube un CSV y luego las fotos. El sistema empareja por SKU, imageFile o nombre.
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
            onClick={() => csvInputRef.current?.click()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Subir CSV
          </button>
        </div>
      </div>

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleCsvFile(file)
          event.target.value = ''
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageFiles}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => csvInputRef.current?.click()}
          className="rounded-lg border border-dashed border-gray-300 p-4 text-left hover:bg-gray-50"
        >
          <span className="block text-sm font-medium text-gray-900">1. CSV</span>
          <span className="mt-1 block text-sm text-gray-500">{fileName || 'Sin archivo'}</span>
        </button>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="rounded-lg border border-dashed border-gray-300 p-4 text-left hover:bg-gray-50"
        >
          <span className="block text-sm font-medium text-gray-900">2. Fotos</span>
          <span className="mt-1 block text-sm text-gray-500">
            {imageFiles.length
              ? `${imageFiles.length} imágenes seleccionadas`
              : 'Seleccionar fotos'}
          </span>
        </button>
        <div className="rounded-lg border bg-gray-50 p-4">
          <span className="block text-sm font-medium text-gray-900">3. Revisión</span>
          <span className="mt-1 block text-sm text-gray-500">
            {summary.products} productos / {summary.variants} variantes
          </span>
        </div>
      </div>

      {drafts.length > 0 && (
        <>
          <div className="grid gap-3 text-sm md:grid-cols-6">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">Filas</p>
              <p className="text-xl font-semibold">{summary.total}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">Productos</p>
              <p className="text-xl font-semibold">{summary.products}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-green-700">Listas</p>
              <p className="text-xl font-semibold text-green-900">{summary.valid}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-red-700">Con errores</p>
              <p className="text-xl font-semibold text-red-900">{summary.invalid}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-blue-700">Fotos locales</p>
              <p className="text-xl font-semibold text-blue-900">{summary.matchedImages}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-slate-700">URLs</p>
              <p className="text-xl font-semibold text-slate-900">{summary.urlImages}</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <p className="text-purple-700">Variantes</p>
              <p className="text-xl font-semibold text-purple-900">{summary.variants}</p>
            </div>
          </div>

          {(uploadProgress.total > 0 || createProgress.total > 0) && (
            <div className="space-y-2 rounded-lg border bg-gray-50 p-3 text-sm">
              <p>
                Imágenes: {uploadProgress.done} / {uploadProgress.total}
              </p>
              <p>
                Productos: {createProgress.done} / {createProgress.total}
              </p>
            </div>
          )}

          {failures.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p className="font-medium">Fallos recientes</p>
              <ul className="mt-2 space-y-1">
                {failures.slice(0, 6).map((failure, index) => (
                  <li key={`${failure.name}-${index}`}>
                    {failure.row ? `Fila ${failure.row}: ` : ''}
                    {failure.name} - {failure.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="max-h-[520px] overflow-auto rounded-lg border">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Fila</th>
                  <th className="px-3 py-2">Imagen</th>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Precio</th>
                  <th className="px-3 py-2">Categoría</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Variante</th>
                  <th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {matchedRows.map(({ draft, preview, hasImage }) => {
                  const problems = [
                    ...draft.errors,
                    ...(!hasImage ? ['Falta imagen local o URL'] : []),
                    ...draft.warnings,
                  ]

                  return (
                    <tr
                      key={draft.row}
                      className={draft.errors.length || !hasImage ? 'bg-red-50' : 'bg-white'}
                    >
                      <td className="px-3 py-2 font-mono text-xs">{draft.row}</td>
                      <td className="px-3 py-2">
                        {preview ? (
                          <img
                            src={preview}
                            alt={draft.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        ) : draft.imageUrls[0] ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-700">
                            <BrandIcon name="image" className="h-3 w-3" />
                            URL
                          </span>
                        ) : (
                          <span className="text-xs text-red-700">Sin imagen</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900">
                          {draft.name || 'Sin nombre'}
                        </div>
                        <div className="text-xs text-gray-500">{draft.sku || 'Sin SKU'}</div>
                      </td>
                      <td className="px-3 py-2">
                        {draft.price ? `$${draft.price.toLocaleString('es-CL')}` : '-'}
                      </td>
                      <td className="px-3 py-2">
                        {draft.categoryLabel} / {draft.subCategory || '-'}
                      </td>
                      <td className="px-3 py-2">{draft.stock}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {draft.variantSize || draft.variantSku || draft.variantStock !== undefined
                          ? `${draft.variantSize || '-'} / ${draft.variantColor || '-'} / ${draft.variantStock ?? draft.stock}`
                          : 'Stock global'}
                      </td>
                      <td className="px-3 py-2">
                        {problems.length ? (
                          <span className="text-xs text-red-700">{problems.join('; ')}</span>
                        ) : (
                          <span className="text-xs text-green-700">Lista</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {hasRetryableFailures && (
              <button
                type="button"
                disabled={importing}
                onClick={() => void runImport(true)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                Reintentar fallidos
              </button>
            )}
            <button
              type="button"
              disabled={summary.valid === 0 || importing}
              onClick={() => void runImport(false)}
              className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {importing ? 'Importando...' : `Importar ${summary.valid} productos`}
            </button>
          </div>
        </>
      )}
    </section>
  )
}
