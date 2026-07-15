import { revalidatePath, revalidateTag } from 'next/cache'

export function revalidateCatalogCache() {
  revalidateTag('collection', 'max')
  revalidatePath('/tienda')
  revalidatePath('/collection')
  revalidatePath('/')
}
