import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['OWNER', 'ADMIN', 'MODERATOR']
const PROTECTED_ROUTES = ['/checkout', '/orders', '/profile', '/wishlist']
const ADMIN_ROUTES = ['/admin']

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const pathname = nextUrl.pathname

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))

  if (isAdminRoute) {
    if (!session?.user) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url),
      )
    }
    if (!ADMIN_ROLES.includes(session.user.role)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (isProtectedRoute && !session?.user) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url),
    )
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/wishlist/:path*',
  ],
}
