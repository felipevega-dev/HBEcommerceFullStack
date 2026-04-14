'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface Errors {
  name?: string
  email?: string
  password?: string
}

export function LoginPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  const [mode, setMode] = useState<'Login' | 'Sign Up'>('Login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const newErrors: Errors = {}
    if (mode === 'Sign Up' && !name.trim()) newErrors.name = 'El nombre es requerido'
    if (!email.trim()) newErrors.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido'
    if (!password) newErrors.password = 'La contraseña es requerida'
    else if (mode === 'Sign Up' && password.length < 8)
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      if (mode === 'Sign Up') {
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
        toast.error('Credenciales inválidas')
      } else {
        toast.success(mode === 'Sign Up' ? 'Bienvenido/a!' : 'Inicio de sesión exitoso')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      toast.error('Algo salió mal')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode((m) => (m === 'Login' ? 'Sign Up' : 'Login'))
    setErrors({})
    setName('')
    setEmail('')
    setPassword('')
  }

  const inputBase =
    'w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm'

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-2">{mode}</h2>
          <p className="text-gray-600 text-sm">
            {mode === 'Login'
              ? 'Ingresa a tu cuenta para continuar'
              : 'Crea una cuenta para comenzar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field (Sign Up only) */}
          {mode === 'Sign Up' && (
            <div className="space-y-1">
              <label className="block text-gray-700 text-sm font-medium">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputBase} ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black/10'}`}
                placeholder="Tu nombre"
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-gray-700 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputBase} ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black/10'}`}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-gray-700 text-sm font-medium">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputBase} pr-10 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black/10'}`}
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            {mode === 'Sign Up' && (
              <p className="text-gray-500 text-xs mt-1">
                La contraseña debe tener al menos 8 caracteres
              </p>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Procesando...
                </span>
              ) : mode === 'Sign Up' ? (
                'Registrarse'
              ) : (
                'Iniciar sesión'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={switchMode}
                className="text-gray-600 hover:text-black text-sm"
              >
                {mode === 'Login'
                  ? '¿No tienes cuenta? Regístrate'
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
