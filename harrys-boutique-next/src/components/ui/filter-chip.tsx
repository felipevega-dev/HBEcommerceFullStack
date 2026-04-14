interface FilterChipProps {
  label: string
  onRemove: () => void
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-accent-light)] text-[var(--color-accent-dark)] rounded-full text-sm">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Eliminar filtro ${label}`}
        className="hover:opacity-70 transition-opacity leading-none"
      >
        ×
      </button>
    </span>
  )
}
