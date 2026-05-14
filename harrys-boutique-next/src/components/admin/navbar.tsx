'use client'

import { signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import type { Role } from '@prisma/client'
import { BrandIcon } from '@/components/ui/brand-icon'

interface Props {
  user: { name?: string | null; email?: string | null; role: Role }
}

export function AdminNavbar({ user }: Props) {
  return (
    <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-4 py-2 md:px-6">
      <Link href="/admin/dashboard" className="flex-shrink-0">
        <Image
          src="/harrys_logo.png"
          alt="Harry's Boutique"
          width={100}
          height={100}
          className="object-contain"
        />
      </Link>
      <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-gray-600">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-blue-600 transition-colors hover:text-black"
        >
          <BrandIcon name="external-link" className="h-4 w-4" />
          Ver tienda
        </Link>
        <span>
          {user.name} ({user.role})
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1.5 transition-colors hover:text-black"
        >
          <BrandIcon name="logout" className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
