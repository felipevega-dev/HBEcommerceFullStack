'use client'

import { useState, useEffect, useMemo } from 'react'
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city'

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
}

export function AddressForm({ formData, onChange, showEmail = true, emailReadOnly = false }: AddressFormProps) {
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null)
  const [selectedState, setSelectedState] = useState<IState | null>(null)
  const [states, setStates] = useState<IState[]>([])
  const [cities, setCities] = useState<ICity[]>([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  // Get all countries sorted by name
  const countries = useMemo(() => {
    return Country.getAllCountries().sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  // Initialize country from formData
  useEffect(() => {
    if (formData.country && !selectedCountry) {
      const country = countries.find(
        (c) => c.name === formData.country || c.isoCode === formData.country
      )
      if (country) {
        setSelectedCountry(country)
      }
    }
  }, [formData.country, countries, selectedCountry])

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      setLoadingStates(true)
      const countryStates = State.getStatesOfCountry(selectedCountry.isoCode)
      setStates(countryStates)
      setLoadingStates(false)

      // Try to find matching state from formData
      if (formData.region && countryStates.length > 0) {
        const state = countryStates.find(
          (s) => s.name === formData.region || s.isoCode === formData.region
        )
        if (state) {
          setSelectedState(state)
        }
      }
    } else {
      setStates([])
      setSelectedState(null)
    }
  }, [selectedCountry, formData.region])

  // Load cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      setLoadingCities(true)
      const stateCities = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
      setCities(stateCities)
      setLoadingCities(false)
    } else if (selectedCountry && states.length === 0) {
      // If country has no states, load cities directly
      setLoadingCities(true)
      const countryCities = City.getCitiesOfCountry(selectedCountry.isoCode)
      setCities(countryCities || [])
      setLoadingCities(false)
    } else {
      setCities([])
    }
  }, [selectedCountry, selectedState, states.length])

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value
    const country = countries.find((c) => c.isoCode === countryCode)
    
    setSelectedCountry(country || null)
    setSelectedState(null)
    setCities([])
    
    onChange({
      country: country?.name || '',
      region: '',
      city: '',
      postalCode: '',
    })
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value
    const state = states.find((s) => s.isoCode === stateCode)
    
    setSelectedState(state || null)
    
    onChange({
      region: state?.name || '',
      city: '',
      postalCode: '',
    })
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value
    const city = cities.find((c) => c.name === cityName)
    
    onChange({
      city: cityName,
      // Some cities have postal codes in the data
      ...(city && { postalCode: formData.postalCode || '' }),
    })
  }

  const inputClass =
    'border border-[var(--color-border)] rounded-lg px-3.5 py-2.5 w-full text-sm bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-muted)]'

  const selectClass = `${inputClass} cursor-pointer`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Nombre */}
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="text"
          value={formData.firstname}
          onChange={(e) => onChange({ firstname: e.target.value })}
          className={inputClass}
          placeholder="Tu nombre"
        />
      </div>

      {/* Apellido */}
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Apellido
        </label>
        <input
          type="text"
          value={formData.lastname}
          onChange={(e) => onChange({ lastname: e.target.value })}
          className={inputClass}
          placeholder="Tu apellido"
        />
      </div>

      {/* Email */}
      {showEmail && (
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={inputClass}
            placeholder="tu@email.com"
            readOnly={emailReadOnly}
          />
        </div>
      )}

      {/* Teléfono */}
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Teléfono <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          className={inputClass}
          placeholder="+54 11 1234-5678"
        />
      </div>

      {/* País */}
      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          País <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={selectedCountry?.isoCode || ''}
          onChange={handleCountryChange}
          className={selectClass}
        >
          <option value="">Selecciona un país</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.flag} {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Región/Estado */}
      {states.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Región / Estado <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={selectedState?.isoCode || ''}
            onChange={handleStateChange}
            className={selectClass}
            disabled={loadingStates}
          >
            <option value="">
              {loadingStates ? 'Cargando...' : 'Selecciona una región'}
            </option>
            {states.map((state) => (
              <option key={state.isoCode} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Ciudad */}
      {cities.length > 0 ? (
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Ciudad <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.city}
            onChange={handleCityChange}
            className={selectClass}
            disabled={loadingCities}
          >
            <option value="">
              {loadingCities ? 'Cargando...' : 'Selecciona una ciudad'}
            </option>
            {cities.map((city) => (
              <option key={`${city.name}-${city.stateCode}`} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Ciudad <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={formData.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className={inputClass}
            placeholder="Ciudad"
          />
        </div>
      )}

      {/* Dirección */}
      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Dirección <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="text"
          value={formData.street}
          onChange={(e) => onChange({ street: e.target.value })}
          className={inputClass}
          placeholder="Calle y número"
        />
      </div>

      {/* Código Postal */}
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Código Postal
        </label>
        <input
          type="text"
          value={formData.postalCode}
          onChange={(e) => onChange({ postalCode: e.target.value })}
          className={inputClass}
          placeholder="1234"
        />
        {selectedCountry && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Formato: {selectedCountry.isoCode === 'AR' ? 'XXXX' : selectedCountry.isoCode === 'CL' ? 'XXXXXXX' : 'Según tu país'}
          </p>
        )}
      </div>

      {/* Región manual (si no hay estados) */}
      {selectedCountry && states.length === 0 && (
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Región / Provincia
          </label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => onChange({ region: e.target.value })}
            className={inputClass}
            placeholder="Provincia"
          />
        </div>
      )}
    </div>
  )
}
