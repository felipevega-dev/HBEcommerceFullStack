export function canUseDatabaseFallback(error: unknown) {
  if (process.env.NODE_ENV === 'production') return false

  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes("Can't reach database server") ||
    message.includes('ECONNREFUSED') ||
    message.includes('PrismaClientInitializationError')
  )
}

export function logDatabaseFallback(scope: string, error: unknown) {
  console.warn(`[${scope}] DB no disponible; usando fallback de desarrollo`, error)
}
