import { z } from 'zod'

/**
 * Single source of truth for the shipping address collected at checkout.
 * The API validates with the schema and the form shows the same messages,
 * so a customer never gets a generic server error for a field the form
 * presented as optional.
 */
export const CHECKOUT_ADDRESS_FIELDS = [
  'firstname',
  'lastname',
  'email',
  'phone',
  'region',
  'city',
  'street',
  'postalCode',
  'country',
] as const

export type CheckoutAddressField = (typeof CHECKOUT_ADDRESS_FIELDS)[number]

const PHONE_CHARACTERS = /^[+\d\s().-]+$/

/** Accepts the usual Chilean formats (+56 9 1234 5678, 912345678, (+56) 9-1234-5678). */
export function isValidPhone(value: string) {
  const digits = value.match(/\d/g)?.length ?? 0
  return PHONE_CHARACTERS.test(value) && digits >= 8 && digits <= 15
}

export const checkoutAddressSchema = z.object({
  firstname: z.string().trim().min(1, 'Ingresa tu nombre').max(80, 'Usa máximo 80 caracteres'),
  lastname: z.string().trim().max(80, 'Usa máximo 80 caracteres').optional().default(''),
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa tu email')
    .max(254, 'El email es demasiado largo')
    .email('Revisa el formato del email, por ejemplo nombre@correo.cl'),
  phone: z
    .string()
    .trim()
    .min(1, 'Ingresa un teléfono de contacto')
    .max(25, 'Ingresa un teléfono válido, por ejemplo +56 9 1234 5678')
    .refine(isValidPhone, 'Ingresa un teléfono válido, por ejemplo +56 9 1234 5678'),
  region: z.string().trim().min(1, 'Selecciona tu región').max(80),
  city: z.string().trim().min(1, 'Selecciona o escribe tu comuna').max(80),
  street: z.string().trim().min(1, 'Ingresa calle y número').max(200, 'Usa máximo 200 caracteres'),
  postalCode: z.string().trim().max(20, 'Usa máximo 20 caracteres').optional().default(''),
  country: z.string().trim().min(1).max(56).default('Chile'),
})

export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>

/** Returns the first message per field, keyed by field, or an empty object when valid. */
export function getCheckoutAddressErrors(
  value: Partial<Record<CheckoutAddressField, string>>,
): Partial<Record<CheckoutAddressField, string>> {
  const result = checkoutAddressSchema.safeParse(value)
  if (result.success) return {}

  const errors: Partial<Record<CheckoutAddressField, string>> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as CheckoutAddressField | undefined
    if (field && !errors[field]) errors[field] = issue.message
  }
  return errors
}

/** First invalid field in visual order, used to move focus after a failed submit. */
export function getFirstInvalidAddressField(
  errors: Partial<Record<CheckoutAddressField, string>>,
): CheckoutAddressField | undefined {
  return CHECKOUT_ADDRESS_FIELDS.find((field) => errors[field])
}
