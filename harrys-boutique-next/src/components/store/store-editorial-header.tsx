import Image from 'next/image'
import Link from 'next/link'

interface EditorialCategory {
  id: string
  name: string
  homeImage?: string | null
  homeDescription?: string | null
}

function Arrow() {
  return <span aria-hidden="true">→</span>
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function HeartIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M20.8 8.6c0 4.4-6.3 8.4-8.3 9.6a1 1 0 0 1-1 0C9.5 17 3.2 13 3.2 8.6A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.8 1.9Z" />
    </svg>
  )
}

function LeafIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 20c0-8 5-13 16-13 0 8-5 13-16 13Z" />
      <path d="M4 20c2-5 6-8 11-9.5" />
    </svg>
  )
}

function TruckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  )
}

function SparkIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 3.5 13.7 9 19 10.7 13.7 12.4 12 18l-1.7-5.6L5 10.7 10.3 9Z" />
    </svg>
  )
}

function SwapIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 8h13l-3-3" />
      <path d="M20 16H7l3 3" />
    </svg>
  )
}

function LockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="4.5" y="10" width="15" height="10" rx="2" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
    </svg>
  )
}

function ChatIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
    </svg>
  )
}

const assurances = [
  {
    icon: HeartIcon,
    title: 'Hecho a mano',
    text: 'Cada prenda es única, confeccionada con amor.',
  },
  {
    icon: LeafIcon,
    title: 'Materiales de calidad',
    text: 'Suaves, resistentes y seguros para tu mascota.',
  },
  {
    icon: TruckIcon,
    title: 'Envíos a todo Chile',
    text: 'Rápidos y seguros a todo el país.',
  },
]

export function StoreEditorialHeader() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-stitch-line)] bg-[var(--color-panel)]">
      <div className="relative mx-auto grid w-full max-w-[1536px] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-11 sm:py-12 lg:px-14 xl:px-16">
          <p className="ui-eyebrow">COLECCIÓN HARRY&apos;S</p>
          <h1 className="ui-display mt-4 max-w-xl text-[2.5rem] leading-[0.94] sm:text-5xl">
            Prendas con oficio, pensadas para acompañarlos.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
            Ropa y accesorios handmade para mascotas, creados con detalles que celebran su
            personalidad y los momentos que comparten contigo.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#catalogo" className="ui-button ui-button-craft rounded-full">
              <span>Ver colecciones</span>
            </Link>
            <Link href="/about" className="ui-button ui-button-ghost-gold rounded-full">
              <span>Hecho a mano en Chile</span>
            </Link>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3 lg:hidden">
            {assurances.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-[1.1rem] border border-[var(--color-stitch-line)] bg-[var(--color-surface)]/80 px-4 py-3"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold-dark)]" />
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">{title}</p>
                  <p className="mt-1 text-[11px] leading-4 text-[var(--color-text-secondary)]">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-h-[260px] overflow-hidden lg:min-h-[400px]">
          <Image
            src="/bannerharryluna.JPG"
            alt="Mascotas con prendas handmade de Harry's Boutique"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-panel)] via-[var(--color-panel)]/20 to-transparent lg:to-[var(--color-panel)]/45" />

          <ul className="absolute inset-y-6 right-6 z-10 hidden w-60 flex-col justify-center gap-3 lg:flex">
            {assurances.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-[1.1rem] border border-[var(--color-stitch-line)] bg-[var(--color-surface)]/95 px-4 py-3 shadow-[var(--shadow-sm)] backdrop-blur"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold-dark)]" />
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">{title}</p>
                  <p className="mt-1 text-[11px] leading-4 text-[var(--color-text-secondary)]">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function StoreCategoryRow({ categories }: { categories: EditorialCategory[] }) {
  const featured = [
    ...categories.filter((category) => category.homeImage),
    ...categories.filter((category) => !category.homeImage),
  ].slice(0, 3)

  if (featured.length === 0) return null

  return (
    <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((category) => (
        <Link
          key={category.id}
          href={`/tienda?category=${encodeURIComponent(category.name)}`}
          className="group grid grid-cols-[7.5rem_1fr] items-stretch overflow-hidden rounded-[1.35rem] border border-[var(--color-stitch-line)] bg-[var(--color-surface)]/80 shadow-[var(--shadow-editorial)] transition-colors hover:border-[var(--color-gold-soft)] sm:grid-cols-[8.5rem_1fr]"
        >
          <div className="relative min-h-[6.5rem] bg-[var(--color-surface-2)]">
            {category.homeImage ? (
              <Image
                src={category.homeImage}
                alt={`Colección ${category.name} de Harry's Boutique`}
                fill
                sizes="(max-width: 640px) 40vw, 160px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fdf9f3_0_3px,transparent_4px),linear-gradient(145deg,#e8d9ca,#cbb8a5)] bg-[length:22px_22px,auto]" />
            )}
          </div>
          <div className="flex flex-col justify-center px-5 py-4">
            <p className="ui-display text-xl leading-tight">{category.name}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-text-secondary)]">
              {category.homeDescription ??
                `Diseños ${category.name.toLowerCase()} para cada paseo.`}
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-[var(--color-gold-dark)] uppercase">
              Explorar <Arrow />
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

const trustItems = [
  { icon: HeartIcon, title: 'Hecho a mano en Chile', text: 'Apoyamos el talento local' },
  { icon: SparkIcon, title: 'Diseños exclusivos', text: 'Colecciones únicas' },
  { icon: SwapIcon, title: 'Cambios fáciles', text: 'Sin complicaciones' },
  { icon: LockIcon, title: 'Pago seguro', text: 'Tus datos protegidos' },
  { icon: ChatIcon, title: 'Atención personalizada', text: 'Estamos para ayudarte' },
]

export function StoreTrustStrip() {
  return (
    <ul className="mb-8 grid gap-x-6 gap-y-4 rounded-[1.35rem] border border-[var(--color-stitch-line)] bg-[var(--color-surface)]/70 px-6 py-4 sm:grid-cols-2 lg:grid-cols-5">
      {trustItems.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-center gap-3">
          <Icon className="h-4 w-4 shrink-0 text-[var(--color-gold-dark)]" />
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-[var(--color-text-primary)]">
              {title}
            </p>
            <p className="truncate text-[10px] text-[var(--color-text-muted)]">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
