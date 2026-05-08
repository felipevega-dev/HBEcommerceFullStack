import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: "Editar Producto — Admin Harry's Boutique" }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/admin/products/wizard/${id}`)
}
