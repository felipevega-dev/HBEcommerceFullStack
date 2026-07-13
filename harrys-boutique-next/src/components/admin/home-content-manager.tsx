'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Button, Input, Textarea } from '@/components/ui/design-system'

type Category = {
  id: string
  name: string
  slug: string | null
  homeImage: string | null
  homeDescription: string | null
  homeHref: string | null
  active: boolean
  homeVisible: boolean
  homeOrder: number
}

type Product = {
  id: string
  name: string
  image: string | null
  active: boolean
  stock: number
  categoryId: string
}
type Featured = { productId: string; visible: boolean; order: number }
type CategoryProduct = { productId: string; visible: boolean; order: number }
type CategoryBlock = {
  categoryId: string
  mode: 'AUTO' | 'MANUAL'
  maxItems: number
  visible: boolean
  order: number
  items: CategoryProduct[]
}
type InstagramPost = {
  id: string
  title: string
  imageUrl: string
  instagramUrl: string | null
  altText: string | null
  homeCaption: string | null
  likes: number | null
  homeVisible: boolean
  homeOrder: number
}

export function HomeContentManager({
  categories: initialCategories,
  products,
  featured: initialFeatured,
  instagramPosts: initialInstagramPosts,
  categoryBlocks: initialCategoryBlocks,
}: {
  categories: Category[]
  products: Product[]
  featured: Featured[]
  instagramPosts: InstagramPost[]
  categoryBlocks: CategoryBlock[]
}) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [featured, setFeatured] = useState(initialFeatured)
  const [instagramPosts, setInstagramPosts] = useState(initialInstagramPosts)
  const [categoryBlocks, setCategoryBlocks] = useState(initialCategoryBlocks)
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' })
  const [saving, setSaving] = useState<string | null>(null)
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null)

  async function save(action: string, data: unknown) {
    setSaving(action)
    try {
      const response = await fetch('/api/admin/home-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message)
      toast.success('Contenido del Home actualizado')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar')
    } finally {
      setSaving(null)
    }
  }

  async function uploadCategoryImage(categoryId: string, file: File) {
    setUploadingCategory(categoryId)
    try {
      const formData = new FormData()
      formData.append('images', file)
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const result = await response.json()
      if (!response.ok || !result.success || !result.url) {
        throw new Error(result.message || 'No se pudo subir la imagen')
      }
      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId ? { ...category, homeImage: result.url } : category,
        ),
      )
      toast.success('Imagen subida. Guarda la categoría para aplicarla al Home.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo subir la imagen')
    } finally {
      setUploadingCategory(null)
    }
  }

  function toggleFeatured(productId: string) {
    setFeatured((current) => {
      if (current.some((item) => item.productId === productId)) {
        if (current.length <= 4) {
          toast.error('Debes mantener al menos 4 productos destacados')
          return current
        }
        return current.filter((item) => item.productId !== productId)
      }
      return [...current, { productId, visible: true, order: current.length }]
    })
  }

  function moveCategory(categoryId: string, direction: -1 | 1) {
    setCategories((current) => {
      const ordered = [...current].sort((a, b) => a.homeOrder - b.homeOrder)
      const index = ordered.findIndex((category) => category.id === categoryId)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return current
      const next = [...ordered]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next.map((category, homeOrder) => ({ ...category, homeOrder }))
    })
  }

  function toggleCategoryProduct(categoryId: string, productId: string) {
    setCategoryBlocks((current) =>
      current.map((block) => {
        if (block.categoryId !== categoryId) return block
        const exists = block.items.some((item) => item.productId === productId)
        return {
          ...block,
          mode: 'MANUAL',
          items: exists
            ? block.items.filter((item) => item.productId !== productId)
            : [...block.items, { productId, visible: true, order: block.items.length }],
        }
      }),
    )
  }

  function updateCategoryBlock(categoryId: string, patch: Partial<CategoryBlock>) {
    setCategoryBlocks((current) =>
      current.map((block) => (block.categoryId === categoryId ? { ...block, ...patch } : block)),
    )
  }

  const selectedFeatured = [...featured]
    .sort((a, b) => a.order - b.order)
    .map((selection) => products.find((product) => product.id === selection.productId))
    .filter((product): product is Product => Boolean(product))
  const availableFeatured = products.filter(
    (product) => !featured.some((selection) => selection.productId === product.id),
  )

  function moveFeatured(productId: string, direction: -1 | 1) {
    setFeatured((current) => {
      const ordered = [...current].sort((a, b) => a.order - b.order)
      const index = ordered.findIndex((item) => item.productId === productId)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return current
      const next = [...ordered]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next.map((item, order) => ({ ...item, order }))
    })
  }

  function updateFeaturedOrder(productId: string, order: number) {
    setFeatured((current) => {
      const ordered = [...current].sort((a, b) => a.order - b.order)
      const currentIndex = ordered.findIndex((item) => item.productId === productId)
      if (currentIndex < 0) return current
      const targetIndex = Math.max(0, Math.min(ordered.length - 1, order - 1))
      const [item] = ordered.splice(currentIndex, 1)
      ordered.splice(targetIndex, 0, item)
      return ordered.map((selection, index) => ({ ...selection, order: index }))
    })
  }

  return (
    <div className="space-y-8">
      <section className="ui-panel p-6">
        <div className="mb-5">
          <p className="ui-eyebrow">Colecciones</p>
          <h2 className="mt-1 text-2xl">Colecciones del Home</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Activa categorías, cambia su imagen, destino y orden sin tocar el frontend.
          </p>
        </div>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="ui-card grid gap-4 p-4 md:grid-cols-[1fr_1.2fr_auto_auto]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{category.name}</p>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-accent-soft)] text-xs font-semibold text-[var(--color-accent-strong)]">
                    {category.homeOrder + 1}
                  </span>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={category.homeVisible}
                    onChange={(event) =>
                      setCategories((current) =>
                        current.map((item) =>
                          item.id === category.id
                            ? { ...item, homeVisible: event.target.checked }
                            : item,
                        ),
                      )
                    }
                  />
                  Mostrar en Home
                </label>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  className="h-9 px-3"
                  disabled={category.homeOrder === 0}
                  aria-label={`Subir colección ${category.name}`}
                  onClick={() => moveCategory(category.id, -1)}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 px-3"
                  disabled={category.homeOrder === categories.length - 1}
                  aria-label={`Bajar colección ${category.name}`}
                  onClick={() => moveCategory(category.id, 1)}
                >
                  ↓
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={category.slug ?? ''}
                  placeholder="Slug"
                  aria-label={`Slug de ${category.name}`}
                  onChange={(event) =>
                    setCategories((current) =>
                      current.map((item) =>
                        item.id === category.id ? { ...item, slug: event.target.value } : item,
                      ),
                    )
                  }
                />
                <Input
                  value={category.homeHref ?? ''}
                  placeholder="Destino opcional"
                  aria-label={`Destino de ${category.name}`}
                  onChange={(event) =>
                    setCategories((current) =>
                      current.map((item) =>
                        item.id === category.id ? { ...item, homeHref: event.target.value } : item,
                      ),
                    )
                  }
                />
                <div className="sm:col-span-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="ui-button ui-button-secondary cursor-pointer">
                      {uploadingCategory === category.id ? 'Subiendo…' : 'Seleccionar imagen'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={uploadingCategory === category.id}
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (file) void uploadCategoryImage(category.id, file)
                          event.target.value = ''
                        }}
                      />
                    </label>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      JPG, PNG o WEBP · máximo 5 MB
                    </span>
                  </div>
                  {category.homeImage && (
                    <div className="relative mt-3 h-24 w-40 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-warm)]">
                      <Image
                        src={category.homeImage}
                        alt={`Vista previa de ${category.name}`}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
                <Input
                  value={category.homeImage ?? ''}
                  placeholder="URL de imagen de portada"
                  aria-label={`Imagen de ${category.name}`}
                  onChange={(event) =>
                    setCategories((current) =>
                      current.map((item) =>
                        item.id === category.id ? { ...item, homeImage: event.target.value } : item,
                      ),
                    )
                  }
                />
                <Input
                  type="number"
                  min={0}
                  value={category.homeOrder}
                  aria-label={`Orden de ${category.name}`}
                  onChange={(event) =>
                    setCategories((current) =>
                      current.map((item) =>
                        item.id === category.id
                          ? { ...item, homeOrder: Number(event.target.value) }
                          : item,
                      ),
                    )
                  }
                />
                <Textarea
                  value={category.homeDescription ?? ''}
                  placeholder="Texto secundario opcional"
                  aria-label={`Descripción de ${category.name}`}
                  className="sm:col-span-2"
                  onChange={(event) =>
                    setCategories((current) =>
                      current.map((item) =>
                        item.id === category.id
                          ? { ...item, homeDescription: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </div>
              <Button
                variant="secondary"
                loading={saving === `category:${category.id}`}
                onClick={() => save('category', categories[index])}
              >
                Guardar
              </Button>
            </div>
          ))}
        </div>
        <Button
          className="mt-5"
          loading={saving === 'categories'}
          onClick={() => void save('categories', categories)}
        >
          Guardar orden de colecciones
        </Button>
      </section>

      {/* category blocks are kept in the API for future use, but are intentionally not exposed in this panel */}
      <section className="hidden" aria-hidden="true">
        <div className="mb-5">
          <p className="ui-eyebrow">Productos por categoría</p>
          <h2 className="mt-1 text-2xl">Bloques configurables</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Define si cada bloque usa productos activos automáticamente o una selección manual.
          </p>
        </div>
        <div className="space-y-5">
          {categories.map((category) => {
            const block = categoryBlocks.find((item) => item.categoryId === category.id) ?? {
              categoryId: category.id,
              mode: 'AUTO' as const,
              maxItems: 4,
              visible: false,
              order: category.homeOrder,
              items: [],
            }
            const categoryProducts = products.filter(
              (product) =>
                product.categoryId === category.id && product.active && product.stock > 0,
            )
            return (
              <div key={category.id} className="ui-card space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      La selección manual solo acepta productos de esta categoría.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={block.visible}
                      onChange={(event) =>
                        updateCategoryBlock(category.id, { visible: event.target.checked })
                      }
                    />
                    Mostrar bloque
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="text-sm">
                    <span className="mb-1 block text-xs text-[var(--color-text-muted)]">Modo</span>
                    <select
                      className="ui-input w-full"
                      value={block.mode}
                      onChange={(event) =>
                        updateCategoryBlock(category.id, {
                          mode: event.target.value as CategoryBlock['mode'],
                        })
                      }
                    >
                      <option value="AUTO">Automático</option>
                      <option value="MANUAL">Manual</option>
                    </select>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={block.maxItems}
                    aria-label={`Cantidad máxima de ${category.name}`}
                    onChange={(event) =>
                      updateCategoryBlock(category.id, { maxItems: Number(event.target.value) })
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    value={block.order}
                    aria-label={`Orden del bloque ${category.name}`}
                    onChange={(event) =>
                      updateCategoryBlock(category.id, { order: Number(event.target.value) })
                    }
                  />
                </div>
                {block.mode === 'MANUAL' && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {categoryProducts.map((product) => (
                      <label key={product.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={block.items.some((item) => item.productId === product.id)}
                          onChange={() => toggleCategoryProduct(category.id, product.id)}
                        />
                        <span className="truncate">{product.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                <Button
                  variant="secondary"
                  loading={saving === `categoryBlock:${category.id}`}
                  onClick={() => save('categoryBlock', block)}
                >
                  Guardar bloque
                </Button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="ui-panel p-6">
        <div className="mb-5">
          <p className="ui-eyebrow">Catálogo</p>
          <h2 className="mt-1 text-2xl">Añadir categoría</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            value={newCategory.name}
            placeholder="Nombre"
            aria-label="Nombre de la nueva categoría"
            onChange={(event) =>
              setNewCategory((current) => ({ ...current, name: event.target.value }))
            }
          />
          <Input
            value={newCategory.slug}
            placeholder="Slug opcional"
            aria-label="Slug de la nueva categoría"
            onChange={(event) =>
              setNewCategory((current) => ({ ...current, slug: event.target.value }))
            }
          />
          <Button
            loading={saving === 'createCategory'}
            onClick={async () => {
              if (!newCategory.name.trim()) {
                toast.error('Escribe un nombre para la categoría')
                return
              }
              await save('createCategory', {
                name: newCategory.name,
                slug: newCategory.slug || undefined,
                homeVisible: false,
              })
              setNewCategory({ name: '', slug: '' })
            }}
          >
            Añadir
          </Button>
        </div>
      </section>

      <section className="ui-panel p-6">
        <div className="mb-5">
          <p className="ui-eyebrow">Productos destacados</p>
          <h2 className="mt-1 text-2xl">Selección del Home</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Selecciona productos activos y disponibles. El orden se conserva según la selección.
          </p>
        </div>
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
              Seleccionados para el Home ({selectedFeatured.length})
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {selectedFeatured.map((product, index) => (
                <div key={product.id} className="ui-card flex flex-wrap items-center gap-3 p-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-accent-soft)] text-sm font-semibold text-[var(--color-accent-strong)]">
                    {index + 1}
                  </span>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-warm)]">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-[9px] text-[var(--color-text-muted)]">
                        Sin foto
                      </span>
                    )}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{product.name}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Posición {index + 1}
                    </span>
                  </span>
                  <Input
                    type="number"
                    min={1}
                    max={selectedFeatured.length}
                    value={index + 1}
                    aria-label={`Posición de ${product.name}`}
                    className="!w-20"
                    onChange={(event) =>
                      updateFeaturedOrder(product.id, Number(event.target.value))
                    }
                  />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      className="h-9 px-3"
                      disabled={index === 0}
                      aria-label={`Subir ${product.name}`}
                      onClick={() => moveFeatured(product.id, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-9 px-3"
                      disabled={index === selectedFeatured.length - 1}
                      aria-label={`Bajar ${product.name}`}
                      onClick={() => moveFeatured(product.id, 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-9 px-3"
                      aria-label={`Quitar ${product.name}`}
                      onClick={() => toggleFeatured(product.id)}
                    >
                      Quitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
              Disponibles para agregar ({availableFeatured.length})
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {availableFeatured.map((product) => (
                <label
                  key={product.id}
                  className="ui-card flex cursor-pointer items-center gap-3 p-3"
                >
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleFeatured(product.id)}
                    disabled={!product.active || product.stock <= 0}
                  />
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-warm)]">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-[9px] text-[var(--color-text-muted)]">
                        Sin foto
                      </span>
                    )}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{product.name}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {product.active && product.stock > 0 ? 'Disponible' : 'No disponible'}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <Button
          className="mt-5"
          loading={saving === 'products'}
          onClick={() => {
            if (featured.length < 4) {
              toast.error('Selecciona al menos 4 productos destacados')
              return
            }
            void save('products', featured)
          }}
        >
          Guardar productos destacados
        </Button>
      </section>

      <section className="ui-panel p-6">
        <div className="mb-5">
          <p className="ui-eyebrow">Instagram manual</p>
          <h2 className="mt-1 text-2xl">Publicaciones del Home</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Los likes son opcionales y manuales; no representan sincronización en tiempo real.
          </p>
        </div>
        <div className="space-y-4">
          {instagramPosts.map((post, index) => (
            <div key={post.id} className="ui-card grid gap-4 p-4 md:grid-cols-[1fr_1.3fr_auto]">
              <div>
                <p className="font-semibold">{post.title}</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {post.imageUrl ? 'Imagen cargada' : 'Falta imagen'}
                </p>
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={post.homeVisible}
                    onChange={(event) =>
                      setInstagramPosts((current) =>
                        current.map((item) =>
                          item.id === post.id
                            ? { ...item, homeVisible: event.target.checked }
                            : item,
                        ),
                      )
                    }
                  />
                  Mostrar en Home
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={post.instagramUrl ?? ''}
                  placeholder="URL de Instagram"
                  aria-label={`URL de ${post.title}`}
                  onChange={(event) =>
                    setInstagramPosts((current) =>
                      current.map((item) =>
                        item.id === post.id ? { ...item, instagramUrl: event.target.value } : item,
                      ),
                    )
                  }
                />
                <Input
                  value={post.altText ?? ''}
                  placeholder="Texto alternativo"
                  aria-label={`Texto alternativo de ${post.title}`}
                  onChange={(event) =>
                    setInstagramPosts((current) =>
                      current.map((item) =>
                        item.id === post.id ? { ...item, altText: event.target.value } : item,
                      ),
                    )
                  }
                />
                <Input
                  type="number"
                  min={0}
                  value={post.likes ?? ''}
                  placeholder="Likes manuales"
                  aria-label={`Likes de ${post.title}`}
                  onChange={(event) =>
                    setInstagramPosts((current) =>
                      current.map((item) =>
                        item.id === post.id
                          ? {
                              ...item,
                              likes: event.target.value ? Number(event.target.value) : null,
                            }
                          : item,
                      ),
                    )
                  }
                />
                <Input
                  type="number"
                  min={0}
                  value={post.homeOrder}
                  aria-label={`Orden de ${post.title}`}
                  onChange={(event) =>
                    setInstagramPosts((current) =>
                      current.map((item) =>
                        item.id === post.id
                          ? { ...item, homeOrder: Number(event.target.value) }
                          : item,
                      ),
                    )
                  }
                />
              </div>
              <Button
                variant="secondary"
                loading={saving === `instagram:${post.id}`}
                onClick={() => save('instagram', instagramPosts[index])}
              >
                Guardar
              </Button>
            </div>
          ))}
          {instagramPosts.length === 0 && (
            <p className="ui-card p-5 text-sm text-[var(--color-text-secondary)]">
              Crea una publicación manual desde el módulo Instagram para configurarla aquí.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
