import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AboutContentEditor } from '@/components/admin/about-content-editor'
import { ABOUT_CONTENT_SETTING_KEY, parseAboutContent } from '@/lib/about-content'

export const metadata: Metadata = { title: "Contenido Nosotros - Admin Harry's Boutique" }

export default async function AdminAboutContentPage() {
  const setting = await prisma.settings.findUnique({
    where: { key: ABOUT_CONTENT_SETTING_KEY },
    select: { value: true },
  })

  return <AboutContentEditor initialContent={parseAboutContent(setting?.value)} />
}
