import type { Metadata } from 'next'
import { HomeEditorialHero } from '@/components/store/home-editorial-hero'
import { HomeEditorialSections } from '@/components/store/home-editorial-sections'

export const metadata: Metadata = {
  title: "Harry's Boutique | Ropa y accesorios para mascotas",
  description: "Descubre ropa y accesorios de diseño para mascotas en Harry's Boutique.",
  openGraph: {
    title: "Harry's Boutique | Ropa y accesorios para mascotas",
    description: "Descubre ropa y accesorios de diseño para mascotas en Harry's Boutique.",
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <main className="-mx-4 flex flex-col sm:-mx-[5vw] md:-mx-[7vw] lg:-mx-[9vw]">
      <HomeEditorialHero />
      <HomeEditorialSections />
    </main>
  )
}
