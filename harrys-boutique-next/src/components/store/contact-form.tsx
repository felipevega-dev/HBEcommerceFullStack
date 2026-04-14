'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'

interface FormState {
  nombre: string
  email: string
  asunto: string
  mensaje: string
}

const EMPTY_FORM: FormState = { nombre: '', email: '', asunto: '', mensaje: '' }

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const newErrors: Partial<FormState> = {}
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!form.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!isValidEmail(form.email)) {
      newErrors.email = 'Ingresa un email válido'
    }
    if (!form.asunto.trim()) newErrors.asunto = 'El asunto es requerido'
    if (!form.mensaje.trim()) newErrors.mensaje = 'El mensaje es requerido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
    toast.success('¡Mensaje enviado! Te responderemos pronto.')
    setForm(EMPTY_FORM)
    setErrors({})
  }

  const inputClass =
    'w-full px-3 py-2.5 text-sm border rounded-lg bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <label
          htmlFor="nombre"
          className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]"
        >
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Tu nombre"
          className={`${inputClass} ${errors.nombre ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'}`}
        />
        {errors.nombre && <p className="text-xs mt-1 text-[var(--color-error)]">{errors.nombre}</p>}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          className={`${inputClass} ${errors.email ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'}`}
        />
        {errors.email && <p className="text-xs mt-1 text-[var(--color-error)]">{errors.email}</p>}
      </div>

      <div>
        <label
          htmlFor="asunto"
          className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]"
        >
          Asunto
        </label>
        <input
          id="asunto"
          name="asunto"
          type="text"
          value={form.asunto}
          onChange={handleChange}
          placeholder="¿En qué podemos ayudarte?"
          className={`${inputClass} ${errors.asunto ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'}`}
        />
        {errors.asunto && <p className="text-xs mt-1 text-[var(--color-error)]">{errors.asunto}</p>}
      </div>

      <div>
        <label
          htmlFor="mensaje"
          className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]"
        >
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={5}
          value={form.mensaje}
          onChange={handleChange}
          placeholder="Escribe tu mensaje aquí..."
          className={`${inputClass} resize-vertical ${errors.mensaje ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'}`}
        />
        {errors.mensaje && (
          <p className="text-xs mt-1 text-[var(--color-error)]">{errors.mensaje}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-60"
      >
        {loading ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  )
}
