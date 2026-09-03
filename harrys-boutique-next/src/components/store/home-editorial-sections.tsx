import Link from 'next/link'
import Image from 'next/image'
import type { HomeContent, HomeProduct } from '@/lib/home-content'
import { EditorialArrow, SectionTitle } from './editorial'
import { ProductCard } from './product-card'

type Tone = 'peach' | 'stone' | 'ink' | 'sage' | 'sand' | 'denim'

function HomeProductCard({ product }: { product: HomeProduct }) {
  return (
    <ProductCard
      product={{
        id: product.id,
        slug: product.href.replace(/^\/product\//, ''),
        name: product.name,
        price: product.price,
        images: product.image ? [product.image] : [],
        isNew: product.isNew,
        mercadoLibreUrl: product.mercadoLibreUrl,
        mercadoLibreItemId: product.mercadoLibreItemId,
      }}
    />
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

export function HomeEditorialSections({ content }: { content: HomeContent }) {
  return (
    <div className="mx-auto w-full max-w-[1536px] space-y-20 px-4 py-14 sm:px-6 sm:py-20 lg:space-y-28 lg:px-8 lg:py-24">
      <section>
        <SectionTitle
          eyebrow="COLECCIONES"
          title="Explora nuestras colecciones"
          link="Ver todas las colecciones"
          href="/tienda"
        />
        <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {content.collections.map((collection) => (
            <Link
              key={collection.id}
              href={collection.href}
              className="group overflow-hidden rounded-[1.5rem] bg-[var(--color-surface)] shadow-[var(--shadow-editorial)]"
            >
              <div className="relative aspect-[1.08] overflow-hidden">
                <Placeholder
                  label={`Fotograf\u00EDa colecci\u00F3n ${collection.title}`}
                  tone="sage"
                  image={collection.image}
                  className="h-full transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex items-center justify-between px-5 py-5">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {collection.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {`Ver colecci\u00F3n`}
                  </p>
                </div>
                <EditorialArrow />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[2rem] bg-[var(--color-panel)] lg:grid-cols-2">
        <div className="relative min-h-[360px] overflow-hidden lg:min-h-[540px]">
          <Placeholder
            label={`Fotograf\u00EDa lifestyle de Harry's Boutique`}
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
          <p className="ui-eyebrow">NUESTRA HISTORIA</p>
          <h2 className="ui-display mt-5 max-w-md text-5xl leading-[0.96] sm:text-6xl">
            {`M\u00E1s que ropa, creamos momentos.`}
          </h2>
          <p className="mt-7 max-w-md text-base leading-7 text-[var(--color-text-secondary)]">
            {`Harry's Boutique nace para acompa\u00F1ar la personalidad y los peque\u00F1os rituales que hacen \u00FAnica la vida junto a una mascota.`}
          </p>
          <Link href="/about" className="ui-button ui-button-primary mt-8 w-fit rounded-full">
            {`Conoce m\u00E1s sobre nosotros`} <EditorialArrow />
          </Link>
        </div>
      </section>

      <section>
        <SectionTitle
          eyebrow={`SELECCI\u00D3N HARRY'S`}
          title="Productos destacados"
          link="Ver todos los productos"
          href="/tienda"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {content.products.map((product) => (
            <HomeProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {content.categoryBlocks.map((block) => (
        <section key={block.categoryId}>
          <SectionTitle
            eyebrow={`COLECCI\u00D3N`}
            title={block.title}
            link={`Ver colecci\u00F3n`}
            href={`/tienda?category=${encodeURIComponent(block.title)}`}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {block.products.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}

      <section className={content.instagramPosts.length === 0 ? 'hidden' : ''}>
        {content.instagramPosts.length > 0 && (
          <SectionTitle eyebrow="COMUNIDAD" title={`S\u00EDguenos en Instagram`} />
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {content.instagramPosts.map((post, index) => (
            <Placeholder
              key={post.id}
              label={`Fotograf\u00EDa Instagram ${index + 1}`}
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
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-gold-dark)]"
        >
          @harrysboutique.cl <EditorialArrow />
        </a>
      </section>

      <section
        className={`grid gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-center ${content.testimonial ? '' : 'hidden'}`}
      >
        <div>
          <p className="ui-eyebrow">COMUNIDAD HARRY&apos;S</p>
          <h2 className="ui-display mt-3 text-5xl leading-[0.95] sm:text-6xl">
            Lo que dicen nuestros clientes
          </h2>
        </div>
        {content.testimonial && (
          <div className="rounded-[1.5rem] bg-[var(--color-surface)] px-8 py-9 shadow-[var(--shadow-editorial)] sm:px-12">
            <p className="text-sm tracking-[0.25em] text-[var(--color-gold)]">
              {'\u2605'.repeat(Math.max(0, Math.min(5, content.testimonial.rating)))}
            </p>
            <blockquote className="ui-display mt-5 max-w-2xl text-2xl leading-relaxed">
              {'\u201C'}
              {content.testimonial.comment}
              {'\u201D'}
            </blockquote>
            <p className="mt-5 text-sm text-[var(--color-text-secondary)]">
              {content.testimonial.name}
              {content.testimonial.role ? ` \u00B7 ${content.testimonial.role}` : ''}
            </p>
          </div>
        )}
      </section>

      <section className="grid overflow-hidden rounded-[2rem] bg-[var(--color-panel)] lg:grid-cols-[0.62fr_0.78fr_1fr]">
        <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-10">
          <p className="ui-eyebrow">{`VIS\u00CDTANOS`}</p>
          <h2 className="ui-display mt-4 text-4xl leading-none">
            Encuentra a Harry&apos;s Boutique
          </h2>
          <p className="mt-5 text-sm leading-6 text-[var(--color-text-secondary)]">
            {`La ubicaci\u00F3n, horarios y referencias se publicar\u00E1n desde informaci\u00F3n verificada.`}
          </p>
          <Link href="/contact" className="ui-button ui-button-secondary mt-7 w-fit rounded-full">
            {`Consultar ubicaci\u00F3n`} <EditorialArrow />
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
