import type { Metadata } from 'next'
import { AboutPageClient } from '@/components/store/about-page-client'
import { prisma } from '@/lib/prisma'
import { ABOUT_CONTENT_SETTING_KEY, parseAboutContent } from '@/lib/about-content'

export const metadata: Metadata = {
  title: "Nosotros - Harry's Boutique",
  description:
    "Conoce la historia de Harry's Boutique, tu tienda de ropa y accesorios para mascotas.",
}

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const setting = await prisma.settings.findUnique({
    where: { key: ABOUT_CONTENT_SETTING_KEY },
    select: { value: true },
  })
  const content = parseAboutContent(setting?.value)

  return <AboutPageClient content={content} />
}
