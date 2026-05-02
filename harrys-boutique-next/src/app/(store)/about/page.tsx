import type { Metadata } from 'next'
import { AboutPageClient } from '@/components/store/about-page-client'
import type { BrandIconName } from '@/components/ui/brand-icon'

export const metadata: Metadata = {
  title: "Nosotros - Harry's Boutique",
  description:
    "Conoce la historia de Harry's Boutique, tu tienda de ropa y accesorios para mascotas.",
}

const stats = [
  { value: '5000+', label: 'Clientes atendidos', icon: 'handshake' },
  { value: '200+', label: 'Productos seleccionados', icon: 'shirt' },
  { value: '4', label: 'Años de experiencia', icon: 'check-circle' },
  { value: '4.9', label: 'Valoración promedio', icon: 'star' },
] satisfies Array<{ value: string; label: string; icon: BrandIconName }>

const values = [
  {
    title: 'Calidad verificable',
    description: 'Seleccionamos telas, terminaciones y proveedores con criterios claros de durabilidad.',
    icon: 'target',
  },
  {
    title: 'Comodidad primero',
    description: 'Priorizamos calces que respeten el movimiento y el uso cotidiano de cada mascota.',
    icon: 'ruler',
  },
  {
    title: 'Atención cercana',
    description: 'Acompañamos la elección con información práctica, cambios claros y respuesta directa.',
    icon: 'handshake',
  },
  {
    title: 'Identidad de marca',
    description: 'Cuidamos que cada colección tenga una estética reconocible sin sacrificar funcionalidad.',
    icon: 'design',
  },
] satisfies Array<{ title: string; description: string; icon: BrandIconName }>

export default function AboutPage() {
  return <AboutPageClient stats={stats} values={values} />
}
