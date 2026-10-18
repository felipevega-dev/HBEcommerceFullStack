'use client'

import { getCartLineKey, useCartStore } from '@/store/cart-store'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  DEFAULT_PRICING_SETTINGS,
  calculateShippingForSubtotal,
  type PricingSettings,
} from '@/lib/checkout'
import {
  getCheckoutAddressErrors,
  getFirstInvalidAddressField,
  type CheckoutAddressField,
} from '@/lib/validations/checkout-address'
import { AddressForm } from './address-form'
import { Check, Loader2, Lock, RotateCcw, Truck } from 'lucide-react'

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

const EMPTY_FORM: FormData = {
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

export function CheckoutPageClient({
  pricingSettings = DEFAULT_PRICING_SETTINGS,
}: {
  pricingSettings?: PricingSettings
}) {
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
  const [formErrors, setFormErrors] = useState<Partial<Record<CheckoutAddressField, string>>>({})
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Show payment result feedback from MP redirect
  useEffect(() => {
    if (paymentStatus === 'failure') {
      toast.error('El pago fue rechazado. Puedes intentarlo de nuevo.')
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
          }),
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

    // Re-check only the fields that are already flagged, so errors clear as the customer fixes them.
    const flagged = (Object.keys(updates) as CheckoutAddressField[]).filter(
      (field) => formErrors[field],
    )
    if (flagged.length === 0) return

    const fresh = getCheckoutAddressErrors({ ...formData, ...updates })
    setFormErrors((current) => {
      const next = { ...current }
      for (const field of flagged) {
        if (fresh[field]) next[field] = fresh[field]
        else delete next[field]
      }
      return next
    })
  }

  const validate = (): boolean => {
    const errors = getCheckoutAddressErrors(formData)
    setFormErrors(errors)

    const firstInvalid = getFirstInvalidAddressField(errors)
    if (!firstInvalid) return true

    // A saved address can be incomplete (older records): show the form so it can be fixed.
    if (!showNewAddressForm && savedAddresses.length > 0) setShowNewAddressForm(true)

    toast.error(errors[firstInvalid] ?? 'Revisa los datos de envío')
    requestAnimationFrame(() => document.getElementById(`checkout-${firstInvalid}`)?.focus())
    return false
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
        toast.error(
          orderData.message ??
            (orderData.errors
              ? 'Revisa los datos de envío e intenta nuevamente.'
              : 'No pudimos crear el pedido. Intenta nuevamente.'),
        )
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
        toast.error(
          prefData.message ?? 'No pudimos iniciar el pago con MercadoPago. Intenta nuevamente.',
        )
        return
      }

      setMpInitUrl(prefData.initPoint ?? null)

      // Redirect to MercadoPago checkout
      if (prefData.initPoint) {
        window.location.href = prefData.initPoint
      } else {
        toast.error('MercadoPago no entregó el enlace de pago. Intenta nuevamente.')
      }
    } catch {
      toast.error('No pudimos conectar con la tienda. Revisa tu conexión e intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = getTotal()
  const shippingFee = calculateShippingForSubtotal(subtotal, pricingSettings)
  const total = subtotal + shippingFee
  const amountForFreeShipping =
    shippingFee > 0 && pricingSettings.freeShippingThreshold > 0
      ? Math.max(0, pricingSettings.freeShippingThreshold - subtotal)
      : 0

  // Empty cart state
  if (items.length === 0 && !loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-[var(--color-text-secondary)] text-lg">Tu carrito está vacío.</p>
        <Link href="/tienda" className="ui-button ui-button-primary">
          Ver colección
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8">
      <p className="ui-eyebrow">Compra directa</p>
      <h1 className="ui-display mb-8 mt-3 text-3xl sm:text-4xl">Finalizar compra</h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        {/* Left: Shipping info */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-medium text-[var(--color-text-primary)]">Datos de envío</h2>

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
              <div className="space-y-2" role="radiogroup" aria-label="Direcciones guardadas">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleUseSavedAddress(addr)}
                    role="radio"
                    aria-checked={selectedAddressId === addr.id}
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
                        <Check
                          aria-hidden="true"
                          className="h-5 w-5 flex-shrink-0 text-[var(--color-accent)]"
                        />
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
                errors={formErrors}
                idPrefix="checkout"
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
            <ul className="max-h-72 space-y-3 overflow-y-auto overscroll-contain pr-1">
              {items.map((item) => (
                <li key={getCartLineKey(item)} className="flex items-center gap-3 text-sm">
                  <div className="relative h-14 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-2)]">
                    {item.image ? (
                      <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--color-text-primary)]">
                      {item.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {[
                        item.size && `Talla ${item.size}`,
                        item.color,
                        `${item.quantity} ${item.quantity === 1 ? 'unidad' : 'unidades'}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <span className="flex-shrink-0 font-medium tabular-nums text-[var(--color-text-primary)]">
                    ${(item.price * item.quantity).toLocaleString('es-CL')}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[var(--color-border)] pt-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                <span>${subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">Envío</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-[var(--color-success)] font-medium">Gratis</span>
                  ) : (
                    `$${shippingFee.toLocaleString('es-CL')}`
                  )}
                </span>
              </div>
              {amountForFreeShipping > 0 && (
                <p className="rounded-lg bg-[var(--color-surface-2)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
                  Agrega ${amountForFreeShipping.toLocaleString('es-CL')} más y el envío es gratis.
                </p>
              )}
              <div className="flex justify-between font-semibold text-lg pt-1 border-t border-[var(--color-border)]">
                <span>Total</span>
                <span>${total.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-3">
            <h3
              id="checkout-payment-method"
              className="text-base font-medium text-[var(--color-text-primary)]"
            >
              Método de pago
            </h3>
            <div className="space-y-2" role="radiogroup" aria-labelledby="checkout-payment-method">
              <button
                type="button"
                role="radio"
                aria-checked={method === 'mercadopago'}
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
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    MercadoPago
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Tarjeta, transferencia o efectivo
                  </p>
                </div>
                {method === 'mercadopago' && (
                  <Check
                    aria-hidden="true"
                    className="ml-auto h-4 w-4 text-[var(--color-accent)]"
                  />
                )}
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={method === 'cod'}
                onClick={() => setMethod('cod')}
                className={`w-full p-4 border rounded-xl flex items-center gap-3 transition-all text-left ${
                  method === 'cod'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface)]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-[var(--color-text-secondary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    Pago contra entrega
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Pagas al recibir tu pedido
                  </p>
                </div>
                {method === 'cod' && (
                  <Check
                    aria-hidden="true"
                    className="ml-auto h-4 w-4 text-[var(--color-accent)]"
                  />
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
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : method === 'mercadopago' ? (
              'Pagar con MercadoPago'
            ) : (
              'Confirmar pedido'
            )}
          </button>

          <p className="text-xs text-center text-[var(--color-text-muted)]">
            Al confirmar aceptas nuestra{' '}
            <Link href="/devoluciones" className="underline hover:text-[var(--color-text-primary)]">
              política de cambios y devoluciones
            </Link>
            .
          </p>

          <ul className="space-y-2.5 border-t border-[var(--color-border)] pt-5 text-xs leading-5 text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-2.5">
              <Lock
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent)]"
              />
              {method === 'mercadopago'
                ? 'El pago se completa en MercadoPago. No guardamos los datos de tu tarjeta.'
                : 'Pagas al recibir tu pedido. Te contactaremos para coordinar la entrega.'}
            </li>
            {pricingSettings.freeShippingThreshold > 0 && (
              <li className="flex items-start gap-2.5">
                <Truck
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent)]"
                />
                Envío gratis en compras desde $
                {pricingSettings.freeShippingThreshold.toLocaleString('es-CL')}.
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <RotateCcw
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent)]"
              />
              10 días de retracto en productos estándar.
            </li>
          </ul>
        </div>
      </form>
    </div>
  )
}
