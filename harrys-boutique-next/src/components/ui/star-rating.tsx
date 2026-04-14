interface StarRatingProps {
  average: number
  count: number
}

function StarIcon({ fill }: { fill: 'full' | 'half' | 'empty' }) {
  const id = `half-${Math.random().toString(36).slice(2, 7)}`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
    >
      {fill === 'half' && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor="var(--color-gold)" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill={fill === 'full' ? 'var(--color-gold)' : fill === 'half' ? `url(#${id})` : 'none'}
        stroke="var(--color-gold)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StarRating({ average, count }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const value = i + 1
    if (average >= value) return 'full' as const
    if (average >= value - 0.5) return 'half' as const
    return 'empty' as const
  })

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5" aria-label={`${average} de 5 estrellas`}>
        {stars.map((fill, i) => (
          <StarIcon key={i} fill={fill} />
        ))}
      </div>
      <span className="text-xs text-[var(--color-text-muted)]">({count})</span>
    </div>
  )
}
