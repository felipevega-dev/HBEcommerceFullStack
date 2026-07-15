import { permanentRedirect } from 'next/navigation'

type LegacySearchParams = Record<string, string | string[] | undefined>

export default async function LegacyCollectionPage({
  searchParams,
}: {
  searchParams: Promise<LegacySearchParams>
}) {
  const currentParams = await searchParams
  const nextParams = new URLSearchParams()

  for (const [key, value] of Object.entries(currentParams)) {
    if (Array.isArray(value)) value.forEach((item) => nextParams.append(key, item))
    else if (value !== undefined) nextParams.set(key, value)
  }

  const query = nextParams.toString()
  permanentRedirect(`/tienda${query ? `?${query}` : ''}`)
}
