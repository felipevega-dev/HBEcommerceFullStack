'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BrandIcon } from '@/components/ui/brand-icon'
import { PetLoyaltyPanel } from '@/components/store/pet-loyalty-panel'
import {
  CLUB_TIERS,
  COMMUNITY_CHALLENGES,
  CO_CREATED_DROPS,
  CO_CREATED_DROP_VOTE_STORAGE_KEY,
  EXPERIENCE_CARDS,
  OCCASION_SHOPS,
  STYLE_QUIZ_RESULT_STORAGE_KEY,
  STYLE_QUIZ_QUESTIONS,
  getStyleProfile,
} from '@/lib/pet-experience'

export function PetExperiencePageClient() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null)
  const selectedOptionIds = useMemo(() => Object.values(answers), [answers])
  const styleProfile = useMemo(() => getStyleProfile(selectedOptionIds), [selectedOptionIds])
  const quizProgress = Math.round((selectedOptionIds.length / STYLE_QUIZ_QUESTIONS.length) * 100)
  const quizCompleted = selectedOptionIds.length === STYLE_QUIZ_QUESTIONS.length

  useEffect(() => {
    if (!quizCompleted) return
    localStorage.setItem(
      STYLE_QUIZ_RESULT_STORAGE_KEY,
      JSON.stringify({ profileId: styleProfile.id, completedAt: new Date().toISOString() }),
    )
  }, [quizCompleted, styleProfile.id])

  useEffect(() => {
    setSelectedDropId(localStorage.getItem(CO_CREATED_DROP_VOTE_STORAGE_KEY))
  }, [])

  function handleDropVote(dropId: string) {
    setSelectedDropId(dropId)
    localStorage.setItem(CO_CREATED_DROP_VOTE_STORAGE_KEY, dropId)
  }

  return (
    <div className="border-t pb-6 pt-8">
      <section className="overflow-hidden rounded-2xl bg-[#181513] text-white">
        <div className="grid min-h-[560px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between gap-10 p-7 sm:p-10 lg:p-14">
            <div className="max-w-3xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                <BrandIcon name="paw" className="h-4 w-4" />
                Harry's World
              </span>
              <div className="space-y-4">
                <h1
                  className="text-4xl font-semibold leading-[1.02] sm:text-5xl lg:text-6xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Compra por personalidad, ocasion y momentos que merecen foto.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/76 sm:text-lg">
                  Elige looks por estilo, prepara cumpleanos, entra a drops limitados y convierte a
                  tu mascota en parte de la comunidad #HarrysFitCheck.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#quiz"
                  className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#181513] transition hover:bg-[var(--color-gold-light)]"
                >
                  Hacer quiz de estilo
                </a>
                <a
                  href="#drops"
                  className="rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ver drops y cajas
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {['Drops limitados', 'Birthday boxes', 'Fit checks'].map((label, index) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.08] p-4">
                  <p className="text-2xl font-semibold">
                    {index === 0 ? '24h' : index === 1 ? '3x' : '#1'}
                  </p>
                  <p className="mt-1 text-sm text-white/68">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[360px] bg-[var(--color-surface)]">
            <Image
              src="/harrys_logo.png"
              alt="Harry's Boutique"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-contain p-14 sm:p-20"
              priority
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/70 bg-white/90 p-4 text-[var(--color-text-primary)] shadow-[var(--shadow-lg)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-dark)]">
                Proxima campana
              </p>
              <p className="mt-1 text-lg font-semibold">#HarrysFitCheck: matching domingo</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Subir foto, etiquetar la tienda y participar por bordado gratis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="py-8">
        <PetLoyaltyPanel
          completedMissionIds={quizCompleted ? ['style-quiz'] : []}
          variant="experience"
        />
      </div>

      <section id="quiz" className="scroll-mt-28 py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
              Style Quiz
            </p>
            <h2
              className="mt-2 text-3xl font-semibold sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Que estilo tiene tu mascota?
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
              Un quiz corto para recomendar una direccion estetica sin pedir datos sensibles ni
              bloquear la compra.
            </p>
          </div>
          <div className="min-w-[220px]">
            <div className="mb-2 flex justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
              <span>Progreso</span>
              <span>{quizProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                style={{ width: `${quizProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {STYLE_QUIZ_QUESTIONS.map((question) => (
              <fieldset
                key={question.id}
                className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]"
              >
                <legend className="mb-4">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-dark)]">
                    {question.eyebrow}
                  </span>
                  <span className="mt-1 block text-xl font-semibold text-[var(--color-text-primary)]">
                    {question.question}
                  </span>
                </legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setAnswers((current) => ({ ...current, [question.id]: option.id }))
                        }
                        className={`rounded-lg border p-4 text-left transition ${
                          selected
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] shadow-[var(--shadow-sm)]'
                            : 'border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-accent)]'
                        }`}
                      >
                        <span className="block text-sm font-semibold text-[var(--color-text-primary)]">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--color-text-secondary)]">
                          {option.detail}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <aside className="h-fit rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-md)] lg:sticky lg:top-32">
            <div
              className={`mb-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${styleProfile.accentClass}`}
            >
              Resultado
            </div>
            <h3 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {styleProfile.name}
            </h3>
            <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
              {styleProfile.tagline}
            </p>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              {styleProfile.description}
            </p>
            <div className="mt-6 grid gap-3">
              <Link
                href={styleProfile.href}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
              >
                Ver productos para este estilo
              </Link>
              <a
                href="#ugc"
                className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-center text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-accent)]"
              >
                Convertirlo en fit check
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section
        id="ocasiones"
        className="scroll-mt-28 rounded-2xl bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8"
      >
        <div className="mb-6 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
            Shop by occasion
          </p>
          <h2 className="mt-2 text-3xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Menos catalogo frio, mas momentos de vida.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OCCASION_SHOPS.map((occasion) => (
            <Link
              key={occasion.title}
              href={occasion.href}
              className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-md)]"
            >
              <BrandIcon name={occasion.icon} className="h-6 w-6 text-[var(--color-accent-dark)]" />
              <h3 className="mt-4 text-lg font-semibold">{occasion.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {occasion.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 py-14 lg:grid-cols-4">
        {EXPERIENCE_CARDS.map((card) => (
          <article
            key={card.title}
            id={
              card.title.includes('Atelier')
                ? 'atelier'
                : card.title.includes('Drops')
                  ? 'drops'
                  : undefined
            }
            className="scroll-mt-28 rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-dark)]">
                {card.eyebrow}
              </span>
              <span className="rounded-full bg-[var(--color-surface)] p-2">
                <BrandIcon name={card.icon} className="h-4 w-4" />
              </span>
            </div>
            <h3 className="text-xl font-semibold">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {card.description}
            </p>
          </article>
        ))}
      </section>

      <section
        id="preventa"
        className="scroll-mt-28 rounded-2xl border border-[var(--color-border)] bg-[#181513] p-6 text-white shadow-[var(--shadow-md)] sm:p-8"
      >
        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Preventa co-creada
            </p>
            <h2
              className="mt-2 text-3xl font-semibold sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              La comunidad decide que drop merece existir.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/68 sm:text-base">
              Cada voto simula demanda real antes de producir. La marca gana FOMO, reduce riesgo de
              inventario y hace que los clientes empujen la campana por orgullo.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              Tu voto
            </p>
            <p className="mt-1 text-sm font-semibold">
              {selectedDropId
                ? CO_CREATED_DROPS.find((drop) => drop.id === selectedDropId)?.title
                : 'Elige un concepto'}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {CO_CREATED_DROPS.map((drop) => {
            const hasVote = selectedDropId === drop.id
            const displayedVotes = drop.votes + (hasVote ? 1 : 0)
            const progress = Math.min(100, Math.round((displayedVotes / drop.goal) * 100))

            return (
              <article
                key={drop.id}
                className="rounded-xl border border-white/10 bg-white/[0.08] p-5"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${drop.accent}`}
                    >
                      {drop.fandom}
                    </span>
                    <h3 className="mt-4 text-xl font-semibold">{drop.title}</h3>
                  </div>
                  <span className="rounded-full bg-white/10 p-2">
                    <BrandIcon name={drop.icon} className="h-5 w-5" />
                  </span>
                </div>
                <p className="text-sm leading-6 text-white/68">{drop.description}</p>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs font-semibold text-white/60">
                    <span>{displayedVotes} votos</span>
                    <span>Meta {drop.goal}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[var(--color-gold)] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDropVote(drop.id)}
                  className={`mt-5 w-full rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    hasVote
                      ? 'bg-white text-[#181513]'
                      : 'border border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  {hasVote ? 'Voto guardado' : 'Votar este drop'}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section
        id="ugc"
        className="mt-6 scroll-mt-28 rounded-2xl bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8"
      >
        <div className="mb-7 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
            Comunidad viral
          </p>
          <h2 className="mt-2 text-3xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Desafios que convierten clientes en contenido.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            La tienda deja de depender solo de anuncios: cada reto crea una razon concreta para
            volver, subir foto y pedir votos.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {COMMUNITY_CHALLENGES.map((challenge) => (
            <article
              key={challenge.title}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full bg-[var(--color-surface)] p-2 text-[var(--color-accent-dark)]">
                  <BrandIcon name={challenge.icon} className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                  {challenge.metric}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">{challenge.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {challenge.prompt}
              </p>
              <p className="mt-4 rounded-lg bg-white p-3 text-sm font-semibold text-[var(--color-text-primary)]">
                {challenge.reward}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="club"
        className="mt-6 scroll-mt-28 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
      >
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
              Club Harry's
            </p>
            <h2
              className="mt-2 text-3xl font-semibold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Membresia pensada para recurrencia, estatus y sorpresa.
            </h2>
          </div>
          <Link
            href="/profile"
            className="rounded-lg bg-[var(--color-primary)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Ver mi progreso
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {CLUB_TIERS.map((tier) => (
            <article
              key={tier.name}
              className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-dark)]">
                    {tier.highlight}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{tier.name}</h3>
                </div>
                <span className="rounded-full bg-[var(--color-surface)] p-2">
                  <BrandIcon name={tier.icon} className="h-5 w-5" />
                </span>
              </div>
              <p className="text-2xl font-semibold">{tier.price}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {tier.description}
              </p>
              <ul className="mt-5 space-y-2">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm">
                    <BrandIcon name="check" className="h-4 w-4 text-[var(--color-success)]" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section
        id="birthday"
        className="scroll-mt-28 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
              Birthday box
            </p>
            <h2
              className="mt-2 text-3xl font-semibold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Cumpleanos con look, tarjeta y regalo listo para grabar.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              La caja puede combinar prenda, accesorio, tarjeta personalizada y codigo para la
              proxima compra. Es una recompra anual con carga emocional real.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {['Prenda estrella', 'Tarjeta con nombre', 'QR para story'].map((item) => (
              <div key={item} className="rounded-xl bg-white p-5 shadow-[var(--shadow-sm)]">
                <BrandIcon name="gift" className="h-5 w-5 text-[var(--color-accent-dark)]" />
                <p className="mt-4 text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="adoption"
        className="mt-6 scroll-mt-28 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8"
      >
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
              Nuevo integrante
            </p>
            <h2
              className="mt-2 text-3xl font-semibold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Pack de adopcion para empezar la relacion desde el primer dia.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              Kit de bienvenida con guia de talla, prenda base y cupón para el primer cumpleanos.
            </p>
          </div>
          <Link
            href="/contact"
            className="rounded-lg bg-[var(--color-primary)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Pedir pack personalizado
          </Link>
        </div>
      </section>
    </div>
  )
}
