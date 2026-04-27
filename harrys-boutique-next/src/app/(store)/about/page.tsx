import type { Metadata } from 'next'
import Link from 'next/link'
import { AboutPageClient } from '@/components/store/about-page-client'

export const metadata: Metadata = {
  title: "Nosotros — Harry's Boutique",
  description:
    "Conoce la historia de Harry's Boutique, tu tienda de ropa y accesorios para mascotas.",
}

const stats = [
  { value: '5000+', label: 'Mascotas Felices', icon: '🐾' },
  { value: '200+', label: 'Productos Únicos', icon: '✨' },
  { value: '4', label: 'Años de Amor', icon: '❤️' },
  { value: '4.9★', label: 'Calificación', icon: '⭐' },
]

const values = [
  {
    title: 'Calidad Premium',
    description: 'Cada producto seleccionado con los más altos estándares para el confort de tu mascota',
    icon: '🎯',
  },
  {
    title: 'Amor Animal',
    description: 'Cada decisión tomada pensando en el bienestar y felicidad de tus compañeros',
    icon: '💛',
  },
  {
    title: 'Comunidad',
    description: 'Construimos una familia de amantes de las mascotas que comparten nuestra pasión',
    icon: '🤝',
  },
  {
    title: 'Sostenibilidad',
    description: 'Comprometidos con productos eco-amigables y prácticas comerciales responsables',
    icon: '🌱',
  },
]

export default function AboutPage() {
  return (
    <AboutPageClient stats={stats} values={values} />


  )
}