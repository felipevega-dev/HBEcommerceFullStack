import type { NextConfig } from 'next'
import path from 'path'

const productionUrl = process.env.NEXTAUTH_URL ?? ''
const allowedOrigins = ['localhost:3000', 'localhost:3001']

// Add production domain to allowed origins if set
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
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      // Legacy Cloudinary images (for backward compatibility with old products)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
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
