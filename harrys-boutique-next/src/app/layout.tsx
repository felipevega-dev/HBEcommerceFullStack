import type { Metadata } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-body' })

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: "Harry's Boutique — Ropa y accesorios para mascotas",
  description: 'Descubre nuestra colección de ropa y accesorios para tu mascota.',
  openGraph: {
    siteName: "Harry's Boutique",
    type: 'website',
  },
  keywords: [
    'ropa para mascotas',
    'accesorios para perros',
    'ropa para perros',
    'boutique mascotas',
    'moda mascotas argentina',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geist.variable} ${playfairDisplay.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
