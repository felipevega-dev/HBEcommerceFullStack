'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const navItems = [
  { href: '/', label: 'INICIO' },
  { href: '/collection', label: 'COLECCIONES' },
  { href: '/about', label: 'NOSOTROS' },
  { href: '/contact', label: 'CONTACTO' },
]

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const cartCount = useCartStore((s) => s.getCount())
  const openDrawer = useCartStore((s) => s.openDrawer)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky top-0 z-40 bg-[var(--color-background)]/90 backdrop-blur-md border-b border-[var(--color-border)]"
    >
      <div className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="flex justify-between items-center py-4 font-medium">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 z-50">
            <Image
              src="/harrys_logo.png"
              alt="Harry's Boutique"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden sm:flex gap-8 text-sm text-[var(--color-text-secondary)]">
            {navItems.map((item) => (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-1 transition-colors duration-200 hover:text-[var(--color-primary)] ${
                    pathname === item.href ? 'text-[var(--color-primary)]' : ''
                  }`}
                >
                  {item.label}
                  {pathname === item.href && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex gap-4 items-center z-50">
            {/* Search */}
            <Link
              href="/collection?search="
              className="p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </Link>

            {/* Profile */}
            {session?.user ? (
              <div className="relative group">
                <button className="hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-semibold">
                    {session.user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                </button>
                <div className="absolute right-0 pt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <div className="bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] overflow-hidden min-w-[160px]">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      Mi cuenta
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      Mis compras
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      Desconectarse
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={openDrawer}
              className="relative p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors"
              aria-label={cartCount > 0 ? `Carrito (${cartCount} productos)` : 'Carrito'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 bg-[var(--color-accent)] text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors sm:hidden z-50"
              aria-label="Abrir menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — animated with framer-motion */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-[var(--color-surface)] shadow-xl z-[101] flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <Image
                    src="/harrys_logo.png"
                    alt="Harry's Boutique"
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-[var(--color-surface-2)] rounded-full transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-6 py-3 border-b border-[var(--color-border)] transition-colors ${
                      pathname === item.href
                        ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-dark)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {session?.user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-6 py-3 text-[var(--color-text-secondary)] border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      MI CUENTA
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="block px-6 py-3 text-[var(--color-text-secondary)] border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      MIS COMPRAS
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className="w-full text-left px-6 py-3 text-[var(--color-text-secondary)] border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      DESCONECTARSE
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-6 py-3 text-[var(--color-text-secondary)] border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    INICIAR SESIÓN
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
