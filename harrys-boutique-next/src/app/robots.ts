import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://harrys-boutique.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/', '/profile/', '/orders/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
