import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'
import { createManualInstagramPost } from '@/lib/instagram-automation'

const manualPostSchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().url(),
  instagramUrl: z.string().url().optional().nullable(),
  altText: z.string().max(160).optional().nullable(),
  homeCaption: z.string().max(500).optional().nullable(),
  likes: z.number().int().min(0).optional().nullable(),
  homeVisible: z.boolean().optional(),
  homeOrder: z.number().int().min(0).max(9999).optional(),
  sourceDescription: z.string().optional().nullable(),
  captionDraft: z.string().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:instagram:manual',
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, manualPostSchema)
  if (validationError) return validationError

  try {
    const post = await createManualInstagramPost(data!)
    return NextResponse.json({ success: true, post }, { status: 201 })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
