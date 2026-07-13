import type { NextConfig } from 'next'
import path from 'path'

const productionUrl = process.env.NEXTAUTH_URL ?? ''
const allowedOrigins = ['localhost:3000', 'localhost:3001']
const scriptSrc =
  process.env.NODE_ENV === 'production'
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://ui-avatars.com https://res.cloudinary.com https://images.unsplash.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  scriptSrc,
  "connect-src 'self' https://api.mercadopago.com https://graph.facebook.com https://*.upstash.io https://*.upstash.com",
  "worker-src 'self' blob:",
].join('; ')

if (productionUrl) {
  try {
    const { host } = new URL(productionUrl)
    if (host && !allowedOrigins.includes(host)) {
      allowedOrigins.push(host)
    }
  } catch {
    // Invalid URL — skip
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins },
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
