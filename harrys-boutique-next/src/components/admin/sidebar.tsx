'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandIcon, type BrandIconName } from '@/components/ui/brand-icon'

const navItems: Array<{ href: string; label: string; icon: BrandIconName }> = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { href: '/admin/products', label: 'Productos', icon: 'package' },
  { href: '/admin/orders', label: 'Órdenes', icon: 'shopping-bag' },
  { href: '/admin/customers', label: 'Clientes', icon: 'users' },
  { href: '/admin/reviews', label: 'Reseñas', icon: 'review' },
  { href: '/admin/testimonials', label: 'Testimonios', icon: 'message' },
  { href: '/admin/coupons', label: 'Cupones', icon: 'coupon' },
  { href: '/admin/hero', label: 'Hero Slides', icon: 'image' },
  { href: '/admin/settings', label: 'Configuración', icon: 'settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="min-h-screen w-56 border-r border-[var(--color-border)] bg-white">
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'border-l-2 border-[#c9a0a0] bg-[#f0e0e0] text-[#a07070]'
                  : 'text-gray-600 hover:bg-[var(--color-surface)]'
              }`}
            >
              <BrandIcon name={item.icon} className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
