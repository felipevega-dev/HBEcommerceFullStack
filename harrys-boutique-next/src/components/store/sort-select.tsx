'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function SortSelect({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', value)
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="ui-field w-full min-w-0 sm:min-w-44"
    >
      <option value="latest">Más recientes</option>
      <option value="oldest">Más antiguos</option>
      <option value="price_asc">Menor precio</option>
      <option value="price_desc">Mayor precio</option>
      <option value="rating">Mejor valorados</option>
    </select>
  )
}
