import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AddressForm } from '../address-form'

const empty = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  region: '',
  postalCode: '',
  country: 'Chile',
}

describe('AddressForm', () => {
  it('associates every label with its field and suggests browser autofill', () => {
    render(<AddressForm formData={empty} onChange={vi.fn()} idPrefix="checkout" />)

    expect(screen.getByLabelText(/Nombre/)).toHaveAttribute('autocomplete', 'given-name')
    expect(screen.getByLabelText(/Apellido/)).toHaveAttribute('autocomplete', 'family-name')
    expect(screen.getByLabelText(/Email/)).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText(/Teléfono/)).toHaveAttribute('inputmode', 'tel')
    expect(screen.getByLabelText(/Región/)).toHaveAttribute('autocomplete', 'address-level1')
    expect(screen.getByLabelText(/Dirección/)).toHaveAttribute('autocomplete', 'street-address')
    expect(screen.getByLabelText(/Código postal/)).toHaveAttribute('autocomplete', 'postal-code')
    expect(screen.getByLabelText(/Teléfono/)).toHaveAttribute('id', 'checkout-phone')
  })

  it('marks optional fields instead of required ones', () => {
    render(<AddressForm formData={empty} onChange={vi.fn()} />)

    expect(screen.getByText('Apellido').textContent).toContain('Apellido')
    expect(screen.getAllByText('(opcional)')).toHaveLength(2)
    expect(screen.getByLabelText(/Nombre/)).toBeRequired()
    expect(screen.getByLabelText(/Apellido/)).not.toBeRequired()
  })

  it('shows inline errors linked to their fields', () => {
    render(
      <AddressForm
        formData={empty}
        onChange={vi.fn()}
        idPrefix="checkout"
        errors={{ phone: 'Ingresa un teléfono de contacto' }}
      />,
    )

    const phone = screen.getByLabelText(/Teléfono/)
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    expect(phone).toHaveAccessibleDescription('Ingresa un teléfono de contacto')
    expect(screen.getByLabelText(/Nombre/)).not.toHaveAttribute('aria-invalid')
  })

  it('recognises regions and communes saved before the accented names', () => {
    render(
      <AddressForm
        formData={{ ...empty, region: 'Valparaiso', city: 'Vina del Mar' }}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText(/Región/)).toHaveValue('Valparaíso')
    expect(screen.getByLabelText(/Comuna/)).toHaveValue('Viña del Mar')
  })

  it('clears the commune when the region changes', async () => {
    const onChange = vi.fn()
    render(
      <AddressForm formData={{ ...empty, region: 'Maule', city: 'Talca' }} onChange={onChange} />,
    )

    await userEvent.selectOptions(screen.getByLabelText(/Región/), 'Ñuble')

    expect(onChange).toHaveBeenCalledWith({ region: 'Ñuble', city: '', country: 'Chile' })
  })
})
