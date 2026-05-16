'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { BrandIcon, type BrandIconName } from '@/components/ui/brand-icon'
import { ABOUT_CONTENT_SETTING_KEY, type AboutContent } from '@/lib/about-content'

interface Props {
  initialContent: AboutContent
}

const ICON_OPTIONS: BrandIconName[] = [
  'handshake',
  'shirt',
  'check-circle',
  'star',
  'target',
  'ruler',
  'design',
  'sparkles',
  'heart',
  'leaf',
]

function Field({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  textarea?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      )}
    </label>
  )
}

export function AboutContentEditor({ initialContent }: Props) {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)

  const update = <K extends keyof AboutContent>(field: K, value: AboutContent[K]) => {
    setContent((current) => ({ ...current, [field]: value }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [ABOUT_CONTENT_SETTING_KEY]: JSON.stringify(content) }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message ?? 'No se pudo guardar Nosotros')
      }
      toast.success('Página Nosotros guardada')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contenido: Nosotros</h1>
          <p className="mt-1 text-sm text-gray-500">
            Edita los textos visibles de la página pública sin tocar código.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            <BrandIcon name="external-link" className="h-4 w-4" />
            Ver página
          </Link>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
          >
            <BrandIcon name={saving ? 'loader' : 'save'} className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Hero</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Breadcrumb"
            value={content.heroEyebrow}
            onChange={(value) => update('heroEyebrow', value)}
          />
          <Field
            label="Título"
            value={content.heroTitle}
            onChange={(value) => update('heroTitle', value)}
          />
          <div className="md:col-span-2">
            <Field
              label="Texto principal"
              value={content.heroText}
              onChange={(value) => update('heroText', value)}
              textarea
            />
          </div>
          <Field
            label="Botón principal"
            value={content.primaryCtaLabel}
            onChange={(value) => update('primaryCtaLabel', value)}
          />
          <Field
            label="Link principal"
            value={content.primaryCtaHref}
            onChange={(value) => update('primaryCtaHref', value)}
          />
          <Field
            label="Botón secundario"
            value={content.secondaryCtaLabel}
            onChange={(value) => update('secondaryCtaLabel', value)}
          />
          <Field
            label="Link secundario"
            value={content.secondaryCtaHref}
            onChange={(value) => update('secondaryCtaHref', value)}
          />
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nuestro enfoque</h2>
          <button
            type="button"
            onClick={() => update('standards', [...content.standards, 'Nuevo punto'])}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Agregar punto
          </button>
        </div>
        <Field
          label="Título del bloque"
          value={content.standardsTitle}
          onChange={(value) => update('standardsTitle', value)}
        />
        <div className="mt-4 space-y-3">
          {content.standards.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={item}
                onChange={(event) => {
                  const next = [...content.standards]
                  next[index] = event.target.value
                  update('standards', next)
                }}
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  update(
                    'standards',
                    content.standards.filter((_, i) => i !== index),
                  )
                }
                className="rounded-lg border px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Estadísticas</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {content.stats.map((stat, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_140px]">
                <Field
                  label="Valor"
                  value={stat.value}
                  onChange={(value) => {
                    const next = [...content.stats]
                    next[index] = { ...stat, value }
                    update('stats', next)
                  }}
                />
                <Field
                  label="Etiqueta"
                  value={stat.label}
                  onChange={(value) => {
                    const next = [...content.stats]
                    next[index] = { ...stat, label: value }
                    update('stats', next)
                  }}
                />
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Icono</span>
                  <select
                    value={stat.icon}
                    onChange={(event) => {
                      const next = [...content.stats]
                      next[index] = { ...stat, icon: event.target.value as BrandIconName }
                      update('stats', next)
                    }}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Historia</h2>
          <button
            type="button"
            onClick={() =>
              update('timeline', [
                ...content.timeline,
                { year: 'Nuevo', title: 'Título', text: 'Texto' },
              ])
            }
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Agregar hito
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Título historia"
            value={content.storyTitle}
            onChange={(value) => update('storyTitle', value)}
          />
          <Field
            label="Texto historia"
            value={content.storyText}
            onChange={(value) => update('storyText', value)}
            textarea
          />
        </div>
        <div className="mt-4 space-y-3">
          {content.timeline.map((item, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                <Field
                  label="Año"
                  value={item.year}
                  onChange={(value) => {
                    const next = [...content.timeline]
                    next[index] = { ...item, year: value }
                    update('timeline', next)
                  }}
                />
                <Field
                  label="Título"
                  value={item.title}
                  onChange={(value) => {
                    const next = [...content.timeline]
                    next[index] = { ...item, title: value }
                    update('timeline', next)
                  }}
                />
              </div>
              <div className="mt-3">
                <Field
                  label="Texto"
                  value={item.text}
                  onChange={(value) => {
                    const next = [...content.timeline]
                    next[index] = { ...item, text: value }
                    update('timeline', next)
                  }}
                  textarea
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Principios</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Título"
            value={content.valuesTitle}
            onChange={(value) => update('valuesTitle', value)}
          />
          <Field
            label="Texto"
            value={content.valuesText}
            onChange={(value) => update('valuesText', value)}
            textarea
          />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {content.values.map((valueItem, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="grid gap-3">
                <Field
                  label="Título"
                  value={valueItem.title}
                  onChange={(value) => {
                    const next = [...content.values]
                    next[index] = { ...valueItem, title: value }
                    update('values', next)
                  }}
                />
                <Field
                  label="Descripción"
                  value={valueItem.description}
                  onChange={(value) => {
                    const next = [...content.values]
                    next[index] = { ...valueItem, description: value }
                    update('values', next)
                  }}
                  textarea
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Cierre</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Título"
            value={content.closingTitle}
            onChange={(value) => update('closingTitle', value)}
          />
          <Field
            label="Texto"
            value={content.closingText}
            onChange={(value) => update('closingText', value)}
            textarea
          />
          <Field
            label="Botón"
            value={content.closingCtaLabel}
            onChange={(value) => update('closingCtaLabel', value)}
          />
          <Field
            label="Link"
            value={content.closingCtaHref}
            onChange={(value) => update('closingCtaHref', value)}
          />
        </div>
      </section>
    </div>
  )
}
