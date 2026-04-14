/**
 * Formats a price number as Chilean Peso (CLP) currency string.
 * Uses Intl.NumberFormat with locale 'es-CL'.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price)
}

/**
 * Calculates the WCAG relative luminance of a hex color.
 */
function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255

  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/**
 * Calculates the WCAG contrast ratio between two hex colors.
 * Returns a value between 1 and 21.
 */
export function calculateContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Generates a URL-friendly slug from a product name.
 * Handles Spanish characters (á→a, é→e, etc.), removes special chars,
 * replaces spaces with hyphens, and lowercases everything.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics (á→a, é→e, ñ→n, etc.)
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
}

/** Shared shipping fee constant — used in checkout, orders API, and webhook */
export const SHIPPING_FEE = 10

/**
 * Maps Spanish color names (as stored in DB) to CSS hex values.
 * Falls back to the name itself so CSS named colors (e.g. "red") still work.
 */
export const COLOR_MAP: Record<string, string> = {
  negro: '#000000',
  blanco: '#FFFFFF',
  gris: '#808080',
  rojo: '#FF0000',
  azul: '#0000FF',
  verde: '#008000',
  amarillo: '#FFFF00',
  rosa: '#FFC0CB',
  morado: '#800080',
  naranja: '#FFA500',
  marrón: '#8B4513',
  marron: '#8B4513',
  beige: '#F5F5DC',
}

export function colorToHex(name: string): string {
  return COLOR_MAP[name.toLowerCase()] ?? name.toLowerCase()
}

/** Free shipping threshold in ARS */
export const FREE_SHIPPING_THRESHOLD = 50000
