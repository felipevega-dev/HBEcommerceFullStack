import Link from 'next/link'
import Image from 'next/image'
import type { HomeContent } from '@/lib/home-content'
import type { HomeProduct } from '@/lib/home-content'
import { resolveProductPurchaseChannel } from '@/lib/mercado-libre'
import { MercadoLibreLink } from './mercado-libre-link'

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

function HomeProductAction({ product }: { product: HomeProduct }) {
  const channel = resolveProductPurchaseChannel(product)

  if (channel.type === 'mercadolibre') {
    return (
      <MercadoLibreLink
        href={channel.listing.url}
        itemId={channel.listing.itemId}
        productId={product.id}
        productName={product.name}
        location="featured_section"
        className="inline-flex items-center gap-2 rounded-full border border-[#e8c56c] bg-[#fff8e8] px-3 py-2 text-xs font-semibold text-[#684707] transition-colors hover:bg-[#ffefc5]"
      >
        Comprar en Mercado Libre <Arrow />
      </MercadoLibreLink>
    )
  }

  return (
    <Link
      href={product.href}
      className="inline-flex items-center gap-2 rounded-full border border-[#eee4dd] px-3 py-2 text-xs font-semibold text-[#29231f] transition-colors hover:border-[#d79a18] hover:text-[#a96808]"
    >
      Comprar en Harry&apos;s <Arrow />
    </Link>
  )
}

function Placeholder({
  label,
  tone = 'peach',
  image,
  href,
  className = '',
}: {
  label: string
  tone?: Tone
  image?: string | null
  href?: string
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

  if (image) {
    const imageContent = (
      <>
        <Image
          src={image}
          alt={label}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </>
    )
    return href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative block overflow-hidden ${className}`}
        aria-label={label}
      >
        {imageContent}
      </a>
    ) : (
      <div className={`relative overflow-hidden ${className}`} role="img" aria-label={label}>
        {imageContent}
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${tones[tone]} ${className}`}
      role="img"
      aria-label={label}
    >
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/70" />
      <div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-white/30 blur-2xl" />
    </div>
  )
}

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

export function HomeEditorialSections({ content }: { content: HomeContent }) {
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
          {content.collections.map((collection) => (
            <Link
              key={collection.id}
              href={collection.href}
              className="group overflow-hidden rounded-[1.5rem] bg-white shadow-[0_10px_30px_rgba(70,48,35,0.06)]"
            >
              <div className="relative aspect-[1.08] overflow-hidden">
                <Placeholder
                  label={`Fotografía colección ${collection.title}`}
                  tone="sage"
                  image={collection.image}
                  className="h-full transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex items-center justify-between px-5 py-5">
                <div>
                  <h3 className="text-lg font-semibold text-[#1b1b1b]">{collection.title}</h3>
                  {collection.description && (
                    <p className="mt-1 text-xs text-[#756b63]">{collection.description}</p>
                  )}
                  <p className="mt-1 text-xs text-[#756b63]">Ver colección</p>
                </div>
                <Arrow />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[2rem] bg-[#f8eee7] lg:grid-cols-2">
        <div className="relative min-h-[360px] overflow-hidden lg:min-h-[540px]">
          <Placeholder
            label="Fotografía lifestyle de Harry's Boutique"
            tone="denim"
            className="h-full min-h-[360px] lg:min-h-[540px]"
          />
          <Image
            src="/nosotrosfull.png"
            alt="Familia y mascotas de Harry's Boutique"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
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
          {content.products.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-[1.4rem] bg-white shadow-[0_10px_30px_rgba(70,48,35,0.06)]"
            >
              <div className="relative">
                <Placeholder
                  label={`Fotografía ${product.name}`}
                  tone="denim"
                  image={product.image}
                  className="aspect-square"
                />
                {product.isNew && (
                  <span className="absolute left-4 top-4 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-[#a96808]">
                    NUEVO
                  </span>
                )}
                {product.mercadoLibreUrl && (
                  <span className="absolute bottom-4 left-4 rounded-full border border-[#f2d38c] bg-[#fff8e8]/95 px-2.5 py-1 text-[9px] font-bold text-[#76520d]">
                    MERCADO LIBRE
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#29231f]">{product.name}</h3>
                  <p className="mt-1 text-xs text-[#847970]">
                    ${product.price.toLocaleString('es-CL')}
                  </p>
                </div>
                <HomeProductAction product={product} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {content.categoryBlocks.map((block) => (
        <section key={block.categoryId}>
          <SectionTitle
            eyebrow="COLECCIÓN"
            title={block.title}
            link="Ver colección"
            href={`/collection?category=${encodeURIComponent(block.title)}`}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {block.products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[1.4rem] bg-white shadow-[0_10px_30px_rgba(70,48,35,0.06)]"
              >
                <div className="relative">
                  <Placeholder
                    label={`Fotografía ${product.name}`}
                    tone="sand"
                    image={product.image}
                    className="aspect-square"
                  />
                  {product.isNew && (
                    <span className="absolute left-4 top-4 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-[#a96808]">
                      NUEVO
                    </span>
                  )}
                  {product.mercadoLibreUrl && (
                    <span className="absolute bottom-4 left-4 rounded-full border border-[#f2d38c] bg-[#fff8e8]/95 px-2.5 py-1 text-[9px] font-bold text-[#76520d]">
                      MERCADO LIBRE
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#29231f]">{product.name}</h3>
                    <p className="mt-1 text-xs text-[#847970]">
                      ${product.price.toLocaleString('es-CL')}
                    </p>
                  </div>
                  <HomeProductAction product={product} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className={content.instagramPosts.length === 0 ? 'hidden' : ''}>
        {content.instagramPosts.length > 0 && (
          <SectionTitle eyebrow="COMUNIDAD" title="Síguenos en Instagram" />
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {content.instagramPosts.map((post, index) => (
            <Placeholder
              key={post.id}
              label={`Fotografía Instagram ${index + 1}`}
              tone={(['peach', 'sand', 'denim', 'sage', 'stone', 'ink'] as Tone[])[index]}
              image={post.imageUrl}
              href={post.instagramUrl}
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

      <section
        className={`grid gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-center ${content.testimonial ? '' : 'hidden'}`}
      >
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
        {content.testimonial && (
          <div className="rounded-[1.5rem] bg-white px-8 py-9 shadow-[0_12px_35px_rgba(70,48,35,0.07)] sm:px-12">
            <p className="text-sm tracking-[0.25em] text-[#d79a18]">
              {'★'.repeat(Math.max(0, Math.min(5, content.testimonial.rating)))}
            </p>
            <blockquote
              className="mt-5 max-w-2xl text-2xl leading-relaxed text-[#2b2521]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              “{content.testimonial.comment}”
            </blockquote>
            <p className="mt-5 text-sm text-[#7e746d]">
              {content.testimonial.name}
              {content.testimonial.role ? ` · ${content.testimonial.role}` : ''}
            </p>
          </div>
        )}
        <div className="hidden rounded-[1.5rem] bg-white px-8 py-9 shadow-[0_12px_35px_rgba(70,48,35,0.07)] sm:px-12">
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
        <div className="relative min-h-[260px] overflow-hidden">
          <Image
            src="/nosotros.JPG"
            alt="Espacio de Harry's Boutique"
            fill
            sizes="(max-width: 1024px) 100vw, 30vw"
            className="object-cover"
          />
        </div>
        <div className="relative min-h-[260px] overflow-hidden">
          <Image
            src="/banner.png"
            alt="Harry's Boutique"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
      </section>
    </div>
  )
}
