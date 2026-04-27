'use client'

import { useCartStore } from '@/store/cart-store'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AddressForm } from './address-form'
import { CheckoutProgress } from './checkout-progress'
import { TrustBadges } from './trust-badges'
import { ShieldCheck, Truck, CreditCard, Lock, Check } from 'lucide-react'

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

const EMPTY_FORM: FormData = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  region: '',
  postalCode: '',
  country: 'Argentina',
}

export function CheckoutPageClient() {
  const { items, getTotal, clearCart } = useCartStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentStatus = searchParams.get('payment')

  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<'cod' | 'mercadopago'>('mercadopago')
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [saveAddress, setSaveAddress] = useState(true)
  const [mpInitUrl, setMpInitUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [userEmail, setUserEmail] = useState('')
  const [currentStep, setCurrentStep] = useState(1) // 1: Dirección, 2: Pago, 3: Confirmación
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Show payment result feedback from MP redirect
  useEffect(() => {
    if (paymentStatus === 'failure') {
      toast.error('El pago fue rechazado. Podés intentarlo de nuevo.')
    } else if (paymentStatus === 'pending') {
      toast.info('Tu pago está pendiente de confirmación.')
    }
  }, [paymentStatus])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('checkout-progress')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        const timestamp = data.timestamp || 0
        const hoursSince = (Date.now() - timestamp) / (1000 * 60 * 60)
        
        // Only restore if less than 24 hours old
        if (hoursSince < 24 && data.formData && !selectedAddressId) {
          setFormData(data.formData)
          setMethod(data.method || 'mercadopago')
          toast.info('Recuperamos tu progreso anterior', { autoClose: 2000 })
        } else if (hoursSince >= 24) {
          localStorage.removeItem('checkout-progress')
        }
      } catch (e) {
        localStorage.removeItem('checkout-progress')
      }
    }
  }, [selectedAddressId])

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (formData.firstname || formData.email || formData.street) {
        localStorage.setItem(
          'checkout-progress',
          JSON.stringify({
            formData,
            method,
            timestamp: Date.now(),
          })
        )
      }
    }, 1000) // Save 1 second after user stops typing

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [formData, method])

  // Load user email and saved addresses
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortControllerRef.current = new AbortController()

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile', {
          signal: abortControllerRef.current?.signal,
        })
        const data = await res.json()
        if (data.success && data.user?.email) {
          setUserEmail(data.user.email)
          setFormData((prev) => ({ ...prev, email: data.user.email }))
        }
      } catch {}

      try {
        const res = await fetch('/api/user/addresses', {
          signal: abortControllerRef.current?.signal,
        })
        const data = await res.json()
        if (data.success && data.addresses?.length) {
          setSavedAddresses(data.addresses)
          const def = data.addresses.find((a: Address) => a.isDefault) ?? data.addresses[0]
          if (def) {
            setSelectedAddressId(def.id)
            setFormData((prev) => ({
              ...prev,
              firstname: def.firstname,
              lastname: def.lastname,
              phone: def.phone,
              street: def.street,
              city: def.city,
              region: def.region,
              postalCode: def.postalCode,
              country: def.country,
            }))
          }
        } else {
          setShowNewAddressForm(true)
        }
      } catch {
        setShowNewAddressForm(true)
      }
    }

    fetchProfile()

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const handleUseSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id)
    setShowNewAddressForm(false)
    setFormData((prev) => ({
      ...prev,
      firstname: addr.firstname,
      lastname: addr.lastname,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      region: addr.region,
      postalCode: addr.postalCode,
      country: addr.country,
    }))
  }

  const handleUseNewAddress = () => {
    setSelectedAddressId(null)
    setShowNewAddressForm(true)
    setFormData((prev) => ({
      ...EMPTY_FORM,
      email: prev.email || userEmail,
    }))
  }

  const onChange = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    
    // Real-time validation
    const newErrors = { ...formErrors }
    Object.keys(updates).forEach((key) => {
      const field = key as keyof FormData
      const value = updates[field]
      
      if (value && typeof value === 'string') {
        // Clear error if field is filled
        if (value.trim()) {
          delete newErrors[field]
        }
        
        // Email validation
        if (field === 'email' && value.trim()) {
          if (!/\S+@\S+\.\S+/.test(value)) {
            newErrors.email = 'Email inválido'
          } else {
            delete newErrors.email
          }
        }
        
        // Phone validation (basic)
        if (field === 'phone' && value.trim()) {
          if (value.length < 8) {
            newErrors.phone = 'Teléfono muy corto'
          } else {
            delete newErrors.phone
          }
        }
      }
    })
    
    setFormErrors(newErrors)
  }

  const validate = (): boolean => {
    const required: (keyof FormData)[] = ['firstname', 'email', 'phone', 'street', 'city', 'country']
    for (const field of required) {
      if (!formData[field].trim()) {
        toast.error(`El campo "${field}" es requerido`)
        return false
      }
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('El email no es válido')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('Tu carrito está vacío')
      return
    }
    if (!validate()) return

    setLoading(true)
    try {
      // Save address if checkbox is checked and it's a new address
      if (saveAddress && !selectedAddressId && savedAddresses.length < 2) {
        try {
          const addressRes = await fetch('/api/user/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstname: formData.firstname,
              lastname: formData.lastname,
              phone: formData.phone,
              street: formData.street,
              city: formData.city,
              region: formData.region,
              postalCode: formData.postalCode,
              country: formData.country,
              isDefault: savedAddresses.length === 0,
            }),
          })
          const addressData = await addressRes.json()
          if (addressData.success) {
            setSavedAddresses((prev) => [...prev, addressData.address])
          }
        } catch {
          // Non-blocking error, continue with order
        }
      }

      // Step 1: Always create the order first
      const orderRes = await fetch('/api/orders', {
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
          paymentMethod: method === 'mercadopago' ? 'mercadopago' : 'COD',
        }),
      })
      const orderData = await orderRes.json()

      if (!orderData.success) {
        toast.error(orderData.message ?? 'Error al crear el pedido')
        return
      }

      const orderId: string = orderData.order.id

      // Step 2a: COD — done
      if (method === 'cod') {
        clearCart()
        localStorage.removeItem('checkout-progress') // Clear saved progress
        toast.success('¡Pedido realizado! Te contactaremos para coordinar la entrega.')
        router.push('/orders')
        return
      }

      // Step 2b: MercadoPago — create preference with orderId as external_reference
      const prefRes = await fetch('/api/mercadopago/create-preference', {
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
          orderId,
          address: {
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            street: formData.street,
            city: formData.city,
            country: formData.country,
          },
        }),
      })
      const prefData = await prefRes.json()

      if (!prefData.success) {
        toast.error('Error al iniciar el pago con MercadoPago')
        return
      }

      // Clear cart optimistically and redirect to MP
      clearCart()
      localStorage.removeItem('checkout-progress') // Clear saved progress
      setMpInitUrl(prefData.initPoint ?? null)

      // Redirect to MercadoPago checkout
      if (prefData.initPoint) {
        window.location.href = prefData.initPoint
      } else {
        toast.error('No se pudo obtener el link de pago')
      }
    } catch {
      toast.error('Error de conexión. Por favor intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'border border-[var(--color-border)] rounded-lg px-3.5 py-2.5 w-full text-sm bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-muted)]'

  const subtotal = getTotal()
  const total = subtotal + SHIPPING_FEE

  // Empty cart state
  if (items.length === 0 && !loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-[var(--color-text-secondary)] text-lg">Tu carrito está vacío.</p>
        <Link
          href="/collection"
          className="inline-block px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Ver colección
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8">
      {/* Progress Indicator */}
      <CheckoutProgress currentStep={currentStep} />

      {/* Trust Badges */}
      <TrustBadges />

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        {/* Left: Shipping info */}
        <div className="flex-1 space-y-6">
        <h2 className="text-2xl font-medium text-[var(--color-text-primary)]">
          Información de Envío
        </h2>

        {/* Saved addresses */}
        {savedAddresses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Mis direcciones guardadas
              </p>
              <Link
                href="/profile"
                className="text-xs text-[var(--color-accent)] hover:underline"
              >
                Gestionar direcciones
              </Link>
            </div>
            <div className="space-y-2">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleUseSavedAddress(addr)}
                  className={`w-full p-4 text-left border rounded-lg transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] ring-2 ring-[var(--color-accent)] ring-opacity-20'
                      : 'border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[var(--color-text-primary)]">
                        {addr.firstname} {addr.lastname}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        {addr.street}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {addr.city}, {addr.region} {addr.postalCode}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{addr.phone}</p>
                    </div>
                    {selectedAddressId === addr.id && (
                      <svg
                        className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  {addr.isDefault && (
                    <span className="text-xs bg-[var(--color-success-light)] text-[var(--color-success-dark)] px-2 py-0.5 rounded-full mt-2 inline-block">
                      Predeterminada
                    </span>
                  )}
                </button>
              ))}
              {savedAddresses.length < 2 && (
                <button
                  type="button"
                  onClick={handleUseNewAddress}
                  className={`w-full p-4 text-left border-2 border-dashed rounded-lg transition-all ${
                    showNewAddressForm
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-[var(--color-accent)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        Usar nueva dirección
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Agregar una dirección diferente
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Address form */}
        {(showNewAddressForm || savedAddresses.length === 0) && (
          <div className="space-y-4">
            {savedAddresses.length > 0 && (
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <h3 className="text-base font-medium text-[var(--color-text-primary)]">
                  Nueva dirección de envío
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewAddressForm(false)
                    if (savedAddresses.length > 0) {
                      handleUseSavedAddress(savedAddresses[0])
                    }
                  }}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  Cancelar
                </button>
              </div>
            )}

            <AddressForm
              formData={formData}
              onChange={onChange}
              showEmail={true}
              emailReadOnly={!!userEmail}
            />

            {/* Save address checkbox */}
            {!selectedAddressId && savedAddresses.length < 2 && (
              <div className="flex items-start gap-2 p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                <input
                  type="checkbox"
                  id="saveAddress"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[var(--color-accent)] border-gray-300 rounded focus:ring-[var(--color-accent)]"
                />
                <label
                  htmlFor="saveAddress"
                  className="text-sm text-[var(--color-text-secondary)] cursor-pointer"
                >
                  Guardar esta dirección en mi perfil para futuras compras
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Summary + payment */}
      <div className="lg:w-[400px] space-y-6">
        {/* Order summary */}
        <div className="border border-[var(--color-border)] rounded-xl p-6 space-y-3 bg-[var(--color-surface)]">
          <h2 className="font-semibold text-lg text-[var(--color-text-primary)]">
            Resumen del pedido
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                <span className="truncate mr-2 text-[var(--color-text-secondary)]">
                  {item.name} × {item.quantity}
                  {item.size && <span className="text-[var(--color-text-muted)]"> ({item.size})</span>}
                </span>
                <span className="font-medium text-[var(--color-text-primary)] flex-shrink-0">
                  ${(item.price * item.quantity).toLocaleString('es-CL')}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--color-border)] pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Subtotal</span>
              <span>${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Envío</span>
              <span>
                {subtotal >= 50000 ? (
                  <span className="text-[var(--color-success)] font-medium">Gratis</span>
                ) : (
                  `$${SHIPPING_FEE.toLocaleString('es-CL')}`
                )}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-1 border-t border-[var(--color-border)]">
              <span>Total</span>
              <span>${(subtotal >= 50000 ? subtotal : total).toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-3">
          <h3 className="text-base font-medium text-[var(--color-text-primary)]">
            Método de Pago
          </h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setMethod('mercadopago')}
              className={`w-full p-4 border rounded-xl flex items-center gap-3 transition-all text-left ${
                method === 'mercadopago'
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface)]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#009ee3] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">MP</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">MercadoPago</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Tarjeta, transferencia o efectivo
                </p>
              </div>
              {method === 'mercadopago' && (
                <svg className="w-4 h-4 text-[var(--color-accent)] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMethod('cod')}
              className={`w-full p-4 border rounded-xl flex items-center gap-3 transition-all text-left ${
                method === 'cod'
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface)]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Pago contra entrega
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Pagás al recibir el pedido</p>
              </div>
              {method === 'cod' && (
                <svg className="w-4 h-4 text-[var(--color-accent)] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando...
            </>
          ) : method === 'mercadopago' ? (
            'Pagar con MercadoPago'
          ) : (
            'Confirmar Pedido'
          )}
        </button>

        <p className="text-xs text-center text-[var(--color-text-muted)]">
          Al confirmar aceptás nuestros{' '}
          <Link href="/devoluciones" className="underline hover:text-[var(--color-text-primary)]">
            términos de devolución
          </Link>
        </p>
      </div>
    </form>

    {/* Security footer */}
    <div className="mt-8 text-center">
      <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
        <Lock className="w-4 h-4" />
        <span>Conexión segura SSL • Tus datos están protegidos</span>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4">
        <img src="/visa.svg" alt="Visa" className="h-6 opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
        <img src="/mastercard.svg" alt="Mastercard" className="h-6 opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
        <span className="text-xs text-[var(--color-text-muted)]">MercadoPago</span>
      </div>
    </div>
  </div>
  )
}
