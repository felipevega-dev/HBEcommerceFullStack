import { revalidatePath, revalidateTag } from 'next/cache'

const STORE_CONTENT_PATHS = [
  '/',
  '/about',
  '/faq',
  '/envios',
  '/devoluciones',
  '/contact',
  '/tienda',
]

/** Home sections: collections, featured products, Instagram posts and testimonials. */
export function revalidateHomePage() {
  revalidatePath('/')
}

/** Pages that render store settings such as shipping fees, contact data or the About content. */
export function revalidateStoreContentPages() {
  for (const path of STORE_CONTENT_PATHS) revalidatePath(path)
}

export function revalidateCatalogCache() {
  revalidateTag('collection', 'max')
  revalidatePath('/tienda')
  revalidatePath('/collection')
  revalidatePath('/')
}

/** Product pages are cached per route; call after bulk price/availability changes. */
export function revalidateProductPages() {
  revalidatePath('/product/[id]', 'page')
}
