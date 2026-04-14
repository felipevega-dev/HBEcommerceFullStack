import type { Metadata } from 'next'
import { LoginPageClient } from '@/components/store/login-page-client'

export const metadata: Metadata = {
  title: "Iniciar sesión — Harry's Boutique",
  robots: { index: false },
}

export default function LoginPage() {
  return <LoginPageClient />
}
