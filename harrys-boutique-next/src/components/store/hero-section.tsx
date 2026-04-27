'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface Slide {
  id: string
  title: string
  subtitle: string
  image: string
  product: { id: string; name: string }
}

export function HeroSection({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  const nextSlide = useCallback(() => {
    setDirection(1)
    setCurrent((c) => (c + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setCurrent((c) => (c - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [slides.length, isPaused, nextSlide])

  if (slides.length === 0) {
    return (
      <div className="relative h-[500px] sm:h-[600px] lg:h-[700px] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-accent-light)] to-[var(--color-surface)] rounded-2xl flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[var(--color-primary)] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center space-y-6 px-8 z-10"
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
              width={140}
              height={140}
              className="object-contain drop-shadow-lg"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-light"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Harry&apos;s Boutique
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-[var(--color-text-secondary)] text-lg sm:text-xl font-medium"
          >
            Moda para tu mejor amigo
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-[var(--color-text-muted)] max-w-md mx-auto text-sm sm:text-base"
          >
            Descubre nuestra colección de ropa y accesorios premium para mascotas.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Link
              href="/collection"
              className="inline-block bg-[var(--color-primary)] text-white px-10 py-4 rounded-xl hover:bg-[var(--color-primary-hover)] transition-all hover:scale-105 hover:shadow-xl text-sm font-medium"
            >
              Ver colección
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: shouldReduceMotion ? 0 : direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: shouldReduceMotion ? 0 : direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const textVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : i * 0.15,
        duration: shouldReduceMotion ? 0.3 : 0.6,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    }),
  }

  return (
    <div
      className="relative h-[500px] sm:h-[600px] lg:h-[700px] rounded-2xl overflow-hidden bg-gray-900 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        {/* Patrón de puntos */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }}
            className="relative w-full h-full max-w-4xl max-h-[80%] mx-auto"
          >
            <Image
              src={slides[current].image}
              alt={slides[current].title}
              fill
              className="object-contain drop-shadow-2xl"
              priority={current === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            />
          </motion.div>
          {/* Gradiente sutil para el texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full flex items-center px-6 sm:px-12 lg:px-16 z-10">
        <motion.div
          key={`text-${current}`}
          initial="hidden"
          animate="visible"
          className="text-white space-y-4 sm:space-y-6 max-w-xl lg:max-w-2xl"
        >
          <motion.div
            custom={0}
            variants={textVariants}
            className="inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
          >
            <p className="text-xs sm:text-sm uppercase tracking-widest font-medium">
              {slides[current].subtitle}
            </p>
          </motion.div>
          <motion.h1
            custom={1}
            variants={textVariants}
            className="text-3xl sm:text-5xl lg:text-6xl font-light leading-tight drop-shadow-2xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {slides[current].title}
          </motion.h1>
          <motion.div custom={2} variants={textVariants} className="flex flex-wrap gap-3 sm:gap-4">
            <Link
              href={`/product/${slides[current].product.id}`}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-2xl text-sm sm:text-base font-medium group/btn"
            >
              Comprar ahora
              <svg
                className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-white/20 transition-all border border-white/20 text-sm sm:text-base font-medium"
            >
              Ver más
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full p-3 sm:p-4 transition-all z-20 border border-white/20 opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Slide anterior"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full p-3 sm:p-4 transition-all z-20 border border-white/20 opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Slide siguiente"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1)
                  setCurrent(i)
                }}
                className="group/dot relative"
                aria-label={`Ir al slide ${i + 1}`}
              >
                <div
                  className={`h-1 sm:h-1.5 rounded-full transition-all ${
                    i === current
                      ? 'w-10 sm:w-12 bg-white'
                      : 'w-6 sm:w-8 bg-white/40 group-hover/dot:bg-white/60'
                  }`}
                />
                {i === current && !isPaused && (
                  <motion.div
                    className="absolute top-0 left-0 h-1 sm:h-1.5 bg-white/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 6, ease: 'linear' as const }}
                  />
                )}
              </button>
            ))}
          </div>

          {isPaused && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 z-20"
            >
              <p className="text-white text-xs font-medium flex items-center gap-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pausado
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
