import type { Metadata } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import { Providers } from '@/components/providers'
import { getSiteOrigin } from '@/lib/site'
import { getStoreStructuredData, stringifyJsonLd } from '@/lib/structured-data'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-body' })

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  metadataBase: getSiteOrigin(),
  title: "Harry's Boutique — Ropa y accesorios para mascotas en Chile",
  description:
    'Ropa para perros, gatos y accesorios para mascotas en Chile. Compra online con envíos, cambios y pagos seguros.',
  openGraph: {
    siteName: "Harry's Boutique",
    type: 'website',
    locale: 'es_CL',
  },
  keywords: [
    'ropa para mascotas',
    'ropa para mascotas chile',
    'accesorios para perros',
    'ropa para perros',
    'ropa para gatos',
    'ropa para perros pequeños',
    'tienda de mascotas en chile',
    'boutique mascotas',
    'moda mascotas chile',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const storeStructuredData = getStoreStructuredData()

  return (
    <html lang="es" className={`${geist.variable} ${playfairDisplay.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: stringifyJsonLd(storeStructuredData) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
