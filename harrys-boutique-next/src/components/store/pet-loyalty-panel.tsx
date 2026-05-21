import Link from 'next/link'
import { BrandIcon } from '@/components/ui/brand-icon'
import { HARRYS_LOYALTY_MISSIONS, getLoyaltySummary } from '@/lib/pet-experience'

interface PetLoyaltyPanelProps {
  completedMissionIds: string[]
  variant?: 'profile' | 'experience'
}

export function PetLoyaltyPanel({
  completedMissionIds,
  variant = 'profile',
}: PetLoyaltyPanelProps) {
  const completed = new Set(completedMissionIds)
  const summary = getLoyaltySummary(completedMissionIds)
  const compact = variant === 'experience'

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
            HarryCoins
          </p>
          <h2
            className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Misiones de la comunidad
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Gana puntos por completar acciones que hacen la experiencia mas personal, social y
            rapida para futuros drops.
          </p>
        </div>
        <div className="rounded-xl bg-[var(--color-primary)] px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-[0.16em] text-white/65">Balance</p>
          <p className="mt-1 text-3xl font-semibold">{summary.coins}</p>
          <p className="text-sm text-white/75">Nivel {summary.tier.name}</p>
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
          <span>
            {summary.completedCount}/{summary.totalCount} misiones
          </span>
          <span>
            {summary.progress}% hacia {summary.nextTier.name}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)]"
            style={{ width: `${summary.progress}%` }}
          />
        </div>
      </div>

      {summary.nextMission ? (
        <Link
          href={summary.nextMission.href}
          className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-light)] p-4 transition hover:bg-white"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white p-2 text-[var(--color-accent-dark)]">
              <BrandIcon name={summary.nextMission.icon} className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Siguiente: {summary.nextMission.title}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                +{summary.nextMission.reward} HarryCoins
              </p>
            </div>
          </div>
          <BrandIcon name="chevron-right" className="h-5 w-5 text-[var(--color-accent-dark)]" />
        </Link>
      ) : null}

      <div className={`grid gap-3 ${compact ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
        {HARRYS_LOYALTY_MISSIONS.map((mission) => {
          const done = completed.has(mission.id)
          return (
            <Link
              key={mission.id}
              href={mission.href}
              className={`rounded-xl border p-4 transition ${
                done
                  ? 'border-[var(--color-success)] bg-green-50'
                  : 'border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-accent)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`rounded-full p-2 ${
                    done
                      ? 'bg-white text-[var(--color-success)]'
                      : 'bg-white text-[var(--color-accent-dark)]'
                  }`}
                >
                  <BrandIcon name={done ? 'check' : mission.icon} className="h-4 w-4" />
                </span>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                  +{mission.reward}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
                {mission.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                {mission.description}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
