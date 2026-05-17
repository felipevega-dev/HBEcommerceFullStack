import { getSiteUrl } from '@/lib/site'

const STORE_NAME = "Harry's Boutique"
const INSTAGRAM_URL = 'https://www.instagram.com/harrysboutique.CL'

export function stringifyJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function getStoreStructuredData() {
  const siteUrl = getSiteUrl()

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: STORE_NAME,
      url: siteUrl,
      logo: `${siteUrl}/opengraph-image`,
      sameAs: [INSTAGRAM_URL],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'PetStore',
      '@id': `${siteUrl}/#store`,
      name: STORE_NAME,
      url: siteUrl,
      image: `${siteUrl}/opengraph-image`,
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Arica',
        addressCountry: 'CL',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Chile',
      },
      sameAs: [INSTAGRAM_URL],
    },
  ]
}

export function getBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function getFaqStructuredData(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}
