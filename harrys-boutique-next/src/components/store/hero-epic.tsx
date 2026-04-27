'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

interface Slide {
  id: string
  title: string
  subtitle: string
  image: string
  product: { id: string; name: string }
}

interface Stats {
  customers: number
  products: number
  rating: number
}

export function HeroEpic({ slides, stats }: { slides: Slide[]; stats?: Stats }) {
  const [current, setCurrent] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  const defaultStats = stats || {
    customers: 5000,
    products: 500,
    rating: 4.9,
  }

  if (slides.length === 0) {
    return <DefaultHero stats={defaultStats} />
  }

  return (
    <div className="relative min-h-[85vh] lg:min-h-[90vh] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: mounted ? 1 : 1.1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <Image
          src={slides[current].image}
          alt={slides[current].title}
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </motion.div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-primary)]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--color-accent)]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full min-h-[85vh] lg:min-h-[90vh] flex items-center">
        <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-white space-y-8"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-medium">
                    {defaultStats.customers.toLocaleString('es-CL')}+ clientes felices
                  </span>
                </motion.div>

                {/* Main heading */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h1
                    className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-4"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {slides[current].title}
                  </h1>
                  <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 font-light">
                    {slides[current].subtitle}
                  </p>
                </motion.div>

                {/* Value proposition */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed"
                >
                  Diseños únicos con <span className="text-[var(--color-accent)] font-semibold">identidad regional</span>,
                  telas de <span className="text-[var(--color-primary)] font-semibold">calidad premium</span> y
                  amor por los peludos de la familia 🐾
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link
                    href={`/product/${slides[current].product.id}`}
                    className="group relative px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Comprar ahora
                      <svg
                        className="w-5 h-5 transition-transform group-hover:translate-x-1"
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
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  <Link
                    href="/collection"
                    className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all"
                  >
                    Ver colección
                  </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex flex-wrap gap-8 pt-4"
                >
                  <div>
                    <div className="text-3xl font-bold text-[var(--color-accent)]">
                      {defaultStats.products}+
                    </div>
                    <div className="text-sm text-white/70">Productos únicos</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[var(--color-accent)] flex items-center gap-1">
                      {defaultStats.rating}
                      <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="text-sm text-white/70">Valoración promedio</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[var(--color-accent)]">24h</div>
                    <div className="text-sm text-white/70">Envío express</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right content - Product showcase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="hidden lg:block relative"
              >
                <div className="relative aspect-square max-w-lg mx-auto">
                  {/* Decorative elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-24 h-24 bg-[var(--color-accent)] rounded-full opacity-20 blur-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -bottom-4 -left-4 w-32 h-32 bg-[var(--color-primary)] rounded-full opacity-20 blur-2xl"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  {/* Main product image */}
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, rotate: -5 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl"
                  >
                    <Image
                      src={slides[current].image}
                      alt={slides[current].product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 0vw, 50vw"
                    />
                  </motion.div>

                  {/* Floating badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-6 py-4 shadow-2xl"
                  >
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Producto destacado</div>
                      <div className="font-bold text-gray-900">{slides[current].product.name}</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="group relative"
              aria-label={`Ir al slide ${i + 1}`}
            >
              <div
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-12 bg-white' : 'w-8 bg-white/40 group-hover:bg-white/60'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DefaultHero({ stats }: { stats: Stats }) {
  return (
    <div className="relative min-h-[85vh] rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-accent-light)] to-[var(--color-primary-light)] flex items-center justify-center">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[var(--color-primary)] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative text-center space-y-8 px-8 z-10 max-w-4xl"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center"
        >
          <Image
            src="/harrys_logo.png"
            alt="Harry's Boutique"
            width={160}
            height={160}
            className="object-contain drop-shadow-2xl"
          />
        </motion.div>
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Harry&apos;s Boutique
        </h1>
        <p className="text-xl sm:text-2xl text-[var(--color-text-secondary)] font-medium max-w-2xl mx-auto">
          Moda premium para tu mejor amigo. Diseños únicos con identidad regional.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/collection"
            className="px-8 py-4 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-all hover:scale-105 hover:shadow-xl text-lg font-bold"
          >
            Ver colección 🐕
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
