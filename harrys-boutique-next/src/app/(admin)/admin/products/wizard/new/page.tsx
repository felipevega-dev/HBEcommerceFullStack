import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import ProductWizard from '@/components/admin/product-wizard'

export const metadata: Metadata = {
  title: "Crear Producto — Admin Harry's Boutique",
  description: 'Wizard guiado para crear un nuevo producto paso a paso',
}

/**
 * New Product Wizard Page
 *
 * Server component that fetches categories and renders the ProductWizard
 * in create mode. The wizard guides users through 7 steps to create a product.
 */
export default async function NewProductWizardPage() {
  // Fetch categories for Step 4 (Category Selection)
  const rawCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      subcategories: true,
    },
  })

  const categories = serialize(rawCategories)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/products" className="text-sm text-gray-500 hover:text-black">
            ← Volver
          </Link>
          <span className="text-xl font-semibold">Nuevo Producto</span>
          <Link
            href="/admin/products/new/bulk"
            className="ml-auto rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Carga masiva
          </Link>
        </div>
      </div>
      <ProductWizard categories={categories} />
    </div>
  )
}
