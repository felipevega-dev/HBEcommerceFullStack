import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, protectMutation, requireAdminAuth } from '@/lib/api-utils'
import { approveInstagramPost, processInstagramPost } from '@/lib/instagram-automation'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:instagram:publish',
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const { id } = await params
    await approveInstagramPost(id)
    const post = await processInstagramPost(id)
    return NextResponse.json({ success: true, post })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
