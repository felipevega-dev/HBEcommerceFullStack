'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

interface Slide {
  id: string
  title: string
  subtitle: string
  image: string
  product: { id: string; name: string }
}

export function HeroSection({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div className="h-[500px] sm:h-[600px] bg-[var(--color-surface)] rounded-2xl flex items-center justify-center">
        <div className="text-center space-y-6 px-8">
          <div className="flex justify-center">
            <Image
              src="/harrys_logo.png"
              alt="Harry's Boutique"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-light" style={{ fontFamily: 'var(--font-display)' }}>
            Harry&apos;s Boutique
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg font-medium">
            Moda para tu mejor amigo
          </p>
          <p className="text-[var(--color-text-muted)] max-w-sm mx-auto text-sm">
            Descubre nuestra colección de ropa y accesorios premium para mascotas.
          </p>
          <Link
            href="/collection"
            className="inline-block bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors text-sm font-medium"
          >
            Ver colección
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[500px] sm:h-[600px] rounded-2xl overflow-hidden bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full flex items-center px-8 sm:px-16 z-10">
        <div className="text-white space-y-4 max-w-lg">
          <p className="text-sm uppercase tracking-widest opacity-80">{slides[current].subtitle}</p>
          <h1
            className="text-4xl sm:text-5xl font-light leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {slides[current].title}
          </h1>
          <Link
            href={`/product/${slides[current].product.id}`}
            className="inline-block bg-white text-[var(--color-primary)] px-8 py-3 rounded-lg hover:bg-[var(--color-accent-light)] transition-colors text-sm font-medium"
          >
            Comprar ahora
          </Link>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-3 transition-all z-10"
            aria-label="Slide anterior"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            onClick={() => setCurrent((c) => (c + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-3 transition-all z-10"
            aria-label="Slide siguiente"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-0.5 transition-all ${i === current ? 'w-8 bg-white' : 'w-4 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
