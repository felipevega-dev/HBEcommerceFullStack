'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface Slide {
  id: string
  title: string
  subtitle: string
  image: string
  product: { id: string; name: string }
}

export function HeroEpic({
  slides,
}: {
  slides: Slide[]
  stats?: { customers: number; products: number; rating: number }
}) {
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) {
    return <DefaultHero />
  }

  return (
    <section className="relative mt-3 min-h-[520px] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black sm:mt-4 sm:min-h-[600px] lg:min-h-[min(72vh,680px)]">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06 }}
        animate={{ scale: mounted ? 1 : 1.06 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <Image
          src={slides[current].image}
          alt={slides[current].title}
          fill
          className="object-cover opacity-45"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
      </motion.div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-8 h-72 w-72 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
        <div className="absolute -bottom-28 right-10 h-80 w-80 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-[520px] items-center sm:min-h-[600px] lg:min-h-[min(72vh,680px)]">
        <div className="w-full px-6 py-12 sm:px-8 sm:py-14 md:px-12 lg:px-16 lg:py-16 xl:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1fr] xl:gap-14">
              <motion.div
                initial={{ opacity: 0, x: -36 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="space-y-5 text-white sm:space-y-6"
              >
                <div>
                  <h1
                    className="mb-4 max-w-3xl text-4xl font-semibold leading-[0.98] sm:text-5xl lg:text-6xl xl:text-7xl"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {slides[current].title}
                  </h1>
                  <p className="max-w-2xl text-lg font-light text-white/85 sm:text-xl lg:text-2xl">
                    {slides[current].subtitle}
                  </p>
                </div>

                <p className="max-w-xl text-base leading-relaxed text-white/72 sm:text-lg">
                  Diseños únicos con{' '}
                  <span className="font-semibold text-white">
                    identidad regional
                  </span>
                  , telas de{' '}
                  <span className="font-semibold text-white">
                    calidad premium
                  </span>{' '}
                  y amor por los peludos de la familia.
                </p>

                <div className="flex flex-wrap gap-3 pt-1 sm:gap-4">
                  <Link
                    href={`/product/${slides[current].product.id}`}
                    className="group relative overflow-hidden rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-all hover:shadow-xl sm:text-base"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Comprar ahora
                      <svg
                        className="h-5 w-5 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>

                  <Link
                    href="/collection"
                    className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:border-white/35 hover:bg-white/20 sm:text-base"
                  >
                    Ver colección
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="relative hidden lg:block"
              >
                <div className="relative mx-auto h-[430px] max-w-[460px]">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, rotate: -2 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative h-full w-full overflow-hidden rounded-2xl bg-black/10 shadow-2xl shadow-black/30"
                  >
                    <Image
                      src={slides[current].image}
                      alt={slides[current].product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 0vw, 40vw"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-xl bg-white px-5 py-3 shadow-xl"
                  >
                    <div className="text-center">
                      <div className="mb-1 text-sm text-gray-600">Producto destacado</div>
                      <div className="font-bold text-gray-900">{slides[current].product.name}</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="group relative"
              aria-label={`Ir al slide ${i + 1}`}
            >
              <div
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-10 bg-white' : 'w-7 bg-white/40 group-hover:bg-white/60'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function DefaultHero() {
  return (
    <section className="relative mt-3 flex min-h-[500px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-accent-light)] to-[var(--color-primary-light)] sm:mt-4 sm:min-h-[560px] lg:min-h-[min(68vh,640px)]">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-10 top-10 h-64 w-64 rounded-full bg-[var(--color-primary)] blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[var(--color-accent)] blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-3xl space-y-6 px-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex justify-center"
        >
          <Image
            src="/harrys_logo.png"
            alt="Harry's Boutique"
            width={128}
            height={128}
            className="object-contain drop-shadow-xl"
          />
        </motion.div>
        <h1
          className="text-4xl font-semibold sm:text-5xl lg:text-6xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Harry&apos;s Boutique
        </h1>
        <p className="mx-auto max-w-2xl text-lg font-medium text-[var(--color-text-secondary)] sm:text-xl">
          Moda premium para tu mejor amigo. Diseños únicos con identidad regional.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/collection"
            className="rounded-lg bg-[var(--color-primary)] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-xl"
          >
            Ver colección
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
