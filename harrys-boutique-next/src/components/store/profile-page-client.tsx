'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { AddressForm } from './address-form'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'

interface Address {
  id: string
  firstname: string
  lastname: string
  phone: string
  street: string
  city: string
  region: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface UserWithAddresses {
  id: string
  name: string
  email: string
  role: string
  profileImage?: string | null
  createdAt: string
  addresses: Address[]
}

const emptyAddress = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
  isDefault: false,
}

interface PetPassport {
  name: string
  species: string
  birthday: string
  size: string
  personality: string
}

const PET_PASSPORT_STORAGE_KEY = 'harrys-pet-passport'

const emptyPetPassport: PetPassport = {
  name: '',
  species: 'Perro',
  birthday: '',
  size: '',
  personality: 'Soft Cozy',
}

export function ProfilePageClient({ user: initialUser }: { user: UserWithAddresses }) {
  const [user, setUser] = useState(initialUser)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [currentAddress, setCurrentAddress] = useState({ ...emptyAddress })
  const [saving, setSaving] = useState(false)
  const [petPassport, setPetPassport] = useState<PetPassport>(emptyPetPassport)
  const [petPassportLoaded, setPetPassportLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PET_PASSPORT_STORAGE_KEY)
      if (stored) {
        setPetPassport({ ...emptyPetPassport, ...JSON.parse(stored) })
      }
    } catch {
      localStorage.removeItem(PET_PASSPORT_STORAGE_KEY)
    } finally {
      setPetPassportLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!petPassportLoaded) return
    localStorage.setItem(PET_PASSPORT_STORAGE_KEY, JSON.stringify(petPassport))
  }, [petPassport, petPassportLoaded])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        const profileRes = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileImage: data.url }),
        })
        const profileData = await profileRes.json()
        if (profileData.success) {
          setUser((u) => ({ ...u, profileImage: data.url }))
          toast.success('Foto de perfil actualizada')
        }
      }
    } catch {
      toast.error('Error al actualizar la foto de perfil')
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentAddress.firstname || !currentAddress.street || !currentAddress.city) {
      toast.error('Por favor complete los campos requeridos')
      return
    }

    setSaving(true)
    try {
      if (isAddingNew) {
        const res = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentAddress),
        })
        const data = await res.json()
        if (data.success) {
          setUser((u) => ({ ...u, addresses: [...u.addresses, data.address] }))
          toast.success('Dirección añadida correctamente')
          setIsAddingNew(false)
          setCurrentAddress({ ...emptyAddress })
        } else {
          toast.error(data.message ?? 'Error al añadir dirección')
        }
      } else if (editingAddress) {
        const res = await fetch(`/api/user/addresses?id=${editingAddress.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentAddress),
        })
        const data = await res.json()
        if (data.success) {
          setUser((u) => ({
            ...u,
            addresses: u.addresses.map((a) => (a.id === editingAddress.id ? data.address : a)),
          }))
          toast.success('Dirección actualizada correctamente')
          setEditingAddress(null)
          setCurrentAddress({ ...emptyAddress })
        } else {
          toast.error(data.message ?? 'Error al actualizar dirección')
        }
      }
    } catch {
      toast.error('Error al guardar la dirección')
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const res = await fetch(`/api/user/addresses?id=${addressId}&action=setDefault`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      const data = await res.json()
      if (data.success) {
        setUser((u) => ({
          ...u,
          addresses: u.addresses.map((a) => ({ ...a, isDefault: a.id === addressId })),
        }))
        toast.success('Dirección predeterminada actualizada')
      }
    } catch {
      toast.error('Error al actualizar la dirección predeterminada')
    }
  }

  const handleEditAddress = (addr: Address) => {
    setEditingAddress(addr)
    setIsAddingNew(false)
    setCurrentAddress({
      firstname: addr.firstname,
      lastname: addr.lastname,
      email: user.email,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      region: addr.region,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    })
  }

  const handleStartAddNew = () => {
    if (user.addresses.length >= 2) {
      toast.warning('Solo puedes tener hasta 2 direcciones guardadas')
      return
    }
    setIsAddingNew(true)
    setEditingAddress(null)
    setCurrentAddress({
      ...emptyAddress,
      email: user.email,
      isDefault: user.addresses.length === 0,
    })
  }

  const handleAddressChange = (updates: Partial<typeof currentAddress>) => {
    setCurrentAddress((prev) => ({ ...prev, ...updates }))
  }

  const handlePetPassportChange = (updates: Partial<PetPassport>) => {
    setPetPassport((prev) => ({ ...prev, ...updates }))
  }

  const inputClass =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200'

  const showForm = isAddingNew || editingAddress !== null

  return (
    <div>
      <PageHeader
        title="Mi cuenta"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Mi cuenta' }]}
      />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Personal info + addresses */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          {/* Profile image */}
          <div className="mb-6 flex flex-col items-center">
            <div className="relative">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt="Profile"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Información Personal</h3>
            {!showForm && user.addresses.length < 2 && (
              <button
                onClick={handleStartAddNew}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                Añadir dirección
              </button>
            )}
          </div>

          <div className="space-y-4">
            <p>
              <span className="font-medium">Nombre:</span> {user.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Direcciones de Facturación</h4>
              {user.addresses.length > 0 ? (
                <div className="space-y-4">
                  {user.addresses.map((addr) => (
                    <div key={addr.id} className="p-4 border rounded-lg relative">
                      {addr.isDefault && (
                        <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Predeterminada
                        </span>
                      )}
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-600">Nombre:</span> {addr.firstname}{' '}
                          {addr.lastname}
                        </p>
                        <p>
                          <span className="text-gray-600">Teléfono:</span> {addr.phone}
                        </p>
                        <p>
                          <span className="text-gray-600">Dirección:</span> {addr.street}
                        </p>
                        <p>
                          <span className="text-gray-600">Ciudad:</span> {addr.city}, {addr.region}
                        </p>
                        <p>
                          <span className="text-gray-600">País:</span> {addr.country}
                        </p>
                      </div>
                      <div className="mt-3 flex gap-3">
                        <button
                          onClick={() => handleEditAddress(addr)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Editar
                        </button>
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Establecer como predeterminada
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay direcciones guardadas</p>
              )}
            </div>
          </div>

          {/* Address form */}
          {showForm && (
            <form
              onSubmit={handleAddressSubmit}
              className="mt-6 space-y-4 border-t pt-4"
              id="address-form"
            >
              <h4 className="font-medium">
                {isAddingNew ? 'Nueva dirección de facturación' : 'Editar dirección de facturación'}
              </h4>

              <AddressForm
                formData={currentAddress}
                onChange={handleAddressChange}
                showEmail={false}
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 text-sm"
                >
                  {saving ? 'Guardando...' : isAddingNew ? 'Añadir dirección' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false)
                    setEditingAddress(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="mb-5">
            <h3 className="text-xl font-medium">Mi mascota</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Datos opcionales para recomendaciones de talla.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Nombre
              <input
                className={inputClass}
                value={petPassport.name}
                onChange={(event) => handlePetPassportChange({ name: event.target.value })}
                placeholder="Ej: Harry"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Especie
                <select
                  className={inputClass}
                  value={petPassport.species}
                  onChange={(event) => handlePetPassportChange({ species: event.target.value })}
                >
                  <option>Perro</option>
                  <option>Gato</option>
                  <option>Otra</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                Talla
                <input
                  className={inputClass}
                  value={petPassport.size}
                  onChange={(event) => handlePetPassportChange({ size: event.target.value })}
                  placeholder="XS, S, M..."
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Cumpleanos
                <input
                  type="date"
                  className={inputClass}
                  value={petPassport.birthday}
                  onChange={(event) => handlePetPassportChange({ birthday: event.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Personalidad
                <select
                  className={inputClass}
                  value={petPassport.personality}
                  onChange={(event) => handlePetPassportChange({ personality: event.target.value })}
                >
                  <option>Soft Cozy</option>
                  <option>Street Royal</option>
                  <option>Mini Royal</option>
                  <option>Anime Cozy</option>
                  <option>Explorer Chic</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Pedidos Recientes</h3>
            <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-800">
              Ver todos los pedidos
            </Link>
          </div>
          <p className="text-gray-500 text-sm">
            Visita la sección de{' '}
            <Link href="/orders" className="text-blue-600 hover:underline">
              Mis Pedidos
            </Link>{' '}
            para ver el historial completo.
          </p>
        </div>
      </div>
    </div>
  )
}
