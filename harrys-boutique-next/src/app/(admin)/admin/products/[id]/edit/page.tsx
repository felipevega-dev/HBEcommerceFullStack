import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { ProductForm } from '@/components/admin/product-form'

export const metadata: Metadata = { title: "Editar Producto — Admin Harry's Boutique" }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [rawProduct, rawCategories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!rawProduct) notFound()

  const product = {
    id: rawProduct.id,
    name: rawProduct.name,
    description: rawProduct.description,
    price: Number(rawProduct.price),
    originalPrice: rawProduct.originalPrice ? Number(rawProduct.originalPrice) : null,
    images: rawProduct.images,
    categoryId: rawProduct.categoryId,
    subCategory: rawProduct.subCategory,
    colors: rawProduct.colors,
    sizes: Array.isArray(rawProduct.sizes) ? (rawProduct.sizes as string[]) : [],
    bestSeller: rawProduct.bestSeller,
    active: rawProduct.active,
  }

  const categories = serialize(rawCategories)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-black">
          ← Volver
        </Link>
        <h1 className="text-2xl font-semibold">Editar Producto</h1>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
