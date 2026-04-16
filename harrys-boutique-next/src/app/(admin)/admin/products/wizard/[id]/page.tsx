import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import ProductWizard from '@/components/admin/product-wizard'
import type { ProductData } from '@/components/admin/product-wizard/types'

export const metadata: Metadata = { 
  title: "Editar Producto — Admin Harry's Boutique",
  description: "Wizard guiado para editar un producto existente"
}

/**
 * Edit Product Wizard Page
 * 
 * Server component that fetches the product data and categories,
 * then renders the ProductWizard in edit mode with pre-populated data.
 */
export default async function EditProductWizardPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params

  // Fetch product and categories in parallel
  const [rawProduct, rawCategories] = await Promise.all([
    prisma.product.findUnique({ 
      where: { id },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    }),
    prisma.category.findMany({ 
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        subcategories: true
      }
    }),
  ])

  // Return 404 if product not found
  if (!rawProduct) {
    notFound()
  }

  // Transform product data to match ProductData interface
  const initialData: ProductData = {
    // Step 1: Images (URLs for existing product)
    images: rawProduct.images,
    imageOrder: rawProduct.images.map((_, index) => index),
    
    // Step 2: Basic Info
    name: rawProduct.name,
    description: rawProduct.description,
    
    // Step 3: Pricing
    price: Number(rawProduct.price),
    hasDiscount: rawProduct.originalPrice !== null,
    originalPrice: rawProduct.originalPrice ? Number(rawProduct.originalPrice) : undefined,
    
    // Step 4: Category
    categoryId: rawProduct.categoryId,
    subCategory: rawProduct.subCategory,
    
    // Step 5: Sizes and Colors
    sizes: Array.isArray(rawProduct.sizes) ? (rawProduct.sizes as string[]) : [],
    colors: rawProduct.colors,
    
    // Step 6: Final Options
    stock: rawProduct.stock || 0,
    bestSeller: rawProduct.bestSeller,
    active: rawProduct.active,
    
    // Metadata
    id: rawProduct.id,
    createdAt: rawProduct.createdAt,
    updatedAt: rawProduct.updatedAt,
  }

  const categories = serialize(rawCategories)

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductWizard 
        productId={id}
        initialData={initialData}
        categories={categories}
      />
    </div>
  )
}
