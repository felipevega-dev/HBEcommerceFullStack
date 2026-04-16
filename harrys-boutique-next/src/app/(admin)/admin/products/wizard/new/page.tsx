import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import ProductWizard from '@/components/admin/product-wizard'

export const metadata: Metadata = { 
  title: "Crear Producto — Admin Harry's Boutique",
  description: "Wizard guiado para crear un nuevo producto paso a paso"
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
      subcategories: true
    }
  })
  
  const categories = serialize(rawCategories)

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductWizard categories={categories} />
    </div>
  )
}
