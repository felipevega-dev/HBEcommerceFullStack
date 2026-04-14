import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { ProductForm } from '@/components/admin/product-form'

export const metadata: Metadata = { title: "Nuevo Producto — Admin Harry's Boutique" }

export default async function NewProductPage() {
  const raw = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  const categories = serialize(raw)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-black">
          ← Volver
        </Link>
        <h1 className="text-2xl font-semibold">Nuevo Producto</h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}
