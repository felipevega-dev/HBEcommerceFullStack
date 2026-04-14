import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAdminAuth } from '@/lib/api-utils'
import { generateSlug } from '@/lib/utils'

/**
 * POST /api/admin/fix-slugs
 * Regenerates slugs for all products that have empty, blank, or malformed slugs.
 * A valid slug must match /^[a-z0-9]+(-[a-z0-9]+)*$/ — lowercase, no spaces, no leading/trailing hyphens.
 */
export async function POST() {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, slug: true },
    })

    const VALID_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
    const toFix = products.filter((p) => !p.slug || !VALID_SLUG.test(p.slug))

    if (toFix.length === 0) {
      return NextResponse.json({ success: true, fixed: 0, message: 'All slugs are already valid' })
    }

    // Build a set of already-used slugs to avoid collisions
    const usedSlugs = new Set(
      products.filter((p) => p.slug && VALID_SLUG.test(p.slug)).map((p) => p.slug),
    )

    const updates: { id: string; slug: string }[] = []

    for (const product of toFix) {
      const base = generateSlug(product.name)
      let slug = base
      let attempt = 1
      // Ensure uniqueness
      while (usedSlugs.has(slug)) {
        slug = `${base}-${attempt++}`
      }
      usedSlugs.add(slug)
      updates.push({ id: product.id, slug })
    }

    // Run all updates in a transaction
    await prisma.$transaction(
      updates.map(({ id, slug }) =>
        prisma.product.update({ where: { id }, data: { slug } }),
      ),
    )

    return NextResponse.json({
      success: true,
      fixed: updates.length,
      slugs: updates.map((u) => ({ id: u.id, slug: u.slug })),
    })
  } catch (e) {
    return handleApiError(e)
  }
}
