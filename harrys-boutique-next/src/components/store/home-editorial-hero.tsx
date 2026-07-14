import Image from 'next/image'
import Link from 'next/link'

function PawIcon({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 72 72" fill="none">
      <ellipse cx="36" cy="47" rx="17" ry="14" fill="currentColor" />
      <ellipse cx="16" cy="29" rx="7" ry="9" transform="rotate(-25 16 29)" fill="currentColor" />
      <ellipse cx="29" cy="19" rx="7" ry="9" transform="rotate(-8 29 19)" fill="currentColor" />
      <ellipse cx="43" cy="19" rx="7" ry="9" transform="rotate(8 43 19)" fill="currentColor" />
      <ellipse cx="56" cy="29" rx="7" ry="9" transform="rotate(25 56 29)" fill="currentColor" />
    </svg>
  )
}

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

type AssuranceIconType = 'hand' | 'tape' | 'flower' | 'bag'

function AssuranceIcon({ type }: { type: AssuranceIconType }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.55,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (type === 'hand') {
    return (
      <svg aria-hidden="true" className="h-12 w-12 shrink-0" viewBox="0 0 48 48" {...common}>
        <path d="M5 33.5c4.7 0 7.2-3.4 10.1-3.4 3.8 0 5.6 4.9 9.7 4.9 3.9 0 5.5-3.3 8.7-3.3 3.8 0 5.6 3.3 9.5 3.3" />
        <path d="M8.5 38.5c4.1 0 6.6-2.8 10.4-2.8 4.1 0 6.3 3.9 10.3 3.9 4.2 0 6.4-2.9 10.3-2.9" />
        <path d="M17.8 26.2c-2.5-3-2-7.9 1.5-10.1 2.3-1.5 4.1.3 4.7 1.8.7-1.5 2.5-3.3 4.8-1.8 3.5 2.2 4 7.1 1.5 10.1L24 32.6l-6.2-6.4z" />
      </svg>
    )
  }

  if (type === 'tape') {
    return (
      <svg aria-hidden="true" className="h-12 w-12 shrink-0" viewBox="0 0 48 48" {...common}>
        <path d="M9 14.5c0-3.6 2.9-6.5 6.5-6.5h17c3.6 0 6.5 2.9 6.5 6.5v17c0 3.6-2.9 6.5-6.5 6.5h-17C11.9 38 9 35.1 9 31.5v-17z" />
        <circle cx="24" cy="23" r="7" />
        <path d="M16 8v5M22 8v3M28 8v5M34 8v3M39 19h-5M39 25h-3M39 31h-5" />
      </svg>
    )
  }

  if (type === 'flower') {
    return (
      <svg aria-hidden="true" className="h-12 w-12 shrink-0" viewBox="0 0 48 48" {...common}>
        <path d="M24 26v14M24 34c-3.7-4.8-7.3-5.9-10-5.5M24 37c3.7-4.8 7.3-5.9 10-5.5" />
        <circle cx="24" cy="18" r="3.2" />
        <path d="M24 14.8c-3.1-6.4-9.8-6.4-10.8-2.4-.7 3.2 2.2 6.2 7.6 5.6-5.4.6-7.3 4.9-4.6 7.1 3.3 2.7 7.8-.3 7.8-6.3 0 6 4.5 9 7.8 6.3 2.7-2.2.8-6.5-4.6-7.1 5.4.6 8.3-2.4 7.6-5.6-1-4-7.7-4-10.8 2.4z" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="h-12 w-12 shrink-0" viewBox="0 0 48 48" {...common}>
      <path d="M12 18h24v22H12zM16.5 18v-4.5a7.5 7.5 0 0115 0V18" />
      <path d="M20 28.5h8M20 33.5h5" />
      <path d="M32.5 27.4c0 3.5-4.5 6-4.5 6s-4.5-2.5-4.5-6a2.6 2.6 0 014.5-1.8 2.6 2.6 0 014.5 1.8z" />
    </svg>
  )
}

const assurances: Array<{ icon: AssuranceIconType; title: string; description: string }> = [
  {
    icon: 'hand',
    title: 'Hecho a mano',
    description: 'Cada prenda se prepara con atención a cada detalle.',
  },
  {
    icon: 'tape',
    title: 'Tallas cuidadas',
    description: 'Revisa las medidas antes de elegir su próxima prenda.',
  },
  {
    icon: 'flower',
    title: 'Detalles únicos',
    description: 'Diseños pensados para acompañar su personalidad.',
  },
  {
    icon: 'bag',
    title: 'Compra informada',
    description: 'Pago y envío se detallan antes de completar la compra.',
  },
]

export function HomeEditorialHero() {
  return (
    <section className="w-full bg-[#fbf7ef]">
      <div className="relative isolate h-[min(85vh,920px)] min-h-[680px] overflow-hidden bg-[#fbf7ef] max-lg:h-auto max-lg:min-h-[700px]">
        <Image
          src="/hero.png"
          alt="Perro usando una prenda de Harry's Boutique"
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-center lg:block"
        />
        <Image
          src="/bannermobile.png"
          alt="Perro usando una prenda de Harry's Boutique"
          fill
          priority
          sizes="100vw"
          className="block object-cover object-top lg:hidden"
        />
        <div className="relative flex h-full flex-col justify-start px-6 pb-12 pt-16 sm:px-12 lg:max-w-[64%] lg:justify-center lg:px-12 lg:pb-10 lg:pt-28 xl:px-16">
          <h1
            className="mt-6 max-w-3xl text-5xl leading-[0.98] text-[#10192a] sm:text-6xl lg:text-[3.5rem] xl:text-[4.5rem]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="lg:hidden">
              Prendas hechas
              <br />
              a mano para
              <br />
              <span className="italic text-[#c98612]">tu mejor amigo</span>
            </span>
            <span className="hidden lg:inline">
              Prendas hechas a mano
              <br />
              para <span className="italic text-[#c98612]">tu mejor amigo</span>
            </span>
          </h1>

          <div className="mt-6 flex max-w-[36rem] items-center gap-3 text-[#c28a27]">
            <span className="h-px flex-1 bg-[repeating-linear-gradient(to_right,currentColor_0_8px,transparent_8px_16px)]" />
            <PawIcon className="h-7 w-7 shrink-0" />
          </div>

          <p className="mt-4 max-w-xl text-base leading-7 text-[#45403d] sm:text-lg sm:leading-8 lg:mt-6">
            Diseños cómodos, tallas cuidadas y detalles únicos para cada mascota.
          </p>

          <div className="mt-6 flex flex-col items-start gap-3 sm:gap-4 lg:mt-8 lg:flex-row lg:flex-wrap">
            <Link
              href="/collection"
              className="rounded-[0.7rem] border border-[#76410e] bg-[linear-gradient(135deg,#d49824_0%,#a96512_100%)] p-1 text-[#fffdf8] shadow-[inset_0_0_0_2px_rgba(91,50,12,0.35),0_12px_24px_rgba(111,64,16,0.24)] transition-transform hover:-translate-y-0.5 hover:brightness-95 max-lg:w-[180px]"
            >
              <span
                className="inline-flex items-center gap-2 rounded-md border border-dashed border-[#ffe0a2] px-6 py-2.5 text-base sm:px-8 sm:text-lg"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ver prendas
                <PawIcon className="h-5 w-5" />
              </span>
            </Link>
            <Link
              href="/collection?sort=newest"
              className="rounded-[0.7rem] border border-[#d7b26c] bg-[#fffdf8]/90 p-1 text-[#3a2d26] shadow-[inset_0_0_0_2px_rgba(255,253,248,0.9),0_8px_20px_rgba(77,55,39,0.08)] backdrop-blur-sm transition-colors hover:bg-white max-lg:w-[200px]"
            >
              <span
                className="inline-flex items-center gap-2 rounded-md border border-dashed border-[#d7b26c] px-6 py-2.5 text-base sm:px-8 sm:text-lg"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Conoce el taller
                <Arrow />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 border-y border-[#eadfce] bg-[#fffdf8] lg:grid-cols-4">
        {assurances.map((assurance, index) => (
          <div
            key={assurance.title}
            className={`flex items-center gap-3 px-4 py-6 sm:gap-5 sm:px-10 sm:py-8 lg:px-12 xl:px-16 ${index > 0 ? 'lg:border-l lg:border-dashed lg:border-[#d8ba83]' : ''} ${index % 2 === 1 ? 'max-lg:border-l max-lg:border-dashed max-lg:border-[#d8ba83]' : ''} ${index > 1 ? 'max-lg:border-t max-lg:border-[#e5d8ce]' : ''}`}
          >
            <span className="mt-0.5 text-[#b77b17]">
              <AssuranceIcon type={assurance.icon} />
            </span>
            <div>
              <p
                className="text-xl leading-6 text-[#25201d]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {assurance.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#69605a]">{assurance.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
