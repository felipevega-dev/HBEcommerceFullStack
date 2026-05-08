import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError, requireAdminAuth, validateBody } from '@/lib/api-utils'
import { updateInstagramPostDraft } from '@/lib/instagram-automation'

const updatePostSchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().url(),
  sourceDescription: z.string().optional().nullable(),
  captionDraft: z.string().optional().nullable(),
  finalCaption: z.string().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const { data, error: validationError } = await validateBody(req, updatePostSchema)
  if (validationError) return validationError

  try {
    const { id } = await params
    const post = await updateInstagramPostDraft(id, data!)
    return NextResponse.json({ success: true, post })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
