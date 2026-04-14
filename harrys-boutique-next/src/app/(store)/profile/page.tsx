import type { UserWithAddresses } from '@/components/store/profile-page-client'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { ProfilePageClient } from '@/components/store/profile-page-client'

export const metadata: Metadata = {
  title: "Mi Perfil — Harry's Boutique",
  robots: { index: false },
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/profile')

  const raw = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: true },
    omit: { password: true },
  })

  if (!raw) redirect('/login')

  const user = serialize(raw) as unknown as UserWithAddresses

  return <ProfilePageClient user={user} />
}
