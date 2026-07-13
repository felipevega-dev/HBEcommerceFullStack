'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { Button, Input, Textarea } from '@/components/ui/design-system'

interface FormState {
  nombre: string
  email: string
  asunto: string
  mensaje: string
  website: string
}

const EMPTY_FORM: FormState = { nombre: '', email: '', asunto: '', mensaje: '', website: '' }

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
    if (form.mensaje.trim().length > 0 && form.mensaje.trim().length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres'
    }
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
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.message ?? 'No se pudo enviar el mensaje')
        return
      }

      toast.success('Mensaje enviado. Te responderemos pronto.')
      setForm(EMPTY_FORM)
      setErrors({})
    } catch {
      toast.error('No se pudo enviar el mensaje')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'ui-field w-full'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div>
        <label
          htmlFor="nombre"
          className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]"
        >
          Nombre
        </label>
        <Input
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
        <Input
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
        <Input
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
        <Textarea
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

      <Button type="submit" disabled={loading} className="w-full" loading={loading}>
        Enviar mensaje
      </Button>
    </form>
  )
}
