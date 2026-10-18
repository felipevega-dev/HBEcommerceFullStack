import { describe, expect, it } from 'vitest'
import {
  checkoutAddressSchema,
  getCheckoutAddressErrors,
  getFirstInvalidAddressField,
  isValidPhone,
} from '../validations/checkout-address'

const valid = {
  firstname: 'Ana',
  lastname: '',
  email: 'ana@correo.cl',
  phone: '+56 9 1234 5678',
  region: 'Valparaíso',
  city: 'Viña del Mar',
  street: 'Av. Libertad 123, depto 45',
  postalCode: '',
  country: 'Chile',
}

describe('checkout address rules', () => {
  it('accepts an address without last name or postal code, as the form presents them', () => {
    expect(getCheckoutAddressErrors(valid)).toEqual({})

    const parsed = checkoutAddressSchema.parse({
      ...valid,
      lastname: undefined,
      postalCode: undefined,
    })
    expect(parsed.lastname).toBe('')
    expect(parsed.postalCode).toBe('')
  })

  it('trims values before validating and storing them', () => {
    const parsed = checkoutAddressSchema.parse({
      ...valid,
      firstname: '  Ana  ',
      street: ' Calle 1 ',
    })
    expect(parsed.firstname).toBe('Ana')
    expect(parsed.street).toBe('Calle 1')
    expect(getCheckoutAddressErrors({ ...valid, firstname: '   ' })).toEqual({
      firstname: 'Ingresa tu nombre',
    })
  })

  it('returns one Spanish message per missing required field, in form order', () => {
    const errors = getCheckoutAddressErrors({
      ...valid,
      firstname: '',
      phone: '',
      region: '',
      city: '',
      street: '',
    })

    expect(errors).toEqual({
      firstname: 'Ingresa tu nombre',
      phone: 'Ingresa un teléfono de contacto',
      region: 'Selecciona tu región',
      city: 'Selecciona o escribe tu comuna',
      street: 'Ingresa calle y número',
    })
    expect(getFirstInvalidAddressField(errors)).toBe('firstname')
    expect(getFirstInvalidAddressField({ street: 'x', phone: 'y' })).toBe('phone')
    expect(getFirstInvalidAddressField({})).toBeUndefined()
  })

  it('explains how to fix an invalid email', () => {
    expect(getCheckoutAddressErrors({ ...valid, email: 'ana@' }).email).toMatch(/nombre@correo\.cl/)
  })

  it.each(['+56 9 1234 5678', '912345678', '(+56) 9-1234-5678', '+56912345678', '22 345 6789'])(
    'accepts the phone %s',
    (phone) => {
      expect(isValidPhone(phone)).toBe(true)
      expect(getCheckoutAddressErrors({ ...valid, phone })).toEqual({})
    },
  )

  it.each(['1234567', 'llámame', '+56 9 1234 5678 ext 2', '+'.padEnd(17, '9')])(
    'rejects the phone %s',
    (phone) => {
      expect(getCheckoutAddressErrors({ ...valid, phone }).phone).toMatch(/teléfono válido/)
    },
  )
})
