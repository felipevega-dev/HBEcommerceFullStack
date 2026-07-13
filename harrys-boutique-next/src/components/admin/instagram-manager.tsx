'use client'

import { useRef, useState } from 'react'
import type {
  InstagramAutomationSettings,
  InstagramPost,
  InstagramPostAttempt,
  Product,
} from '@prisma/client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

type PostWithRelations = InstagramPost & {
  product: Pick<Product, 'id' | 'name'> | null
  attempts: InstagramPostAttempt[]
}

type Props = {
  settings: InstagramAutomationSettings
  posts: PostWithRelations[]
  eligibleProducts: number
}

type EditablePostForm = {
  title: string
  imageUrl: string
  sourceDescription: string
  captionDraft: string
  finalCaption: string
  scheduledFor: string
}

export function InstagramManager({ settings, posts, eligibleProducts }: Props) {
  const router = useRouter()
  const manualFileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    enabled: settings.enabled,
    timezone: settings.timezone,
    dailyHour: settings.dailyHour,
    dailyMinute: settings.dailyMinute,
    sourceType: settings.sourceType,
    captionTemplate: settings.captionTemplate,
    fallbackHashtags: settings.fallbackHashtags,
    maxDailyPosts: settings.maxDailyPosts,
    requireManualApproval: settings.requireManualApproval,
  })
  const [manualForm, setManualForm] = useState({
    title: '',
    sourceDescription: '',
    captionDraft: '',
    instagramUrl: '',
    altText: '',
    homeCaption: '',
    likes: '',
    homeVisible: true,
    homeOrder: 0,
    imageUrl: '',
    scheduledFor: defaultScheduledForValue(),
  })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [creatingManual, setCreatingManual] = useState(false)
  const [uploadingManualImage, setUploadingManualImage] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditablePostForm | null>(null)

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/instagram/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Configuración de Instagram guardada')
        router.refresh()
      } else {
        toast.error(data.message ?? 'No fue posible guardar la configuración')
      }
    } catch {
      toast.error('Error al guardar configuración de Instagram')
    } finally {
      setSaving(false)
    }
  }

  const generateDrafts = async () => {
    setGenerating(true)

    try {
      const response = await fetch('/api/instagram/posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: form.maxDailyPosts }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success(data.created > 0 ? `${data.created} borrador(es) generados` : data.message)
        router.refresh()
      } else {
        toast.error(data.message ?? 'No fue posible generar borradores')
      }
    } catch {
      toast.error('Error al generar borradores')
    } finally {
      setGenerating(false)
    }
  }

  const testConnection = async () => {
    setTestingConnection(true)

    try {
      const response = await fetch('/api/instagram/test', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        const username = data.account?.username ? `@${data.account.username}` : 'sin username'
        const accountType = data.account?.accountType ? ` (${data.account.accountType})` : ''
        toast.success(`Conexión OK con ${username}${accountType}`)
      } else {
        toast.error(data.message ?? 'No fue posible validar la conexión')
      }
    } catch {
      toast.error('Error al probar la conexión con Instagram')
    } finally {
      setTestingConnection(false)
    }
  }

  const uploadManualImage = async (file: File) => {
    const formData = new FormData()
    formData.append('images', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok || !data.success || !data.urls?.[0]) {
      throw new Error(data.message ?? 'No fue posible subir la imagen')
    }

    return data.urls[0] as string
  }

  const handleManualFileChange = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    setUploadingManualImage(true)

    try {
      const imageUrl = await uploadManualImage(file)
      setManualForm((prev) => ({ ...prev, imageUrl }))
      toast.success('Imagen subida correctamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al subir imagen')
    } finally {
      setUploadingManualImage(false)
      if (manualFileRef.current) {
        manualFileRef.current.value = ''
      }
    }
  }

  const createManualPost = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualForm.title.trim()) return toast.error('Ingresa un título para la publicación')
    if (!manualForm.imageUrl.trim()) return toast.error('Sube una imagen o indica una URL válida')

    setCreatingManual(true)

    try {
      const response = await fetch('/api/instagram/posts/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...manualForm,
          likes: manualForm.likes ? Number(manualForm.likes) : null,
          instagramUrl: manualForm.instagramUrl || null,
          altText: manualForm.altText || manualForm.title,
          homeCaption: manualForm.homeCaption || null,
          scheduledFor: manualForm.scheduledFor
            ? new Date(manualForm.scheduledFor).toISOString()
            : null,
        }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Borrador manual creado')
        setManualForm({
          title: '',
          sourceDescription: '',
          captionDraft: '',
          instagramUrl: '',
          altText: '',
          homeCaption: '',
          likes: '',
          homeVisible: true,
          homeOrder: 0,
          imageUrl: '',
          scheduledFor: defaultScheduledForValue(),
        })
        router.refresh()
      } else {
        toast.error(data.message ?? 'No fue posible crear el borrador manual')
      }
    } catch {
      toast.error('Error al crear borrador manual')
    } finally {
      setCreatingManual(false)
    }
  }

  const runAction = async (postId: string, action: 'approve' | 'publish' | 'skip') => {
    setBusyId(postId)

    try {
      const response = await fetch(`/api/instagram/posts/${postId}/${action}`, { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        const messageByAction = {
          approve: 'Publicación aprobada y movida a cola',
          publish: 'Publicación enviada a Instagram',
          skip: 'Publicación marcada como omitida',
        }
        toast.success(messageByAction[action])
        setEditingId(null)
        setEditForm(null)
        router.refresh()
      } else {
        toast.error(data.message ?? 'No fue posible ejecutar la acción')
      }
    } catch {
      toast.error('Error al ejecutar la acción')
    } finally {
      setBusyId(null)
    }
  }

  const startEditing = (post: PostWithRelations) => {
    setEditingId(post.id)
    setEditForm({
      title: post.title,
      imageUrl: post.imageUrl,
      sourceDescription: post.sourceDescription ?? '',
      captionDraft: post.captionDraft ?? '',
      finalCaption: post.finalCaption ?? '',
      scheduledFor: toDateTimeLocalValue(post.scheduledFor),
    })
  }

  const savePostEdit = async (postId: string) => {
    if (!editForm) return

    setBusyId(postId)

    try {
      const response = await fetch(`/api/instagram/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          scheduledFor: editForm.scheduledFor
            ? new Date(editForm.scheduledFor).toISOString()
            : null,
        }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Borrador actualizado')
        setEditingId(null)
        setEditForm(null)
        router.refresh()
      } else {
        toast.error(data.message ?? 'No fue posible actualizar la publicación')
      }
    } catch {
      toast.error('Error al actualizar la publicación')
    } finally {
      setBusyId(null)
    }
  }

  const uploadReplacementImage = async (postId: string, files: FileList | null) => {
    const file = files?.[0]
    if (!file || !editForm) return

    setBusyId(postId)

    try {
      const imageUrl = await uploadManualImage(file)
      setEditForm((prev) => (prev ? { ...prev, imageUrl } : prev))
      toast.success('Imagen actualizada en el formulario')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al subir imagen')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Productos elegibles</p>
          <p className="mt-2 text-3xl font-semibold">{eligibleProducts}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Borradores / Cola</p>
          <p className="mt-2 text-3xl font-semibold">
            {
              posts.filter((post) =>
                ['DRAFT', 'PENDING', 'PROCESSING', 'FAILED'].includes(post.status),
              ).length
            }
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Publicadas</p>
          <p className="mt-2 text-3xl font-semibold">
            {posts.filter((post) => post.status === 'PUBLISHED').length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <div className="space-y-6">
          <form onSubmit={saveSettings} className="space-y-4 rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Configuración</h2>
                <p className="text-sm text-gray-500">
                  Este módulo controla la generación y ejecución de la cola diaria.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
                Activo
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Timezone</label>
                <input
                  value={form.timezone}
                  onChange={(e) => setForm((prev) => ({ ...prev, timezone: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Origen automático
                </label>
                <select
                  value={form.sourceType}
                  onChange={(e) => setForm((prev) => ({ ...prev, sourceType: e.target.value }))}
                  className={inputClass}
                >
                  <option value="PRODUCTS">Productos</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Hora diaria</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={form.dailyHour}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, dailyHour: Number(e.target.value) }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Minuto</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={form.dailyMinute}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, dailyMinute: Number(e.target.value) }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Posts por día
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.maxDailyPosts}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maxDailyPosts: Number(e.target.value) }))
                  }
                  className={inputClass}
                />
              </div>
              <label className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.requireManualApproval}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, requireManualApproval: e.target.checked }))
                  }
                />
                Requiere aprobación manual
              </label>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Template de caption
              </label>
              <textarea
                rows={5}
                value={form.captionTemplate}
                onChange={(e) => setForm((prev) => ({ ...prev, captionTemplate: e.target.value }))}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500">
                Variables disponibles: <code>{'{{product_name}}'}</code>,{' '}
                <code>{'{{product_description}}'}</code>, <code>{'{{hashtags}}'}</code>.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Hashtags fallback
              </label>
              <input
                value={form.fallbackHashtags}
                onChange={(e) => setForm((prev) => ({ ...prev, fallbackHashtags: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-5 py-2 text-sm text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar configuración'}
              </button>
              <button
                type="button"
                onClick={generateDrafts}
                disabled={generating}
                className="rounded-lg border px-5 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-50"
              >
                {generating ? 'Generando...' : 'Generar borradores automáticos'}
              </button>
              <button
                type="button"
                onClick={testConnection}
                disabled={testingConnection}
                className="rounded-lg border px-5 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-50"
              >
                {testingConnection ? 'Probando...' : 'Probar conexión'}
              </button>
            </div>
          </form>

          <form onSubmit={createManualPost} className="space-y-4 rounded-xl border bg-white p-6">
            <div>
              <h2 className="text-lg font-semibold">Crear post manual desde storage</h2>
              <p className="text-sm text-gray-500">
                Sube una imagen al storage del proyecto o pega una URL ya existente, y programa la
                publicación exacta.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Título</label>
              <input
                value={manualForm.title}
                onChange={(e) => setManualForm((prev) => ({ ...prev, title: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Descripción base
              </label>
              <textarea
                rows={3}
                value={manualForm.sourceDescription}
                onChange={(e) =>
                  setManualForm((prev) => ({ ...prev, sourceDescription: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Caption manual opcional
              </label>
              <textarea
                rows={4}
                value={manualForm.captionDraft}
                onChange={(e) =>
                  setManualForm((prev) => ({ ...prev, captionDraft: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  URL de la publicaciÃ³n de Instagram
                </label>
                <input
                  type="url"
                  value={manualForm.instagramUrl}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, instagramUrl: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="https://www.instagram.com/p/..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Texto alternativo
                </label>
                <input
                  value={manualForm.altText}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, altText: e.target.value }))}
                  className={inputClass}
                  placeholder="Describe la imagen"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Likes manuales opcionales
                </label>
                <input
                  type="number"
                  min={0}
                  value={manualForm.likes}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, likes: e.target.value }))}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-gray-500">Valor decorativo, no sincronizado.</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Orden en Home
                </label>
                <input
                  type="number"
                  min={0}
                  value={manualForm.homeOrder}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, homeOrder: Number(e.target.value) }))
                  }
                  className={inputClass}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={manualForm.homeVisible}
                onChange={(e) =>
                  setManualForm((prev) => ({ ...prev, homeVisible: e.target.checked }))
                }
              />
              Mostrar en Home
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Subir imagen</label>
                <input
                  ref={manualFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleManualFileChange(e.target.files)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {uploadingManualImage
                    ? 'Subiendo imagen...'
                    : 'La imagen quedará en el blob público del proyecto.'}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  O URL de imagen
                </label>
                <input
                  value={manualForm.imageUrl}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Programar para</label>
              <input
                type="datetime-local"
                value={manualForm.scheduledFor}
                onChange={(e) =>
                  setManualForm((prev) => ({ ...prev, scheduledFor: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            {manualForm.imageUrl && (
              <div className="relative h-48 overflow-hidden rounded-xl border bg-gray-100">
                <Image
                  src={manualForm.imageUrl}
                  alt={manualForm.title || 'Preview'}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={creatingManual || uploadingManualImage}
              className="rounded-lg bg-black px-5 py-2 text-sm text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {creatingManual ? 'Creando...' : 'Crear borrador manual'}
            </button>
          </form>
        </div>

        <div className="space-y-4 rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Cola reciente</h2>
              <p className="text-sm text-gray-500">
                Borradores, pendientes, errores y publicaciones procesadas.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
                Aún no hay publicaciones generadas.
              </div>
            ) : (
              posts.map((post) => {
                const isEditing = editingId === post.id && editForm

                return (
                  <div
                    key={post.id}
                    className="grid gap-4 rounded-xl border p-4 md:grid-cols-[96px_1fr]"
                  >
                    <div className="relative h-24 overflow-hidden rounded-lg border bg-gray-100">
                      <Image
                        src={isEditing ? editForm.imageUrl : post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            {post.status} · {post.sourceType}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {!isEditing &&
                            post.status !== 'PUBLISHED' &&
                            post.status !== 'PROCESSING' && (
                              <button
                                type="button"
                                onClick={() => startEditing(post)}
                                disabled={busyId === post.id}
                                className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                              >
                                Editar
                              </button>
                            )}
                          {post.status === 'DRAFT' && (
                            <button
                              type="button"
                              onClick={() => runAction(post.id, 'approve')}
                              disabled={busyId === post.id}
                              className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                            >
                              Aprobar
                            </button>
                          )}
                          {post.status !== 'PUBLISHED' && post.status !== 'SKIPPED' && (
                            <button
                              type="button"
                              onClick={() => runAction(post.id, 'publish')}
                              disabled={busyId === post.id}
                              className="rounded-lg bg-black px-3 py-1.5 text-xs text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              Publicar ahora
                            </button>
                          )}
                          {post.status !== 'PUBLISHED' && post.status !== 'SKIPPED' && (
                            <button
                              type="button"
                              onClick={() => runAction(post.id, 'skip')}
                              disabled={busyId === post.id}
                              className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                            >
                              Omitir
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-3 rounded-lg border border-dashed p-3">
                          <input
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, title: e.target.value } : prev,
                              )
                            }
                            className={inputClass}
                          />
                          <textarea
                            rows={2}
                            value={editForm.sourceDescription}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, sourceDescription: e.target.value } : prev,
                              )
                            }
                            className={inputClass}
                            placeholder="Descripción base"
                          />
                          <textarea
                            rows={4}
                            value={editForm.captionDraft}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, captionDraft: e.target.value } : prev,
                              )
                            }
                            className={inputClass}
                            placeholder="Caption draft"
                          />
                          <input
                            value={editForm.finalCaption}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, finalCaption: e.target.value } : prev,
                              )
                            }
                            className={inputClass}
                            placeholder="Final caption opcional"
                          />
                          <input
                            value={editForm.imageUrl}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, imageUrl: e.target.value } : prev,
                              )
                            }
                            className={inputClass}
                            placeholder="URL imagen"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadReplacementImage(post.id, e.target.files)}
                            className={inputClass}
                          />
                          <input
                            type="datetime-local"
                            value={editForm.scheduledFor}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, scheduledFor: e.target.value } : prev,
                              )
                            }
                            className={inputClass}
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => savePostEdit(post.id)}
                              disabled={busyId === post.id}
                              className="rounded-lg bg-black px-3 py-1.5 text-xs text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              Guardar cambios
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null)
                                setEditForm(null)
                              }}
                              className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {post.finalCaption ?? post.captionDraft}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>Producto: {post.product?.name ?? 'Manual / storage'}</span>
                        <span>
                          Programado:{' '}
                          {post.scheduledFor
                            ? new Date(post.scheduledFor).toLocaleString()
                            : 'Sin fecha'}
                        </span>
                        <span>Reintentos: {post.retryCount}</span>
                      </div>

                      {(post.lastError || post.attempts[0]?.message) && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                          {post.lastError ?? post.attempts[0]?.message}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function toDateTimeLocalValue(value: Date | string | null) {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (part: number) => String(part).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function defaultScheduledForValue() {
  const date = new Date()
  date.setHours(date.getHours() + 1, 0, 0, 0)
  return toDateTimeLocalValue(date)
}
