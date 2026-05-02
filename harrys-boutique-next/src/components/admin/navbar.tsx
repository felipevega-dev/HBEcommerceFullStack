'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import type { Role } from '@prisma/client'
import { BrandIcon } from '@/components/ui/brand-icon'

interface Props {
  user: { name?: string | null; email?: string | null; role: Role }
}

export function AdminNavbar({ user }: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-white px-6">
      <Link href="/admin/dashboard" className="flex-shrink-0">
        <Image
          src="/harrys_logo.png"
          alt="Harry's Boutique"
          width={100}
          height={100}
          className="object-contain"
        />
      </Link>
      <div className="flex items-center gap-4 text-sm text-gray-600">
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
