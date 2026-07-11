'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Role } from '@prisma/client'
import { BrandIcon, type BrandIconName } from '@/components/ui/brand-icon'

const ADMIN_ROLES: Role[] = ['OWNER', 'ADMIN', 'MODERATOR']

const categories: Array<{ name: string; href: string; icon: BrandIconName }> = [
  { name: 'Prendas', href: '/collection?category=Prendas', icon: 'shirt' },
  { name: 'Polerones', href: '/collection?subCategory=Polerones', icon: 'shirt' },
  { name: 'Camisetas', href: '/collection?subCategory=Camisetas', icon: 'sparkles' },
  { name: 'Vestidos', href: '/collection?subCategory=Vestidos', icon: 'design' },
  { name: 'Más vendidos', href: '/collection?bestSeller=true', icon: 'star' },
  { name: 'Novedades', href: '/collection?sort=newest', icon: 'tag' },
]

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const openDrawer = useCartStore((s) => s.openDrawer)
  const [menuOpen, setMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isAdmin = Boolean(session?.user?.role && ADMIN_ROLES.includes(session.user.role))

  useEffect(() => {
    setMenuOpen(false)
    setCategoriesOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [menuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/collection?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMenuOpen(false)
    }
  }

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:gap-6 lg:px-8">
          <button
            type="button"
            className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] lg:hidden"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
          >
            <BrandIcon name="filter" className="h-5 w-5" />
          </button>

          <Link href="/" className="shrink-0">
            <Image src="/harrys_logo.png" alt="Harry's Boutique" width={120} height={36} priority />
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/collection"
              className="px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            >
              Tienda
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen((open) => !open)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                Categorías
                <BrandIcon
                  name="chevron-right"
                  className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-90' : ''}`}
                />
              </button>
              <AnimatePresence>
                {categoriesOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-30"
                      aria-label="Cerrar categorías"
                      onClick={() => setCategoriesOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute left-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-[var(--shadow-sm)]"
                    >
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          onClick={() => setCategoriesOpen(false)}
                          className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)] transition-colors last:border-b-0 hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
                        >
                          <BrandIcon
                            name={category.icon}
                            className="h-4 w-4 text-[var(--color-accent-dark)]"
                          />
                          {category.name}
                        </Link>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 lg:block">
            <label htmlFor="nav-search" className="sr-only">
              Buscar productos
            </label>
            <div className="relative">
              <BrandIcon
                name="search"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                id="nav-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--color-accent-dark)]"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {session?.user ? (
              <div className="group relative hidden lg:block">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-semibold text-white">
                    {session.user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </span>
                </button>
                <div className="pointer-events-none absolute right-0 top-full z-50 pt-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                  <div className="min-w-[180px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-[var(--shadow-sm)]">
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2.5 text-sm text-[var(--color-info)] hover:bg-[var(--color-surface)]"
                      >
                        Panel Admin
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 text-sm hover:bg-[var(--color-surface)]"
                    >
                      Mi cuenta
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2.5 text-sm hover:bg-[var(--color-surface)]"
                    >
                      Mis compras
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full px-4 py-2.5 text-left text-sm text-[var(--color-error)] hover:bg-[var(--color-surface)]"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] lg:block"
              >
                Entrar
              </Link>
            )}

            <Link
              href="/wishlist"
              className="rounded-[var(--radius-md)] p-2 hover:bg-[var(--color-surface)]"
              aria-label="Favoritos"
            >
              <BrandIcon name="heart" className="h-5 w-5" />
            </Link>

            <button
              type="button"
              onClick={openDrawer}
              className="relative rounded-[var(--radius-md)] p-2 hover:bg-[var(--color-surface)]"
              aria-label={`Carrito, ${cartCount} productos`}
            >
              <BrandIcon name="shopping-bag" className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 flex w-full max-w-xs flex-col bg-[var(--color-background)] shadow-[var(--shadow-hover)] lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
                <span className="text-sm font-medium">Menú</span>
                <button type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar">
                  <BrandIcon name="x" className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="border-b border-[var(--color-border)] p-4">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none"
                />
              </form>

              <div className="flex-1 overflow-y-auto p-4">
                <Link
                  href="/collection"
                  className="mb-4 block text-sm font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Tienda
                </Link>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Categorías
                </p>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-[var(--color-border)] p-4">
                {session?.user ? (
                  <>
                    <Link
                      href="/profile"
                      className="block text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mi cuenta
                    </Link>
                    <Link
                      href="/orders"
                      className="block text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mis compras
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-sm text-[var(--color-error)]"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block text-sm font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Entrar / Registrarse
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
