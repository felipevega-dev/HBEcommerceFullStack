'use client'

import { useCartStore } from '@/store/cart-store'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'

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

interface FormData {
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

const SHIPPING_FEE = 10

export function CheckoutPageClient() {
  const { items, getTotal, clearCart } = useCartStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<'cod' | 'mercadopago'>('cod')
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [preferenceId, setPreferenceId] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
  })

  useEffect(() => {
    fetch('/api/user/addresses')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.addresses) {
          setSavedAddresses(data.addresses)
          const def = data.addresses.find((a: Address) => a.isDefault)
          if (def) {
            setFormData({
              firstname: def.firstname,
              lastname: def.lastname,
              email: '',
              phone: def.phone,
              street: def.street,
              city: def.city,
              region: def.region,
              postalCode: def.postalCode,
              country: def.country,
            })
          }
        }
      })
      .catch(() => {})
  }, [])

  const handleUseSavedAddress = (addr: Address) => {
    setFormData({
      firstname: addr.firstname,
      lastname: addr.lastname,
      email: formData.email,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      region: addr.region,
      postalCode: addr.postalCode,
      country: addr.country,
    })
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    const required = ['firstname', 'email', 'street', 'city', 'country'] as const
    for (const field of required) {
      if (!formData[field]) {
        toast.error('Por favor complete todos los campos requeridos')
        return
      }
    }

    if (method === 'mercadopago') {
      setLoading(true)
      try {
        const res = await fetch('/api/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              size: i.size,
            })),
            amount: getTotal() + SHIPPING_FEE,
            address: formData,
          }),
        })
        const data = await res.json()
        if (data.success) {
          setPreferenceId(data.preferenceId)
        } else {
          toast.error('Error al crear la preferencia de pago')
        }
      } catch {
        toast.error('Error al procesar el pago')
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            image: i.image,
          })),
          address: formData,
          paymentMethod: 'COD',
        }),
      })
      const result = await res.json()
      if (result.success) {
        clearCart()
        toast.success('¡Pedido realizado exitosamente!')
        router.push('/orders')
      } else {
        toast.error(result.message ?? 'Error al crear el pedido')
      }
    } catch {
      toast.error('Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'border border-gray-300 rounded px-3.5 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-200'

  const subtotal = getTotal()
  const total = subtotal + SHIPPING_FEE

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 py-8">
      {/* Shipping info */}
      <div className="flex-1 space-y-8">
        <h2 className="text-2xl font-medium">Información de Envío</h2>

        {/* Saved addresses */}
        {savedAddresses.length > 0 && (
          <div className="space-y-3">
            {savedAddresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => handleUseSavedAddress(addr)}
                className={`w-full p-4 text-left border rounded-lg transition-all ${
                  addr.isDefault
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">
                      Utilizar dirección: {addr.street}, {addr.city}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {addr.firstname} {addr.lastname}
                    </p>
                  </div>
                  {addr.isDefault && (
                    <span className="text-xs bg-black text-white px-2 py-1 rounded">
                      Predeterminada
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Address form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            onChange={onChange}
            name="firstname"
            value={formData.firstname}
            className={inputClass}
            type="text"
            placeholder="Nombre"
          />
          <input
            required
            onChange={onChange}
            name="lastname"
            value={formData.lastname}
            className={inputClass}
            type="text"
            placeholder="Apellido"
          />
          <input
            required
            onChange={onChange}
            name="email"
            value={formData.email}
            className={inputClass}
            type="email"
            placeholder="Correo Electrónico"
          />
          <input
            required
            onChange={onChange}
            name="street"
            value={formData.street}
            className={inputClass}
            type="text"
            placeholder="Dirección"
          />
          <div className="flex gap-3">
            <input
              required
              onChange={onChange}
              name="city"
              value={formData.city}
              className={inputClass}
              type="text"
              placeholder="Ciudad"
            />
            <input
              required
              onChange={onChange}
              name="region"
              value={formData.region}
              className={inputClass}
              type="text"
              placeholder="Región"
            />
          </div>
          <div className="flex gap-3">
            <input
              required
              onChange={onChange}
              name="postalCode"
              value={formData.postalCode}
              className={inputClass}
              type="text"
              placeholder="Código Postal"
            />
            <input
              required
              onChange={onChange}
              name="country"
              value={formData.country}
              className={inputClass}
              type="text"
              placeholder="País"
            />
          </div>
          <input
            required
            onChange={onChange}
            name="phone"
            value={formData.phone}
            className={inputClass}
            type="tel"
            placeholder="Teléfono"
          />
        </div>
      </div>

      {/* Summary + payment */}
      <div className="lg:w-[400px] space-y-8">
        {/* Cart total */}
        <div className="border rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-lg">Resumen del pedido</h2>
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
              <span className="truncate mr-2">
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toLocaleString('es-CL')}</span>
            </div>
          ))}
          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Envío</span>
              <span>${SHIPPING_FEE.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-1">
              <span>Total</span>
              <span>${total.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Método de Pago</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setMethod('mercadopago')}
              className={`w-full p-4 border rounded-lg flex items-center gap-4 transition-all ${
                method === 'mercadopago'
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
              <span className="text-sm font-medium">MercadoPago</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod('cod')}
              className={`w-full p-4 border rounded-lg flex items-center gap-4 transition-all ${
                method === 'cod'
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
              <span className="text-sm font-medium">Pago contra entrega</span>
            </button>
          </div>
        </div>

        {/* Action button */}
        {method === 'mercadopago' && preferenceId ? (
          <div className="p-4 bg-blue-50 rounded-lg text-center text-sm text-blue-700">
            Preferencia creada. ID: {preferenceId}
            <br />
            <span className="text-xs text-gray-500">
              Integra el componente Wallet de MercadoPago aquí.
            </span>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading
              ? 'Procesando...'
              : method === 'mercadopago'
                ? 'Continuar con MercadoPago'
                : 'Confirmar Pedido'}
          </button>
        )}
      </div>
    </form>
  )
}
