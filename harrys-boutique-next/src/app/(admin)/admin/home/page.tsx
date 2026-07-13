import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { HomeContentManager } from '@/components/admin/home-content-manager'

export const metadata: Metadata = { title: "Home - Admin Harry's Boutique" }
export const dynamic = 'force-dynamic'

export default async function AdminHomePage() {
  const [categories, products, featured, instagramPosts, categoryBlocks] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ homeOrder: 'asc' }, { name: 'asc' }] }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ bestSeller: 'desc' }, { name: 'asc' }],
      select: { id: true, name: true, images: true, active: true, stock: true, categoryId: true },
    }),
    prisma.homeProductSelection.findMany({
      where: { section: 'FEATURED' },
      orderBy: { order: 'asc' },
      select: { productId: true, visible: true, order: true },
    }),
    prisma.instagramPost.findMany({
      orderBy: [{ homeOrder: 'asc' }, { createdAt: 'desc' }],
      take: 50,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        instagramUrl: true,
        altText: true,
        homeCaption: true,
        likes: true,
        homeVisible: true,
        homeOrder: true,
      },
    }),
    prisma.homeCategoryBlock.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' },
          select: { productId: true, visible: true, order: true },
        },
      },
    }),
  ])

  const eligibleProducts = products.filter((product) => product.active && product.stock > 0)
  const initialFeatured =
    featured.length > 0
      ? featured
      : eligibleProducts.slice(0, 4).map((product, order) => ({
          productId: product.id,
          visible: true,
          order,
        }))

  return (
    <div className="space-y-6">
      <div className="ui-page-header">
        <div>
          <p className="ui-eyebrow">Contenido</p>
          <h1 className="mt-1 text-3xl">Home</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Administra las secciones comerciales sin modificar el diseño del frontend.
          </p>
        </div>
      </div>
      <HomeContentManager
        categories={categories}
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          image: product.images[0] ?? null,
          active: product.active,
          stock: product.stock,
          categoryId: product.categoryId,
        }))}
        featured={initialFeatured}
        instagramPosts={instagramPosts}
        categoryBlocks={categoryBlocks.map((block) => ({
          categoryId: block.categoryId,
          mode: block.mode === 'MANUAL' ? 'MANUAL' : 'AUTO',
          maxItems: block.maxItems,
          visible: block.visible,
          order: block.order,
          items: block.items,
        }))}
      />
    </div>
  )
}
