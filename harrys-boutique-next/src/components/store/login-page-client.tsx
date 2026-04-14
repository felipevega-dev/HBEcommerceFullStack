'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

type Mode = 'login' | 'register'

interface Errors {
  name?: string
  email?: string
  password?: string
}

export function LoginPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const newErrors: Errors = {}
    if (mode === 'register' && !name.trim()) newErrors.name = 'El nombre es requerido'
    if (!email.trim()) newErrors.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email invalido'
    if (!password) newErrors.password = 'La contrasena es requerida'
    else if (mode === 'register' && password.length < 8)
      newErrors.password = 'La contrasena debe tener al menos 8 caracteres'
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
          body: JSON.stringify({ name, email, password }),
        })
        const data = await res.json()
        if (!data.success) {
          toast.error(data.message ?? 'Error al registrarse')
          setLoading(false)
          return
        }
        toast.success('Cuenta creada exitosamente')
      }

      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        toast.error('Credenciales invalidas. Verifica tu email y contrasena.')
      } else {
        toast.success(mode === 'register' ? 'Bienvenido/a!' : 'Sesion iniciada')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      toast.error('Error de conexion. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setErrors({})
    setName('')
    setEmail('')
    setPassword('')
  }

  const inputBase =
    'w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm'

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--color-background)] p-8 rounded-xl shadow-lg border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-2 text-[var(--color-text-primary)]">
            {mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm">
            {mode === 'login'
              ? 'Ingresa a tu cuenta para continuar'
              : 'Crea una cuenta para comenzar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputBase} ${errors.name ? 'border-red-400 focus:ring-red-200' : 'border-[var(--color-border)] focus:ring-[var(--color-accent)]'}`}
                placeholder="Tu nombre"
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputBase} ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-[var(--color-border)] focus:ring-[var(--color-accent)]'}`}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              Contrasena
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputBase} pr-10 ${errors.password ? 'border-red-400 focus:ring-red-200' : 'border-[var(--color-border)] focus:ring-[var(--color-accent)]'}`}
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            {mode === 'register' && (
              <p className="text-[var(--color-text-muted)] text-xs mt-1">
                Minimo 8 caracteres, una mayuscula y un numero
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] text-white py-2.5 px-4 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Procesando...
                </>
              ) : mode === 'register' ? (
                'Crear cuenta'
              ) : (
                'Iniciar sesion'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={switchMode}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm transition-colors"
              >
                {mode === 'login'
                  ? 'No tenes cuenta? Registrate'
                  : 'Ya tenes cuenta? Inicia sesion'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
