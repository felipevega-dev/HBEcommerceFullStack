import { getSiteUrl } from '@/lib/site'
import { CURRENCY_CODE } from '@/lib/commerce'
import {
  resolveProductPurchaseChannel,
  type MercadoLibreListingInput,
  type ProductPurchaseChannel,
} from '@/lib/mercado-libre'

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

interface ProductStructuredDataInput extends MercadoLibreListingInput {
  id: string
  name: string
  description: string
  images: string[]
  category: string
  price: number
  stock: number
  ratingAverage: number
  ratingCount: number
  url: string
}

const IN_STOCK = 'https://schema.org/InStock'
const OUT_OF_STOCK = 'https://schema.org/OutOfStock'

/** Mercado Libre listings only expose availability once they have been synced. */
function getOfferAvailability(channel: ProductPurchaseChannel, stock: number) {
  if (channel.type === 'direct') {
    return { availability: stock > 0 ? IN_STOCK : OUT_OF_STOCK }
  }

  switch (channel.listing.availability) {
    case 'available':
      return { availability: IN_STOCK }
    case 'sold_out':
    case 'paused':
    case 'closed':
      return { availability: OUT_OF_STOCK }
    default:
      return {}
  }
}

export function getProductStructuredData(product: ProductStructuredDataInput) {
  const purchaseChannel = resolveProductPurchaseChannel(product)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': product.url,
    name: product.name,
    description: product.description,
    image: product.images,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: STORE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      price: product.price,
      priceCurrency: CURRENCY_CODE,
      itemCondition: 'https://schema.org/NewCondition',
      ...getOfferAvailability(purchaseChannel, product.stock),
    },
    ...(product.ratingCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingAverage,
        reviewCount: product.ratingCount,
      },
    }),
  }
}
