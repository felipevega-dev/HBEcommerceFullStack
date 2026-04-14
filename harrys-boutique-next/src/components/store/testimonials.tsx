import { StarRating } from '@/components/ui/star-rating'
import { prisma } from '@/lib/prisma'

const STATIC_TESTIMONIALS = [
  {
    id: 'static-1',
    name: 'María García',
    role: 'Dueña de Harry',
    comment: 'Increíble calidad, mi perro Harry ama su nuevo abrigo. ¡Lo recomiendo totalmente!',
    rating: 5,
  },
  {
    id: 'static-2',
    name: 'Carlos López',
    role: 'Dueño de Luna',
    comment: 'Envío rápido y el producto llegó perfecto. El collar es hermoso y muy resistente.',
    rating: 5,
  },
  {
    id: 'static-3',
    name: 'Ana Martínez',
    role: 'Dueña de Mochi',
    comment: 'Excelente atención al cliente. Me ayudaron a elegir el talle correcto para mi gato.',
    rating: 5,
  },
]

export async function Testimonials() {
  let testimonials = STATIC_TESTIMONIALS

  try {
    const dbTestimonials = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      take: 6,
    })
    if (dbTestimonials.length > 0) {
      testimonials = dbTestimonials.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        comment: t.comment,
        rating: t.rating,
      }))
    }
  } catch {
    // DB not available, use static fallback
  }

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
              <StarRating average={t.rating} count={0} />
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
