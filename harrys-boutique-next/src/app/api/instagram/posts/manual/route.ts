import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError, requireAdminAuth, validateBody } from '@/lib/api-utils'
import { createManualInstagramPost } from '@/lib/instagram-automation'

const manualPostSchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().url(),
  sourceDescription: z.string().optional().nullable(),
  captionDraft: z.string().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const { data, error: validationError } = await validateBody(req, manualPostSchema)
  if (validationError) return validationError

  try {
    const post = await createManualInstagramPost(data!)
    return NextResponse.json({ success: true, post }, { status: 201 })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
