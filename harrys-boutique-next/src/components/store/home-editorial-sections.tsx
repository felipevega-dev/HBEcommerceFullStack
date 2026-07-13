import Link from 'next/link'

type Tone = 'peach' | 'stone' | 'ink' | 'sage' | 'sand' | 'denim'

function Arrow() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 10h13M11 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Placeholder({
  label,
  tone = 'peach',
  className = '',
}: {
  label: string
  tone?: Tone
  className?: string
}) {
  const tones: Record<Tone, string> = {
    peach: 'from-[#f8e5da] via-[#fdf7f2] to-[#dfaa9d]',
    stone: 'from-[#ede9e4] via-[#faf8f5] to-[#c5b6a8]',
    ink: 'from-[#171717] via-[#38332e] to-[#a76f53]',
    sage: 'from-[#eff0df] via-[#fdfbf7] to-[#9ba078]',
    sand: 'from-[#f4eadf] via-[#fffaf5] to-[#d7b596]',
    denim: 'from-[#d8e2e8] via-[#f9faf9] to-[#617d91]',
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${tones[tone]} ${className}`}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/70" />
      <div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-white/30 blur-2xl" />
      <div className="absolute bottom-5 left-5 rounded-full border border-white/75 bg-white/55 px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] text-[#514942] backdrop-blur-sm">
        IMAGEN PENDIENTE
      </div>
      <p className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#4f4741]/70">
        {label}
      </p>
    </div>
  )
}

const collections: Array<{ title: string; tone: Tone; query: string }> = [
  { title: 'Polerones', tone: 'sage', query: 'Polerones' },
  { title: 'Arneses', tone: 'sand', query: 'Arneses' },
  { title: 'Chaquetas', tone: 'stone', query: 'Chaquetas' },
]

const products: Array<{ name: string; tone: Tone }> = [
  { name: 'Producto destacado 01', tone: 'denim' },
  { name: 'Producto destacado 02', tone: 'sage' },
  { name: 'Producto destacado 03', tone: 'peach' },
  { name: 'Producto destacado 04', tone: 'sand' },
]

function SectionTitle({
  eyebrow,
  title,
  link,
  href,
}: {
  eyebrow: string
  title: string
  link?: string
  href?: string
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#d79a18]">{eyebrow}</p>
        <h2
          className="mt-3 text-4xl leading-none text-[#1b1b1b] sm:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h2>
      </div>
      {link && href && (
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1b1b1b] hover:text-[#a96808]"
        >
          {link} <Arrow />
        </Link>
      )}
    </div>
  )
}

export function HomeEditorialSections() {
  return (
    <div className="mx-auto w-full max-w-[1536px] space-y-20 px-4 py-14 sm:px-6 sm:py-20 lg:space-y-28 lg:px-8 lg:py-24">
      <section>
        <SectionTitle
          eyebrow="COLECCIONES"
          title="Explora nuestras colecciones"
          link="Ver todas las colecciones"
          href="/collection"
        />
        <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.title}
              href={`/collection?search=${encodeURIComponent(collection.query)}`}
              className="group overflow-hidden rounded-[1.5rem] bg-white shadow-[0_10px_30px_rgba(70,48,35,0.06)]"
            >
              <Placeholder
                label={`Fotografía colección ${collection.title}`}
                tone={collection.tone}
                className="aspect-[1.08] transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="flex items-center justify-between px-5 py-5">
                <div>
                  <h3 className="text-lg font-semibold text-[#1b1b1b]">{collection.title}</h3>
                  <p className="mt-1 text-xs text-[#756b63]">Ver colección</p>
                </div>
                <Arrow />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[2rem] bg-[#f8eee7] lg:grid-cols-2">
        <Placeholder
          label="Fotografía lifestyle de Harry's Boutique"
          tone="denim"
          className="min-h-[360px] lg:min-h-[540px]"
        />
        <div className="relative flex flex-col justify-center px-8 py-14 sm:px-14 lg:px-20">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#a96808]">NUESTRA HISTORIA</p>
          <h2
            className="mt-5 max-w-md text-5xl leading-[0.96] text-[#1b1b1b] sm:text-6xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Más que ropa, creamos momentos.
          </h2>
          <p className="mt-7 max-w-md text-base leading-7 text-[#635a54]">
            Harry&apos;s Boutique nace para acompañar la personalidad y los pequeños rituales que
            hacen única la vida junto a una mascota.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[#2f2823] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a96808]"
          >
            Conoce más sobre nosotros <Arrow />
          </Link>
        </div>
      </section>

      <section>
        <SectionTitle
          eyebrow="SELECCIÓN HARRY'S"
          title="Productos destacados"
          link="Ver todos los productos"
          href="/collection"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {products.map((product, index) => (
            <article
              key={product.name}
              className="overflow-hidden rounded-[1.4rem] bg-white shadow-[0_10px_30px_rgba(70,48,35,0.06)]"
            >
              <div className="relative">
                <Placeholder
                  label={`Fotografía ${product.name}`}
                  tone={product.tone}
                  className="aspect-square"
                />
                {index !== 1 && (
                  <span className="absolute left-4 top-4 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-[#a96808]">
                    NUEVO
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#29231f]">{product.name}</h3>
                  <p className="mt-1 text-xs text-[#847970]">Precio disponible al publicar</p>
                </div>
                <Link
                  href="/collection"
                  aria-label={`Ver ${product.name}`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#eee4dd] text-[#1b1b1b] transition-colors hover:border-[#d79a18] hover:text-[#a96808]"
                >
                  <Arrow />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[2rem] bg-[#f4e1d7] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center px-8 py-14 sm:px-14 lg:px-16">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#a96808]">
            HARRY&apos;S ATELIER
          </p>
          <h2
            className="mt-5 text-5xl leading-[0.95] text-[#1b1b1b] sm:text-6xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Personalización que lo hace <span className="italic text-[#c98612]">único</span>
          </h2>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
            {['Nombre bordado', 'Colores exclusivos', 'Hecho a mano'].map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#594c44]"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full border border-[#d7b26c] text-[#a96808]">
                  +
                </span>
                {benefit}
              </span>
            ))}
          </div>
          <Link
            href="/experiencias#atelier"
            className="mt-9 inline-flex w-fit items-center gap-2 rounded-full bg-[#2f2823] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a96808]"
          >
            Personalizar ahora <Arrow />
          </Link>
        </div>
        <Placeholder
          label="Close-up de etiqueta bordada Harry's Boutique"
          tone="peach"
          className="min-h-[340px] lg:min-h-full"
        />
      </section>

      <section>
        <SectionTitle eyebrow="COMUNIDAD" title="Síguenos en Instagram" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {Array.from({ length: 6 }, (_, index) => (
            <Placeholder
              key={index}
              label={`Fotografía Instagram ${index + 1}`}
              tone={(['peach', 'sand', 'denim', 'sage', 'stone', 'ink'] as Tone[])[index]}
              className="aspect-square rounded-[1.25rem]"
            />
          ))}
        </div>
        <a
          href="https://www.instagram.com/harrysboutique.cl/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1b1b1b] hover:text-[#a96808]"
        >
          @harrysboutique.cl <Arrow />
        </a>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-center">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#d79a18]">
            COMUNIDAD HARRY&apos;S
          </p>
          <h2
            className="mt-3 text-5xl leading-[0.95] text-[#1b1b1b] sm:text-6xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Lo que dicen nuestros clientes
          </h2>
        </div>
        <div className="rounded-[1.5rem] bg-white px-8 py-9 shadow-[0_12px_35px_rgba(70,48,35,0.07)] sm:px-12">
          <p className="text-sm tracking-[0.25em] text-[#d79a18]">★★★★★</p>
          <blockquote
            className="mt-5 max-w-2xl text-2xl leading-relaxed text-[#2b2521]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            “Tu experiencia con Harry&apos;s Boutique podría aparecer aquí.”
          </blockquote>
          <p className="mt-5 text-sm text-[#7e746d]">
            Espacio reservado para testimonios verificados.
          </p>
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[2rem] bg-[#f6eee8] lg:grid-cols-[0.62fr_0.78fr_1fr]">
        <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-10">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#d79a18]">VISÍTANOS</p>
          <h2
            className="mt-4 text-4xl leading-none text-[#1b1b1b]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Encuentra a Harry&apos;s Boutique
          </h2>
          <p className="mt-5 text-sm leading-6 text-[#6e635c]">
            La ubicación, horarios y referencias se publicarán desde información verificada.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-[#2d2724] px-4 py-2.5 text-sm font-semibold text-[#29231f] transition-colors hover:bg-[#1b1b1b] hover:text-white"
          >
            Consultar ubicación <Arrow />
          </Link>
        </div>
        <Placeholder label="Mapa de ubicación pendiente" tone="stone" className="min-h-[260px]" />
        <Placeholder label="Fotografía del local pendiente" tone="sand" className="min-h-[260px]" />
      </section>
    </div>
  )
}
