import { StarRating } from '@/components/ui/star-rating'
import { prisma } from '@/lib/prisma'
import { canUseDatabaseFallback, logDatabaseFallback } from '@/lib/db-fallback'

export async function Testimonials() {
  let dbTestimonials: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = []

  try {
    dbTestimonials = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      take: 6,
    })
  } catch (error) {
    if (!canUseDatabaseFallback(error)) throw error
    logDatabaseFallback('Testimonials', error)
  }

  if (dbTestimonials.length === 0) {
    return null
  }

  const testimonials = dbTestimonials.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    comment: t.comment,
    rating: t.rating,
  }))

  return (
    <section>
      <h2
        className="text-2xl md:text-3xl font-medium mb-8 text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Lo que dicen nuestros clientes
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <article
            key={t.id}
            className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)] flex flex-col gap-4"
          >
            <span
              className="text-[var(--color-accent)] text-4xl font-serif leading-none select-none"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed flex-1">
              {t.comment}
            </p>
            <div className="flex flex-col gap-1">
              <StarRating average={t.rating} count={1} />
              <span className="font-semibold text-[var(--color-text-primary)] text-sm">
                {t.name}
              </span>
              {t.role && <span className="text-xs text-[var(--color-text-muted)]">{t.role}</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
