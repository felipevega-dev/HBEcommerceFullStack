import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ResetPasswordPageClient } from '@/components/store/reset-password-page-client'

export const metadata: Metadata = {
  title: "Restablecer contraseña — Harry's Boutique",
  robots: { index: false },
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando...</div>}>
      <ResetPasswordPageClient />
    </Suspense>
  )
}
