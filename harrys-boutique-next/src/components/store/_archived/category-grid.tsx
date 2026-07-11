import Link from 'next/link'

interface Category {
  id: string
  name: string
  subcategories: string[]
}

// SVG icons keyed by normalized category name
function CategoryIcon({ name }: { name: string }) {
  const normalized = name.toLowerCase()

  if (normalized.includes('ropa') || normalized.includes('vestimenta')) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8 mb-2 text-[var(--color-accent)]"
        aria-hidden="true"
      >
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
      </svg>
    )
  }

  if (
    normalized.includes('accesorio') ||
    normalized.includes('collar') ||
    normalized.includes('correa')
  ) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8 mb-2 text-[var(--color-accent)]"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  if (normalized.includes('juguete') || normalized.includes('juego')) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8 mb-2 text-[var(--color-accent)]"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    )
  }

  if (
    normalized.includes('cama') ||
    normalized.includes('descanso') ||
    normalized.includes('casa')
  ) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8 mb-2 text-[var(--color-accent)]"
        aria-hidden="true"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  }

  if (
    normalized.includes('alimento') ||
    normalized.includes('comida') ||
    normalized.includes('snack')
  ) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8 mb-2 text-[var(--color-accent)]"
        aria-hidden="true"
      >
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    )
  }

  // Generic paw icon fallback
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-8 h-8 mb-2 text-[var(--color-accent)]"
      aria-hidden="true"
    >
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </svg>
  )
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null

  return (
    <section>
      <h2
        className="text-2xl md:text-3xl font-medium mb-6 text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Categorías
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/collection?category=${encodeURIComponent(cat.name)}`}
            className="group relative h-40 rounded-xl bg-[var(--color-surface)] overflow-hidden flex flex-col items-center justify-center p-4 transition-colors after:absolute after:inset-0 after:bg-[var(--color-accent)]/10 after:opacity-0 group-hover:after:opacity-100 after:transition-opacity"
          >
            <CategoryIcon name={cat.name} />
            <span className="font-medium text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-dark)] transition-colors relative z-10 text-center">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
