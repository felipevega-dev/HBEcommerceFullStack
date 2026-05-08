'use client'

import { useEffect, useMemo, useState } from 'react'

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

const COUNTRY = 'Chile'

const CHILE_REGIONS = [
  { name: 'Arica y Parinacota', cities: ['Arica', 'Putre', 'Camarones'] },
  { name: 'Tarapaca', cities: ['Iquique', 'Alto Hospicio', 'Pozo Almonte'] },
  { name: 'Antofagasta', cities: ['Antofagasta', 'Calama', 'Tocopilla'] },
  { name: 'Atacama', cities: ['Copiapo', 'Caldera', 'Vallenar'] },
  { name: 'Coquimbo', cities: ['La Serena', 'Coquimbo', 'Ovalle'] },
  { name: 'Valparaiso', cities: ['Valparaiso', 'Vina del Mar', 'Quilpue', 'Villa Alemana'] },
  {
    name: 'Metropolitana de Santiago',
    cities: ['Santiago', 'Providencia', 'Las Condes', 'Nunoa', 'Maipu', 'La Florida'],
  },
  { name: 'O Higgins', cities: ['Rancagua', 'San Fernando', 'Rengo'] },
  { name: 'Maule', cities: ['Talca', 'Curico', 'Linares'] },
  { name: 'Nuble', cities: ['Chillan', 'San Carlos', 'Bulnes'] },
  { name: 'Biobio', cities: ['Concepcion', 'Talcahuano', 'Los Angeles'] },
  { name: 'La Araucania', cities: ['Temuco', 'Villarrica', 'Angol'] },
  { name: 'Los Rios', cities: ['Valdivia', 'La Union', 'Rio Bueno'] },
  { name: 'Los Lagos', cities: ['Puerto Montt', 'Osorno', 'Castro'] },
  { name: 'Aysen', cities: ['Coyhaique', 'Puerto Aysen', 'Chile Chico'] },
  { name: 'Magallanes', cities: ['Punta Arenas', 'Puerto Natales', 'Porvenir'] },
]

export function AddressForm({
  formData,
  onChange,
  showEmail = true,
  emailReadOnly = false,
}: AddressFormProps) {
  const [useCustomCity, setUseCustomCity] = useState(false)

  useEffect(() => {
    if (!formData.country || formData.country !== COUNTRY) {
      onChange({ country: COUNTRY })
    }
  }, [formData.country, onChange])

  const selectedRegion = useMemo(
    () => CHILE_REGIONS.find((region) => region.name === formData.region),
    [formData.region],
  )

  useEffect(() => {
    if (selectedRegion && formData.city && !selectedRegion.cities.includes(formData.city)) {
      setUseCustomCity(true)
    }
  }, [formData.city, selectedRegion])

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUseCustomCity(false)
    onChange({
      region: e.target.value,
      city: '',
      country: COUNTRY,
    })
  }

  const inputClass =
    'border border-[var(--color-border)] rounded-lg px-3.5 py-2.5 w-full text-sm bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-muted)]'

  const selectClass = `${inputClass} cursor-pointer`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Telefono <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          className={inputClass}
          placeholder="+56 9 1234 5678"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Region <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.region}
          onChange={handleRegionChange}
          className={selectClass}
        >
          <option value="">Selecciona una region</option>
          {CHILE_REGIONS.map((region) => (
            <option key={region.name} value={region.name}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Ciudad / Comuna <span className="text-red-500">*</span>
        </label>
        {selectedRegion ? (
          <select
            required
            value={useCustomCity ? 'Otra' : formData.city}
            onChange={(e) => {
              if (e.target.value === 'Otra') {
                setUseCustomCity(true)
                onChange({ city: '' })
                return
              }

              setUseCustomCity(false)
              onChange({ city: e.target.value })
            }}
            className={selectClass}
          >
            <option value="">Selecciona una ciudad</option>
            {selectedRegion.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
            <option value="Otra">Otra</option>
          </select>
        ) : (
          <input
            required
            type="text"
            value={formData.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className={inputClass}
            placeholder="Ciudad o comuna"
          />
        )}
      </div>

      {useCustomCity && (
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Especifica tu comuna
          </label>
          <input
            required
            type="text"
            value={selectedRegion?.cities.includes(formData.city) ? '' : formData.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className={inputClass}
            placeholder="Comuna"
          />
        </div>
      )}

      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Direccion <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="text"
          value={formData.street}
          onChange={(e) => onChange({ street: e.target.value })}
          className={inputClass}
          placeholder="Calle, numero, depto o referencia"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Codigo postal
        </label>
        <input
          type="text"
          value={formData.postalCode}
          onChange={(e) => onChange({ postalCode: e.target.value })}
          className={inputClass}
          placeholder="Opcional"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Pais
        </label>
        <input readOnly value={COUNTRY} className={`${inputClass} bg-[var(--color-surface)]`} />
      </div>
    </div>
  )
}
