const DEFAULT_SITE_URL = 'https://harrys-boutique.com'

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_FRONTEND_URL ?? process.env.NEXTAUTH_URL ?? DEFAULT_SITE_URL
}

export function getSiteOrigin() {
  return new URL(getSiteUrl())
}
