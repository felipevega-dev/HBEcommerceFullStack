export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      {/* Imagen placeholder — aspecto 3:4 */}
      <div
        className="w-full rounded-[var(--radius-lg)] bg-[var(--color-surface-2)]"
        style={{ aspectRatio: '3 / 4' }}
      />
      {/* Líneas de texto */}
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-[var(--color-surface-2)] rounded w-3/4" />
        <div className="h-4 bg-[var(--color-surface-2)] rounded w-1/2" />
      </div>
    </div>
  )
}
