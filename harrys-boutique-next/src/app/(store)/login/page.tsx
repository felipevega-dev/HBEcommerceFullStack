import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginPageClient } from '@/components/store/login-page-client'

export const metadata: Metadata = {
  title: "Iniciar sesión — Harry's Boutique",
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginPageClient />
    </Suspense>
  )
}
