import type { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { WishlistPageClient } from '@/components/store/wishlist-page-client'

export const metadata: Metadata = {
  title: "Mis Favoritos — Harry's Boutique",
  robots: { index: false },
}

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/wishlist')

  const raw = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  })

  const wishlist = serialize(raw)

  return <WishlistPageClient wishlist={wishlist} />
}
