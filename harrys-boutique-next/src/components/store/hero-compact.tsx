import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  image: string
  product: { id: string; name: string }
}

export function HeroCompact({ slides }: { slides: HeroSlide[] }) {
  const slide = slides[0]

  if (!slide) {
    return (
      <section className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-hero-overlay)] text-white">
        <div className="flex min-h-[280px] flex-col justify-center px-6 py-12 sm:min-h-[320px] sm:px-10 lg:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Harry&apos;s Boutique
          </p>
          <h1
            className="mt-3 max-w-xl text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Moda premium para tu mascota
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/75 sm:text-base">
            Prendas seleccionadas, calidad superior y compra simple.
          </p>
          <div className="mt-8">
            <Button
              href="/collection"
              size="lg"
              className="bg-white text-[var(--color-primary)] hover:bg-[var(--color-gold-light)]"
            >
              Ver colección
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-hero-overlay)] text-white">
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-hero-overlay)]/90 via-[var(--color-hero-overlay)]/55 to-transparent" />
      </div>

      <div className="relative flex min-h-[280px] flex-col justify-center px-6 py-12 sm:min-h-[320px] sm:px-10 lg:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Destacado</p>
        <h1
          className="mt-3 max-w-xl text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="mt-4 max-w-md text-sm text-white/75 sm:text-base">{slide.subtitle}</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            href={`/product/${slide.product.id}`}
            size="lg"
            className="bg-white text-[var(--color-primary)] hover:bg-[var(--color-gold-light)]"
          >
            Comprar ahora
          </Button>
          <Button
            href="/collection"
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Ver colección
          </Button>
        </div>
      </div>
    </section>
  )
}
