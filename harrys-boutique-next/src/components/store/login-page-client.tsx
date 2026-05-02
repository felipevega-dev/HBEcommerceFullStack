'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { BrandIcon } from '@/components/ui/brand-icon'

type Mode = 'login' | 'register'

interface Errors {
  name?: string
  email?: string
  password?: string
}

const passwordRules = [
  { label: '8 caracteres', test: (value: string) => value.length >= 8 },
  { label: 'Una mayúscula', test: (value: string) => /[A-ZÁÉÍÓÚÑ]/.test(value) },
  { label: 'Un número', test: (value: string) => /\d/.test(value) },
]

export function LoginPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const isCheckoutFlow = callbackUrl.includes('checkout') || callbackUrl.includes('cart')

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const isPasswordStrong = passwordRules.every((rule) => rule.test(password))

  const validate = (): boolean => {
    const newErrors: Errors = {}

    if (mode === 'register' && !name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Ingresa un email válido'
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (mode === 'register' && !isPasswordStrong) {
      newErrors.password = 'La contraseña debe cumplir los requisitos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        })
        const data = await res.json()

        if (!data.success) {
          toast.error(data.message ?? 'No pudimos crear la cuenta')
          setLoading(false)
          return
        }

        toast.success('Cuenta creada. Iniciando sesión...')
      }

      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Credenciales inválidas. Revisa tu email y contraseña.')
        return
      }

      setRedirecting(true)
      toast.success(mode === 'register' ? 'Bienvenido/a a Harry’s Boutique' : 'Sesión iniciada')
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    setErrors({})
    setName('')
    setEmail('')
    setPassword('')
    setShowPassword(false)
  }

  const handlePasswordReset = async () => {
    const normalizedEmail = email.trim()

    if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setErrors((current) => ({ ...current, email: 'Ingresa tu email para recuperar la cuenta' }))
      toast.info('Primero ingresa el email de tu cuenta.')
      return
    }

    setResetLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      const data = await res.json()
      toast.success(data.message ?? 'Si existe una cuenta, enviaremos instrucciones por email.')
    } catch {
      toast.error('No pudimos iniciar la recuperación. Intenta de nuevo.')
    } finally {
      setResetLoading(false)
    }
  }

  const inputBase =
    'w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition-all focus:ring-2'

  return (
    <div className="min-h-[calc(100vh-200px)] px-4 py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden bg-[var(--color-surface)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent)]">
              Harry&apos;s Boutique
            </p>
            <h1
              className="mt-4 max-w-sm text-4xl font-medium leading-tight text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tu cuenta, compras y favoritos en un solo lugar.
            </h1>
          </div>

          <div className="space-y-4 text-sm text-[var(--color-text-secondary)]">
            <div className="flex items-start gap-3">
              <BrandIcon name="shopping-bag" className="mt-0.5 h-5 w-5 text-[var(--color-accent)]" />
              <p>Continúa compras pendientes y revisa el historial de pedidos.</p>
            </div>
            <div className="flex items-start gap-3">
              <BrandIcon name="heart" className="mt-0.5 h-5 w-5 text-[var(--color-accent)]" />
              <p>Guarda favoritos para encontrar rápido las prendas de tu mascota.</p>
            </div>
            <div className="flex items-start gap-3">
              <BrandIcon name="shipping" className="mt-0.5 h-5 w-5 text-[var(--color-accent)]" />
              <p>Agiliza el checkout con tus datos listos para la próxima compra.</p>
            </div>
          </div>
        </aside>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mb-7 text-center">
            <h2
              className="text-3xl font-medium text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {isCheckoutFlow
                ? 'Ingresa para continuar con tu compra.'
                : mode === 'login'
                  ? 'Ingresa a tu cuenta para continuar.'
                  : 'Crea una cuenta para comprar más rápido.'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-lg bg-[var(--color-surface)] p-1">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchMode(tab)}
                className={`rounded-md px-4 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30 ${
                  mode === tab
                    ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${inputBase} ${
                    errors.name
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]/20'
                  }`}
                  placeholder="Tu nombre"
                  autoComplete="name"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputBase} ${
                  errors.email
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]/20'
                }`}
                placeholder="tu@email.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                  Contraseña
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={resetLoading}
                    className="text-xs font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-dark)]"
                  >
                    {resetLoading ? 'Enviando...' : 'Olvidé mi contraseña'}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pr-11 ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]/20'
                  }`}
                  placeholder="Ingresa tu contraseña"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <BrandIcon name="eye" className="h-5 w-5" strokeWidth={1.8} />
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}

              {mode === 'register' && (
                <div className="grid gap-2 pt-1 sm:grid-cols-3">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(password)
                    return (
                      <div
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-xs ${
                          passed ? 'text-green-700' : 'text-[var(--color-text-muted)]'
                        }`}
                      >
                        <BrandIcon
                          name={passed ? 'check-circle' : 'circle'}
                          className="h-3.5 w-3.5"
                        />
                        {rule.label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={loading || redirecting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading || redirecting ? (
                  <>
                    <BrandIcon name="loader" className="h-4 w-4 animate-spin" />
                    {redirecting ? 'Redirigiendo...' : 'Procesando...'}
                  </>
                ) : mode === 'register' ? (
                  'Crear cuenta'
                ) : (
                  'Iniciar sesión'
                )}
              </button>

              <p className="text-center text-xs leading-5 text-[var(--color-text-muted)]">
                Al continuar, aceptas acceder a tu cuenta de Harry&apos;s Boutique para gestionar
                compras, favoritos y pedidos.
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
