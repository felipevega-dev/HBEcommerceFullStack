import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { ProductEditForm } from '@/components/admin/product-edit-form'
import type { ProductData } from '@/components/admin/product-wizard/types'

export const metadata: Metadata = { title: "Editar Producto - Admin Harry's Boutique" }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [rawProduct, rawCategories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        price: true,
        originalPrice: true,
        images: true,
        categoryId: true,
        subCategory: true,
        sizes: true,
        colors: true,
        stock: true,
        bestSeller: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        subcategories: true,
      },
    }),
  ])

  if (!rawProduct) {
    notFound()
  }

  const initialData: ProductData = {
    images: rawProduct.images,
    imageOrder: rawProduct.images.map((_, index) => index),
    name: rawProduct.name,
    description: rawProduct.description,
    seoTitle: rawProduct.seoTitle ?? '',
    seoDescription: rawProduct.seoDescription ?? '',
    price: Number(rawProduct.price),
    hasDiscount: rawProduct.originalPrice !== null,
    originalPrice: rawProduct.originalPrice ? Number(rawProduct.originalPrice) : undefined,
    categoryId: rawProduct.categoryId,
    subCategory: rawProduct.subCategory,
    sizes: Array.isArray(rawProduct.sizes) ? (rawProduct.sizes as string[]) : [],
    colors: rawProduct.colors,
    stock: rawProduct.stock,
    bestSeller: rawProduct.bestSeller,
    active: rawProduct.active,
    id: rawProduct.id,
    createdAt: rawProduct.createdAt,
    updatedAt: rawProduct.updatedAt,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductEditForm
        productId={id}
        initialData={serialize(initialData)}
        categories={serialize(rawCategories)}
      />
    </div>
  )
}
