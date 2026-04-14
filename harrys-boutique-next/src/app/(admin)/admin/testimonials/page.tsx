import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { TestimonialsManager } from '@/components/admin/testimonials-manager'

export const metadata: Metadata = { title: "Testimonios — Admin Harry's Boutique" }

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: 'asc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Testimonios</h1>
      <TestimonialsManager testimonials={testimonials} />
    </div>
  )
}
