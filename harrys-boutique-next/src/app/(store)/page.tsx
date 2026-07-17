import type { Metadata } from 'next'
import { HomeEditorialHero } from '@/components/store/home-editorial-hero'
import { HomeEditorialSections } from '@/components/store/home-editorial-sections'
import { getHomeContent } from '@/lib/home-content'

export const metadata: Metadata = {
  title: "Harry's Boutique | Ropa y accesorios para mascotas",
  description: "Descubre ropa y accesorios de diseño para mascotas en Harry's Boutique.",
  openGraph: {
    title: "Harry's Boutique | Ropa y accesorios para mascotas",
    description: "Descubre ropa y accesorios de diseño para mascotas en Harry's Boutique.",
    type: 'website',
  },
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const homeContent = await getHomeContent()

  return (
    <main className="home-warm -mx-4 flex flex-col bg-[var(--color-background)] sm:-mx-[5vw] md:-mx-[7vw] lg:-mx-[9vw]">
      <HomeEditorialHero />
      <HomeEditorialSections content={homeContent} />
    </main>
  )
}
