'use client'

import { motion, useScroll, useTransform, useInView, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'

interface Stat {
  value: string
  label: string
  icon: string
}

interface Value {
  title: string
  description: string
  icon: string
}

interface Props {
  stats: Stat[]
  values: Value[]
}

// Generar huellas de patas aleatorias
const generatePawPrints = () =>
  Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 12 + Math.random() * 20,
    delay: Math.random() * 5,
    opacity: 0.05 + Math.random() * 0.15,
    rotation: Math.random() * 360,
  }))

export function AboutPageClient({ stats, values }: Props) {
  const [pawPrints] = useState(generatePawPrints)
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const heroRef = useRef(null)
  const storyRef = useRef(null)
  const missionRef = useRef(null)
  const valuesRef = useRef(null)
  const statsRef = useRef(null)
  const harryRef = useRef(null)

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 })
  const storyInView = useInView(storyRef, { once: true, amount: 0.3 })
  const missionInView = useInView(missionRef, { once: true, amount: 0.3 })
  const valuesInView = useInView(valuesRef, { once: true, amount: 0.2 })
  const statsInView = useInView(statsRef, { once: true, amount: 0.5 })
  const harryInView = useInView(harryRef, { once: true, amount: 0.3 })

  // Parallax effects - disable on reduced motion
  const heroY = useTransform(scrollYProgress, [0, 0.2], shouldReduceMotion ? [0, 0] : [0, 100])
  const pawOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  return (
    <main ref={containerRef} className="overflow-hidden">
      {/* Hero Section con huellas animadas */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY }}
        className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden"
      >
        {/* Fondo gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50">
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(251, 191, 36, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Huellas de patas flotantes */}
        <motion.div style={{ opacity: pawOpacity }} className="absolute inset-0 pointer-events-none">
          {pawPrints.map((paw) => (
            <motion.div
              key={paw.id}
              className="absolute"
              style={{
                left: `${paw.left}%`,
                top: `${paw.top}%`,
                fontSize: `${paw.size}px`,
                opacity: paw.opacity,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [paw.rotation, paw.rotation + 10, paw.rotation],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: paw.delay,
                ease: 'easeInOut',
              }}
            >
              🐾
            </motion.div>
          ))}
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

        {/* Contenido del hero */}
        <div className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium shadow-sm">
              🐾 Historia de una familia perruna
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-7xl font-medium mb-6 text-gray-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Nuestra Historia
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Una historia de <span className="text-orange-600 font-medium">amor</span>,{' '}
            <span className="text-amber-600 font-medium">mascotas</span> y{' '}
            <span className="text-amber-700 font-medium">moda</span> que nació en familia
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center gap-4 mt-8 text-3xl sm:text-4xl"
          >
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              🐕
            </motion.span>
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            >
              🐾
            </motion.span>
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            >
              🐶
            </motion.span>
          </motion.div>
        </div>
      </motion.section>

      {/* Historia Section */}
      <section ref={storyRef} className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Imagen de Harry con animación */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 shadow-2xl"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-center"
                  >
                    <div className="text-7xl sm:text-9xl mb-4">🐕</div>
                    <p className="text-xl sm:text-2xl font-medium text-amber-800">Harry</p>
                    <p className="text-sm sm:text-base text-amber-600">nuestro golden retriever</p>
                  </motion.div>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-4 right-4 bg-white rounded-full px-3 sm:px-4 py-2 shadow-lg"
                >
                  <span className="text-xl sm:text-2xl">✨</span>
                </motion.div>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-4 -right-4 bg-amber-400 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-3xl sm:text-4xl shadow-xl"
              >
                🐾
              </motion.div>
            </motion.div>

            {/* Texto de la historia */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2
                className="text-3xl sm:text-4xl font-medium mb-6 text-gray-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Cómo empezó todo
              </h2>
              <div className="space-y-4 text-base sm:text-lg leading-relaxed text-gray-600">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={storyInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 }}
                >
                  <span className="font-medium text-gray-900">Harry's Boutique</span> nació en 2020,
                  durante esos días difíciles que nos mantuvieron juntos en casa. Lo que comenzó como un
                  pequeño emprendimiento familiar se convirtió en la tienda de referencia para dueños que
                  quieren lo mejor para sus compañeros de vida.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={storyInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 }}
                >
                  Todo cambió cuando nuestro <span className="font-medium text-amber-600">Harry</span>,
                  un golden retriever lleno de energía y estilo, necesitaba ropa para el invierno. No
                  encontramos nada que nos convenciera. Así que{' '}
                  <span className="font-medium text-orange-600">
                    decidimos crear nuestros propios diseños
                  </span>
                  .
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={storyInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 }}
                >
                  Hoy, cada producto que fabricamos lleva la misma filosofía: comfort, estilo y mucho amor
                  por los peludos de la familia.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={storyInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-l-4 border-amber-400"
              >
                <p className="text-base sm:text-lg italic text-gray-700">
                  "No vendemos ropa para mascotas. Vendemos momentos felices junto a quien más nos quiere."
                </p>
                <p className="mt-2 text-sm sm:text-base text-amber-600 font-medium">
                  — Equipo Harry's Boutique
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Misión & Visión */}
      <section ref={missionRef} className="py-16 sm:py-24 px-4 bg-gradient-to-br from-gray-50 to-amber-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={missionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
              Nuestra Esencia
            </span>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-medium text-gray-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Misión & Visión
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                icon: '💛',
                title: 'Misión',
                text: 'Ofrecer productos de calidad premium que mejoren la vida de las mascotas y fortalezcan el vínculo especial entre perros, gatos y sus familias humanas.',
              },
              {
                icon: '🌟',
                title: 'Visión',
                text: 'Ser la marca de referencia en moda y accesorios para mascotas en Latinoamérica, reconocida por calidad innovadora y amor genuino por los animales.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={missionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl sm:text-3xl mb-6"
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-medium mb-4 text-gray-900">{item.title}</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section ref={valuesRef} className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
              Lo que nos define
            </span>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-medium text-gray-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Nuestros Valores
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((valor, i) => (
              <motion.div
                key={valor.title}
                initial={{ opacity: 0, y: 30 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50 hover:from-amber-50 hover:to-orange-50 border border-amber-100 hover:border-amber-300 transition-all cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl sm:text-4xl mb-4"
                >
                  {valor.icon}
                </motion.div>
                <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-900">{valor.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{valor.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats con contador animado */}
      <section ref={statsRef} className="py-16 sm:py-24 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-4 sm:p-6"
              >
                <motion.div
                  animate={statsInView ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 + 0.5 }}
                  className="text-3xl sm:text-4xl mb-2"
                >
                  {stat.icon}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={statsInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-medium mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm sm:text-base text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Harry Section */}
      <section ref={harryRef} className="py-16 sm:py-24 px-4 bg-gradient-to-b from-amber-50 to-orange-100">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={harryInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-orange-200 text-orange-800 text-sm font-medium mb-6">
              La Estrella
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-medium mb-8 text-gray-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Conoce a Harry 🐕
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={harryInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl"
          >
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl sm:text-8xl flex justify-center"
              >
                🦮
              </motion.div>
              <div className="text-left">
                <p className="text-lg sm:text-xl leading-relaxed text-gray-700 mb-6">
                  Harry es el <span className="font-medium text-amber-600">golden retriever</span> que
                  inspiró todo. Su personalidad desbordante, su amor por la moda y su carisma inigualable
                  fueron la chispa que encendió este proyecto.
                </p>
                <p className="text-base sm:text-lg text-gray-600">
                  Hoy, cada producto que ofrecemos lleva un poco de su espíritu:{' '}
                  <span className="font-medium text-orange-600">alegría, calidad y mucho amor</span>.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {['❤️ Amor infinito', '🎾 Fetch champion', '😴 Rey de las siestas'].map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={harryInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                      className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs sm:text-sm cursor-default"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-24 px-4 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-6xl mb-6"
          >
            🐾
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-medium mb-4 text-gray-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ¿Listo para consentir a tu mascota?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl text-gray-600 mb-8"
          >
            Descubre nuestra colección completa de ropa y accesorios diseñados con amor
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              href="/collection"
              className="inline-block px-8 sm:px-10 py-3 sm:py-4 rounded-full text-white font-medium bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
            >
              Ver Colección 🐕
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
