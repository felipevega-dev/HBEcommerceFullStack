'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CheckoutAddressField } from '@/lib/validations/checkout-address'

interface AddressFormData {
  firstname: string
  lastname: string
  email: string
  phone: string
  street: string
  city: string
  region: string
  postalCode: string
  country: string
}

interface AddressFormProps {
  formData: AddressFormData
  onChange: (data: Partial<AddressFormData>) => void
  showEmail?: boolean
  emailReadOnly?: boolean
  /** Inline messages per field; the form marks those inputs as invalid. */
  errors?: Partial<Record<CheckoutAddressField, string>>
  /** Prefix for input ids so the parent can move focus to a field (`${idPrefix}-${field}`). */
  idPrefix?: string
}

const COUNTRY = 'Chile'

const CHILE_REGIONS = [
  { name: 'Arica y Parinacota', cities: ['Arica', 'Putre', 'Camarones'] },
  { name: 'Tarapacá', cities: ['Iquique', 'Alto Hospicio', 'Pozo Almonte'] },
  { name: 'Antofagasta', cities: ['Antofagasta', 'Calama', 'Tocopilla'] },
  { name: 'Atacama', cities: ['Copiapó', 'Caldera', 'Vallenar'] },
  { name: 'Coquimbo', cities: ['La Serena', 'Coquimbo', 'Ovalle'] },
  { name: 'Valparaíso', cities: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana'] },
  {
    name: 'Metropolitana de Santiago',
    cities: ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú', 'La Florida'],
  },
  { name: "O'Higgins", cities: ['Rancagua', 'San Fernando', 'Rengo'] },
  { name: 'Maule', cities: ['Talca', 'Curicó', 'Linares'] },
  { name: 'Ñuble', cities: ['Chillán', 'San Carlos', 'Bulnes'] },
  { name: 'Biobío', cities: ['Concepción', 'Talcahuano', 'Los Ángeles'] },
  { name: 'La Araucanía', cities: ['Temuco', 'Villarrica', 'Angol'] },
  { name: 'Los Ríos', cities: ['Valdivia', 'La Unión', 'Río Bueno'] },
  { name: 'Los Lagos', cities: ['Puerto Montt', 'Osorno', 'Castro'] },
  { name: 'Aysén', cities: ['Coyhaique', 'Puerto Aysén', 'Chile Chico'] },
  { name: 'Magallanes', cities: ['Punta Arenas', 'Puerto Natales', 'Porvenir'] },
]

/** Saved addresses predate the accented names ("Valparaiso", "O Higgins"); compare loosely. */
function normalizePlace(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const OTHER_CITY = '__other__'

export function AddressForm({
  formData,
  onChange,
  showEmail = true,
  emailReadOnly = false,
  errors = {},
  idPrefix = 'address',
}: AddressFormProps) {
  const [useCustomCity, setUseCustomCity] = useState(false)

  useEffect(() => {
    if (!formData.country || formData.country !== COUNTRY) {
      onChange({ country: COUNTRY })
    }
  }, [formData.country, onChange])

  const selectedRegion = useMemo(() => {
    const wanted = normalizePlace(formData.region)
    return wanted
      ? CHILE_REGIONS.find((region) => normalizePlace(region.name) === wanted)
      : undefined
  }, [formData.region])

  const matchedCity = useMemo(() => {
    const wanted = normalizePlace(formData.city)
    return wanted
      ? selectedRegion?.cities.find((city) => normalizePlace(city) === wanted)
      : undefined
  }, [formData.city, selectedRegion])

  useEffect(() => {
    if (selectedRegion && formData.city && !matchedCity) {
      setUseCustomCity(true)
    }
  }, [formData.city, matchedCity, selectedRegion])

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUseCustomCity(false)
    onChange({ region: e.target.value, city: '', country: COUNTRY })
  }

  const fieldId = (field: CheckoutAddressField) => `${idPrefix}-${field}`
  const errorId = (field: CheckoutAddressField) => `${idPrefix}-${field}-error`

  const fieldProps = (field: CheckoutAddressField) => ({
    id: fieldId(field),
    name: field,
    'aria-invalid': errors[field] ? (true as const) : undefined,
    'aria-describedby': errors[field] ? errorId(field) : undefined,
    className: 'ui-field w-full',
  })

  const label = (field: CheckoutAddressField, text: string, required = false) => (
    <label
      htmlFor={fieldId(field)}
      className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]"
    >
      {text}
      {required ? (
        <span aria-hidden="true" className="ml-0.5 text-[var(--color-error)]">
          *
        </span>
      ) : (
        <span className="ml-1 font-normal text-[var(--color-text-muted)]">(opcional)</span>
      )}
    </label>
  )

  const errorText = (field: CheckoutAddressField) =>
    errors[field] ? (
      <p id={errorId(field)} className="mt-1.5 text-sm text-[var(--color-error)]">
        {errors[field]}
      </p>
    ) : null

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        {label('firstname', 'Nombre', true)}
        <input
          {...fieldProps('firstname')}
          required
          type="text"
          autoComplete="given-name"
          value={formData.firstname}
          onChange={(e) => onChange({ firstname: e.target.value })}
          placeholder="Tu nombre"
        />
        {errorText('firstname')}
      </div>

      <div>
        {label('lastname', 'Apellido')}
        <input
          {...fieldProps('lastname')}
          type="text"
          autoComplete="family-name"
          value={formData.lastname}
          onChange={(e) => onChange({ lastname: e.target.value })}
          placeholder="Tu apellido"
        />
        {errorText('lastname')}
      </div>

      {showEmail && (
        <div>
          {label('email', 'Email', true)}
          <input
            {...fieldProps('email')}
            required
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="tu@email.com"
            readOnly={emailReadOnly}
          />
          {errorText('email')}
        </div>
      )}

      <div>
        {label('phone', 'Teléfono', true)}
        <input
          {...fieldProps('phone')}
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={formData.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+56 9 1234 5678"
        />
        {errorText('phone')}
      </div>

      <div>
        {label('region', 'Región', true)}
        <select
          {...fieldProps('region')}
          required
          autoComplete="address-level1"
          value={selectedRegion?.name ?? formData.region}
          onChange={handleRegionChange}
          className="ui-field w-full cursor-pointer"
        >
          <option value="">Selecciona una región</option>
          {CHILE_REGIONS.map((region) => (
            <option key={region.name} value={region.name}>
              {region.name}
            </option>
          ))}
        </select>
        {errorText('region')}
      </div>

      <div>
        {label('city', 'Comuna', true)}
        {selectedRegion ? (
          <select
            {...fieldProps('city')}
            required
            autoComplete="address-level2"
            value={useCustomCity ? OTHER_CITY : (matchedCity ?? formData.city)}
            onChange={(e) => {
              if (e.target.value === OTHER_CITY) {
                setUseCustomCity(true)
                onChange({ city: '' })
                return
              }

              setUseCustomCity(false)
              onChange({ city: e.target.value })
            }}
            className="ui-field w-full cursor-pointer"
          >
            <option value="">Selecciona una comuna</option>
            {selectedRegion.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
            <option value={OTHER_CITY}>Otra comuna</option>
          </select>
        ) : (
          <input
            {...fieldProps('city')}
            required
            type="text"
            autoComplete="address-level2"
            value={formData.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Selecciona primero la región"
          />
        )}
        {!useCustomCity && errorText('city')}
      </div>

      {useCustomCity && (
        <div>
          <label
            htmlFor={`${fieldId('city')}-custom`}
            className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]"
          >
            Escribe tu comuna
            <span aria-hidden="true" className="ml-0.5 text-[var(--color-error)]">
              *
            </span>
          </label>
          <input
            id={`${fieldId('city')}-custom`}
            name="city-custom"
            required
            type="text"
            autoComplete="address-level2"
            aria-invalid={errors.city ? true : undefined}
            aria-describedby={errors.city ? errorId('city') : undefined}
            value={matchedCity ? '' : formData.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="ui-field w-full"
            placeholder="Comuna"
          />
          {errorText('city')}
        </div>
      )}

      <div className="md:col-span-2">
        {label('street', 'Dirección', true)}
        <input
          {...fieldProps('street')}
          required
          type="text"
          autoComplete="street-address"
          value={formData.street}
          onChange={(e) => onChange({ street: e.target.value })}
          placeholder="Calle, número, depto. o referencia"
        />
        {errorText('street')}
      </div>

      <div>
        {label('postalCode', 'Código postal')}
        <input
          {...fieldProps('postalCode')}
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          value={formData.postalCode}
          onChange={(e) => onChange({ postalCode: e.target.value })}
          placeholder="Ej: 1000000"
        />
        {errorText('postalCode')}
      </div>

      <div>
        <label
          htmlFor={fieldId('country')}
          className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]"
        >
          País
        </label>
        <input
          id={fieldId('country')}
          name="country"
          readOnly
          autoComplete="country-name"
          value={COUNTRY}
          className="ui-field w-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
        />
      </div>
    </div>
  )
}
