'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Role } from '@prisma/client'

const navItems = [
  { href: '/', label: 'INICIO' },
  { href: '/collection', label: 'TIENDA' },
  { href: '/about', label: 'NOSOTROS' },
  { href: '/contact', label: 'CONTACTO' },
]

const socialLinks = [
  { 
    icon: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    href: 'https://instagram.com/harrysboutique',
    label: 'Instagram'
  },
  { 
    icon: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    href: 'https://facebook.com/harrysboutique',
    label: 'Facebook'
  },
  { 
    icon: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    href: 'https://t.me/harrysboutique',
    label: 'Telegram'
  },
]

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const openDrawer = useCartStore((s) => s.openDrawer)
  const [menuOpen, setMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
    setCategoriesOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/collection?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchFocused(false)
    }
  }

  const categories = [
    { name: 'Ropa', href: '/collection?category=ropa', icon: '👕' },
    { name: 'Accesorios', href: '/collection?category=accesorios', icon: '🎀' },
    { name: 'Juguetes', href: '/collection?category=juguetes', icon: '🎾' },
    { name: 'Camas', href: '/collection?category=camas', icon: '🛏️' },
    { name: 'Collares', href: '/collection?category=collares', icon: '⭕' },
    { name: 'Comederos', href: '/collection?category=comederos', icon: '🍽️' },
  ]

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky top-0 z-40 bg-[var(--color-background)]/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm"
    >
      {/* Top bar - Social links y login */}
      <div className="hidden lg:block border-b border-[var(--color-border)]/50 bg-[var(--color-surface)]/30">
        <div className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="flex justify-between items-center py-2 text-xs">
            {/* Social links */}
            <div className="flex items-center gap-4">
              <span className="text-[var(--color-text-muted)]">Síguenos:</span>
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                    aria-label={social.label}
                  >
                    <IconComponent />
                  </a>
                )
              })}
            </div>

            {/* Login/Account */}
            <div className="flex items-center gap-4">
              {session?.user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-semibold">
                      {session.user.name?.charAt(0).toUpperCase() ?? 'U'}
                    </div>
                    <span className="text-xs font-medium">{session.user.name}</span>
                  </button>
                  <div className="absolute right-0 pt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <div className="bg-white rounded-lg shadow-xl border border-[var(--color-border)] overflow-hidden min-w-[180px]">
                      {(session.user.role === 'OWNER' ||
                        session.user.role === 'ADMIN' ||
                        session.user.role === 'MODERATOR') && (
                        <>
                          <Link
                            href="/admin/dashboard"
                            className="block px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                          >
                            Panel Admin
                          </Link>
                          <div className="border-t border-[var(--color-border)]" />
                        </>
                      )}
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors"
                      >
                        Mi cuenta
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors"
                      >
                        Mis compras
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors"
                      >
                        Mis favoritos
                      </Link>
                      <div className="border-t border-[var(--color-border)]" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors font-medium"
                >
                  INICIA SESIÓN / REGÍSTRATE
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="flex justify-between items-center py-3 lg:py-4 gap-4">
          {/* Categories button + Logo */}
          <div className="flex items-center gap-4">
            {/* Categories dropdown - Desktop */}
            <div className="hidden lg:block relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-dark)] transition-all font-medium text-sm shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                VER CATEGORÍAS
                <svg
                  className={`w-4 h-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Categories dropdown menu */}
              <AnimatePresence>
                {categoriesOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setCategoriesOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-[var(--color-border)] overflow-hidden z-40"
                    >
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          onClick={() => setCategoriesOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
                        >
                          <span className="text-2xl">{category.icon}</span>
                          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                      <Link
                        href="/collection"
                        onClick={() => setCategoriesOpen(false)}
                        className="block px-4 py-3 text-center text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-colors"
                      >
                        Ver todas las categorías →
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/harrys_logo.png"
                alt="Harry's Boutique"
                width={100}
                height={100}
                className="object-contain w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
                priority
              />
            </Link>
          </div>

          {/* Search bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-4"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Buscar productos..."
                className="w-full px-4 py-2.5 pr-12 rounded-lg border-2 border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all outline-none text-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-accent)] text-white rounded-md hover:bg-[var(--color-accent-dark)] transition-colors"
                aria-label="Buscar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex gap-6 xl:gap-8 text-sm font-medium text-[var(--color-text-secondary)]">
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
                    <motion.span
                      layoutId="navbar-indicator"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[var(--color-accent)]"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 items-center">
            {/* Search icon - Mobile */}
            <button
              onClick={() => {
                const query = prompt('¿Qué estás buscando?')
                if (query) router.push(`/collection?search=${encodeURIComponent(query)}`)
              }}
              className="md:hidden p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors"
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="hidden sm:block p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors relative"
              aria-label="Lista de deseos"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </Link>

            {/* Profile - Mobile */}
            {session?.user ? (
              <Link
                href="/profile"
                className="lg:hidden p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors"
                aria-label="Mi cuenta"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-semibold">
                  {session.user.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="lg:hidden p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors"
                aria-label="Iniciar sesión"
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

            {/* Cart with total */}
            <button
              onClick={openDrawer}
              className="relative group"
              aria-label={cartCount > 0 ? `Carrito (${cartCount} productos)` : 'Carrito'}
            >
              <div className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                <div className="relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2 -top-2 bg-[var(--color-accent)] text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold shadow-md"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </div>
                {cartCount > 0 && (
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-xs text-[var(--color-text-muted)]">Mi carrito</span>
                    <span className="text-sm font-bold text-[var(--color-accent)]">
                      ${cartTotal.toLocaleString('es-CL')}
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors lg:hidden"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
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
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl z-[101] flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <Image
                    src="/harrys_logo.png"
                    alt="Harry's Boutique"
                    width={80}
                    height={80}
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Categories section */}
                <div className="p-4 bg-[var(--color-accent-light)] border-b border-[var(--color-border)]">
                  <h3 className="text-xs font-bold text-[var(--color-accent-dark)] uppercase mb-3">
                    Categorías
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-[var(--color-surface)] transition-colors text-sm"
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium text-[var(--color-text-secondary)]">
                          {category.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Navigation links */}
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-6 py-4 border-b border-[var(--color-border)] transition-colors font-medium ${
                      pathname === item.href
                        ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-dark)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* User links */}
                <div className="border-t-4 border-[var(--color-border)] mt-2">
                  {session?.user ? (
                    <>
                      <div className="px-6 py-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center font-bold">
                            {session.user.name?.charAt(0).toUpperCase() ?? 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{session.user.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              {session.user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="block px-6 py-3 text-[var(--color-text-secondary)] border-b border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
                      >
                        Mi cuenta
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="block px-6 py-3 text-[var(--color-text-secondary)] border-b border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
                      >
                        Mis compras
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="block px-6 py-3 text-[var(--color-text-secondary)] border-b border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
                      >
                        Mis favoritos
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          signOut({ callbackUrl: '/' })
                        }}
                        className="w-full text-left px-6 py-3 text-red-600 border-b border-[var(--color-border)] hover:bg-red-50 transition-colors font-medium"
                      >
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block px-6 py-4 text-[var(--color-accent)] border-b border-[var(--color-border)] hover:bg-[var(--color-accent-light)] transition-colors font-medium text-center"
                    >
                      INICIAR SESIÓN / REGISTRARSE
                    </Link>
                  )}
                </div>

                {/* Social links */}
                <div className="p-6">
                  <p className="text-xs text-[var(--color-text-muted)] mb-3 font-medium">
                    SÍGUENOS
                  </p>
                  <div className="flex gap-4">
                    {socialLinks.map((social) => {
                      const IconComponent = social.icon
                      return (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-[var(--color-surface)] rounded-full hover:bg-[var(--color-accent)] hover:text-white transition-colors"
                          aria-label={social.label}
                        >
                          <IconComponent />
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
