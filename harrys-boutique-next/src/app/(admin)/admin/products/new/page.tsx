import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: "Nuevo Producto — Admin Harry's Boutique" }

export default function NewProductPage() {
  redirect('/admin/products/wizard/new')
}
