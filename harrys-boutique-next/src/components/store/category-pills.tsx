import Link from 'next/link'

interface CategoryPill {
  id: string
  name: string
}

export function CategoryPills({ categories }: { categories: CategoryPill[] }) {
  if (categories.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.slice(0, 6).map((category) => (
        <Link
          key={category.id}
          href={`/collection?category=${encodeURIComponent(category.name)}`}
          className="shrink-0 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-dark)] hover:text-[var(--color-text-primary)]"
        >
          {category.name}
        </Link>
      ))}
      <Link
        href="/collection"
        className="shrink-0 rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface)]"
      >
        Ver todo
      </Link>
    </div>
  )
}
