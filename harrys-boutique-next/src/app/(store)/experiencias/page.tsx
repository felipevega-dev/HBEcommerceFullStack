import type { Metadata } from 'next'
import { PetExperiencePageClient } from '@/components/store/pet-experience-page-client'

export const metadata: Metadata = {
  title: "Harry's World — Experiencias para mascotas",
  description:
    'Quiz de estilo, drops limitados, cajas de cumpleanos, personalizacion y comunidad para mascotas con identidad.',
  openGraph: {
    title: "Harry's World — Experiencias para mascotas",
    description: 'Compra por personalidad, ocasion y momentos compartibles en Harrys Boutique.',
    type: 'website',
  },
}

export default function PetExperiencesPage() {
  return <PetExperiencePageClient />
}
