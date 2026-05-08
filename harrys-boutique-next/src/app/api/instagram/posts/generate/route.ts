import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'
import { generateInstagramDrafts } from '@/lib/instagram-automation'

const generateSchema = z.object({
  count: z.number().int().min(1).max(10).default(1),
})

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:instagram:generate',
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, generateSchema)
  if (validationError) return validationError

  try {
    const posts = await generateInstagramDrafts(data?.count ?? 1)
    return NextResponse.json({
      success: true,
      posts,
      created: posts.length,
      message:
        posts.length > 0
          ? undefined
          : 'No hay productos elegibles nuevos para generar publicaciones',
    })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
