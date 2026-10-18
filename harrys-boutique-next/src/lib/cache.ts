import { revalidatePath, revalidateTag } from 'next/cache'

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
