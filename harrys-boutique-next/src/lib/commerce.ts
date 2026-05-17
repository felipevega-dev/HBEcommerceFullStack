export const CURRENCY_CODE = 'CLP'
export const CURRENCY_LOCALE = 'es-CL'
export const SHIPPING_FEE = 3990
export const FREE_SHIPPING_THRESHOLD = 50000

export function calculateShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}
