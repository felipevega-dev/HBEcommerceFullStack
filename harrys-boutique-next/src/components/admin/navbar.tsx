'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import type { Role } from '@prisma/client'

interface Props {
  user: { name?: string | null; email?: string | null; role: Role }
}

export function AdminNavbar({ user }: Props) {
  return (
    <header className="bg-white border-b border-[var(--color-border)] px-6 h-14 flex items-center justify-between">
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
          className="flex items-center gap-1.5 hover:text-black transition-colors text-blue-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Ver tienda
        </Link>
        <span>
          {user.name} ({user.role})
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1.5 hover:text-black transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
