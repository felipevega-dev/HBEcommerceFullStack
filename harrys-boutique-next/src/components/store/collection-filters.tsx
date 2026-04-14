'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FilterChip } from '@/components/ui/filter-chip'

interface Category {
  id: string
  name: string
  subcategories: string[]
}

interface Props {
  categories: Category[]
  colors: string[]
  sizes: string[]
  currentParams: Record<string, string | undefined>
}

function AccordionSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-3 flex justify-between items-center bg-[var(--color-surface)]"
      >
        <span className="font-medium">{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

function FilterContent({
  categories,
  colors,
  sizes,
  selectedCategories,
  selectedSubcategories,
  selectedColors,
  selectedSizes,
  availableSubcategories,
  updateMultiFilter,
  showCategories,
  setShowCategories,
  showSubcategories,
  setShowSubcategories,
  showColors,
  setShowColors,
  showSizes,
  setShowSizes,
}: {
  categories: Category[]
  colors: string[]
  sizes: string[]
  selectedCategories: string[]
  selectedSubcategories: string[]
  selectedColors: string[]
  selectedSizes: string[]
  availableSubcategories: string[]
  updateMultiFilter: (key: string, value: string, current: string[]) => void
  showCategories: boolean
  setShowCategories: (v: (prev: boolean) => boolean) => void
  showSubcategories: boolean
  setShowSubcategories: (v: (prev: boolean) => boolean) => void
  showColors: boolean
  setShowColors: (v: (prev: boolean) => boolean) => void
  showSizes: boolean
  setShowSizes: (v: (prev: boolean) => boolean) => void
}) {
  return (
    <div className="space-y-4">
      <AccordionSection
        title="Categorías"
        open={showCategories}
        onToggle={() => setShowCategories((v) => !v)}
      >
        {categories.map((cat) => (
          <label key={cat.id} className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
              value={cat.name}
              checked={selectedCategories.includes(cat.name)}
              onChange={() => updateMultiFilter('category', cat.name, selectedCategories)}
            />
            <span className="text-sm">{cat.name}</span>
          </label>
        ))}
      </AccordionSection>

      <AccordionSection
        title="Subcategorías"
        open={showSubcategories}
        onToggle={() => setShowSubcategories((v) => !v)}
      >
        {availableSubcategories.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">Selecciona una categoría</p>
        ) : (
          availableSubcategories.map((sub) => (
            <label key={sub} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                value={sub}
                checked={selectedSubcategories.includes(sub)}
                onChange={() => updateMultiFilter('subCategory', sub, selectedSubcategories)}
              />
              <span className="text-sm">{sub}</span>
            </label>
          ))
        )}
      </AccordionSection>

      <AccordionSection title="Colores" open={showColors} onToggle={() => setShowColors((v) => !v)}>
        {colors.map((color) => (
          <label key={color} className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
              checked={selectedColors.includes(color)}
              onChange={() => updateMultiFilter('colors', color, selectedColors)}
            />
            <span
              className="w-4 h-4 rounded-full inline-block border border-[var(--color-border)]"
              style={{ backgroundColor: color.toLowerCase() }}
            />
            <span className="text-sm">{color}</span>
          </label>
        ))}
      </AccordionSection>

      <AccordionSection title="Tallas" open={showSizes} onToggle={() => setShowSizes((v) => !v)}>
        {sizes.map((size) => (
          <label key={size} className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
              checked={selectedSizes.includes(size)}
              onChange={() => updateMultiFilter('sizes', size, selectedSizes)}
            />
            <span className="text-sm">{size}</span>
          </label>
        ))}
      </AccordionSection>
    </div>
  )
}

export function CollectionFilters({ categories, colors, sizes, currentParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [showCategories, setShowCategories] = useState(true)
  const [showSubcategories, setShowSubcategories] = useState(true)
  const [showColors, setShowColors] = useState(true)
  const [showSizes, setShowSizes] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Multi-value params stored as comma-separated
  const selectedCategories = currentParams.category ? currentParams.category.split(',') : []
  const selectedSubcategories = currentParams.subCategory
    ? currentParams.subCategory.split(',')
    : []
  const selectedColors = currentParams.colors ? currentParams.colors.split(',') : []
  const selectedSizes = currentParams.sizes ? currentParams.sizes.split(',') : []

  const updateMultiFilter = useCallback(
    (key: string, value: string, current: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      if (next.length > 0) {
        params.set(key, next.join(','))
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  const removeFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const current =
        key === 'category'
          ? selectedCategories
          : key === 'subCategory'
            ? selectedSubcategories
            : key === 'colors'
              ? selectedColors
              : selectedSizes
      const next = current.filter((v) => v !== value)
      if (next.length > 0) {
        params.set(key, next.join(','))
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [
      router,
      pathname,
      searchParams,
      selectedCategories,
      selectedSubcategories,
      selectedColors,
      selectedSizes,
    ],
  )

  const clearAll = () => router.push(pathname)

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedSubcategories.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0

  // Available subcategories based on selected categories
  const availableSubcategories = categories
    .filter((cat) => selectedCategories.length === 0 || selectedCategories.includes(cat.name))
    .flatMap((cat) => cat.subcategories)
    .filter((v, i, a) => a.indexOf(v) === i)

  const sharedProps = {
    categories,
    colors,
    sizes,
    selectedCategories,
    selectedSubcategories,
    selectedColors,
    selectedSizes,
    availableSubcategories,
    updateMultiFilter,
    showCategories,
    setShowCategories,
    showSubcategories,
    setShowSubcategories,
    showColors,
    setShowColors,
    showSizes,
    setShowSizes,
  }

  return (
    <>
      {/* Mobile: "Filtros" button */}
      <button
        className="sm:hidden flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-medium mb-4"
        onClick={() => setDrawerOpen(true)}
        aria-label="Abrir filtros"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4h18M7 12h10M11 20h2"
          />
        </svg>
        Filtros
        {hasFilters && (
          <span className="ml-1 bg-[var(--color-accent)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {selectedCategories.length +
              selectedSubcategories.length +
              selectedColors.length +
              selectedSizes.length}
          </span>
        )}
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[var(--color-background)] z-50 sm:hidden overflow-y-auto"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium">Filtros</h2>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Cerrar filtros"
                    className="p-1 hover:opacity-70 transition-opacity"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Active filter chips inside drawer */}
                {hasFilters && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedCategories.map((cat) => (
                      <FilterChip
                        key={`cat-${cat}`}
                        label={cat}
                        onRemove={() => removeFilter('category', cat)}
                      />
                    ))}
                    {selectedSubcategories.map((sub) => (
                      <FilterChip
                        key={`sub-${sub}`}
                        label={sub}
                        onRemove={() => removeFilter('subCategory', sub)}
                      />
                    ))}
                    {selectedColors.map((color) => (
                      <FilterChip
                        key={`color-${color}`}
                        label={color}
                        onRemove={() => removeFilter('colors', color)}
                      />
                    ))}
                    {selectedSizes.map((size) => (
                      <FilterChip
                        key={`size-${size}`}
                        label={size}
                        onRemove={() => removeFilter('sizes', size)}
                      />
                    ))}
                    <button
                      onClick={clearAll}
                      className="text-sm text-[var(--color-error)] hover:opacity-70 transition-opacity px-2 py-1"
                    >
                      Limpiar todos
                    </button>
                  </div>
                )}

                <FilterContent {...sharedProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden sm:block w-64 flex-shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-medium">Filtros</h2>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-sm text-[var(--color-error)] hover:opacity-70 transition-opacity"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 pb-2">
              {selectedCategories.map((cat) => (
                <FilterChip
                  key={`cat-${cat}`}
                  label={cat}
                  onRemove={() => removeFilter('category', cat)}
                />
              ))}
              {selectedSubcategories.map((sub) => (
                <FilterChip
                  key={`sub-${sub}`}
                  label={sub}
                  onRemove={() => removeFilter('subCategory', sub)}
                />
              ))}
              {selectedColors.map((color) => (
                <FilterChip
                  key={`color-${color}`}
                  label={color}
                  onRemove={() => removeFilter('colors', color)}
                />
              ))}
              {selectedSizes.map((size) => (
                <FilterChip
                  key={`size-${size}`}
                  label={size}
                  onRemove={() => removeFilter('sizes', size)}
                />
              ))}
              <button
                onClick={clearAll}
                className="text-sm text-[var(--color-error)] hover:opacity-70 transition-opacity px-2 py-1"
              >
                Limpiar todos
              </button>
            </div>
          )}

          <FilterContent {...sharedProps} />
        </div>
      </aside>
    </>
  )
}
