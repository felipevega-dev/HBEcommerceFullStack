import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  CLOUDINARY_NAME: z.string().min(1, 'CLOUDINARY_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_SECRET_KEY: z.string().min(1, 'CLOUDINARY_SECRET_KEY is required'),
  MERCADOPAGO_ACCESS_TOKEN: z.string().min(1, 'MERCADOPAGO_ACCESS_TOKEN is required'),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().min(1, 'MERCADOPAGO_WEBHOOK_SECRET is required'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  NEXT_PUBLIC_FRONTEND_URL: z.string().url('NEXT_PUBLIC_FRONTEND_URL must be a valid URL'),
})

type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const missing = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    console.error('\n❌ Missing or invalid environment variables:\n' + missing.join('\n') + '\n')
    process.exit(1)
  }

  return result.data
}

// Only validate on server side
export const env = typeof window === 'undefined' ? validateEnv() : (process.env as unknown as Env)
