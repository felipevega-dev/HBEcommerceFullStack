import { Decimal } from '@prisma/client/runtime/library'

/**
 * Recursively converts Prisma Decimal objects to plain numbers
 * so they can be safely passed from Server Components to Client Components.
 */
export function serialize<T>(data: T): T {
  if (data === null || data === undefined) return data
  if (data instanceof Decimal) return Number(data) as unknown as T
  if (data instanceof Date) return data.toISOString() as unknown as T
  if (Array.isArray(data)) return data.map(serialize) as unknown as T
  if (typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([k, v]) => [k, serialize(v)]),
    ) as unknown as T
  }
  return data
}
