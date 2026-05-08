import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { ProductBulkForm } from '@/components/admin/product-bulk-form'
import { ProductCsvImportForm } from '@/components/admin/product-csv-import-form'

export const metadata: Metadata = { title: "Carga Masiva de Productos — Admin Harry's Boutique" }

export default async function NewBulkProductsPage() {
  const raw = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  const categories = serialize(raw)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products/wizard/new" className="text-sm text-gray-500 hover:text-black">
          ← Volver
        </Link>
        <h1 className="text-2xl font-semibold">Carga Masiva</h1>
      </div>
      <ProductCsvImportForm categories={categories} />
      <ProductBulkForm categories={categories} />
    </div>
  )
}
