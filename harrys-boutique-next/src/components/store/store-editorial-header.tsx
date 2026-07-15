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

export function StoreEditorialHeader({ categories }: { categories: EditorialCategory[] }) {
  const featuredCategories = [
    ...categories.filter((category) => category.homeImage),
    ...categories.filter((category) => !category.homeImage),
  ].slice(0, 3)

  return (
    <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-[#ead9ca] bg-[#f8eee7] shadow-[0_18px_45px_rgba(70,48,35,0.07)]">
      <div className="pointer-events-none absolute inset-3 rounded-[1.45rem] border border-dashed border-[#d8ba83]/70" />
      <div className="relative grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center px-7 py-10 sm:px-11 sm:py-12 lg:px-14">
          <p className="text-[10px] font-bold tracking-[0.24em] text-[#a96808]">
            COLECCIÓN HARRY&apos;S
          </p>
          <h1
            className="mt-4 max-w-xl text-[2.7rem] leading-[0.94] text-[#1b1b1b] sm:text-6xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Prendas con oficio, pensadas para acompañarlos.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-[#635a54] sm:text-base sm:leading-7">
            Explora ropa y accesorios handmade para mascotas, creados con detalles que celebran su
            personalidad y los momentos que comparten contigo.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 text-[11px] font-semibold text-[#5f5045]">
            <span className="rounded-full border border-[#dcc7b1] bg-white/70 px-3 py-2">
              Hecho a mano en Chile
            </span>
            <span className="rounded-full border border-[#dcc7b1] bg-white/70 px-3 py-2">
              Diseños en series pequeñas
            </span>
            <span className="rounded-full border border-[#dcc7b1] bg-white/70 px-3 py-2">
              Compra segura en Mercado Libre
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-5 pb-6 sm:gap-3 sm:px-8 lg:min-h-[360px] lg:px-5 lg:py-5 lg:pl-0">
          {featuredCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/tienda?category=${encodeURIComponent(category.name)}`}
              className={`group relative min-h-44 overflow-hidden rounded-[1.25rem] bg-[#dfd4c8] ${
                index === 1 ? 'lg:translate-y-5 lg:-mb-5' : ''
              }`}
            >
              {category.homeImage ? (
                <Image
                  src={category.homeImage}
                  alt={`Colección ${category.name} de Harry's Boutique`}
                  fill
                  sizes="(max-width: 1024px) 33vw, 18vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fdf9f3_0_3px,transparent_4px),linear-gradient(145deg,#e8d9ca,#cbb8a5)] bg-[length:22px_22px,auto]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2f2823]/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                <p className="text-sm font-semibold sm:text-base">{category.name}</p>
                <p className="mt-1 hidden items-center gap-2 text-[11px] text-white/80 sm:flex">
                  Ver colección <Arrow />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
