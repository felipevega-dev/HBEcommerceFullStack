import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, protectMutation, requireAdminAuth } from '@/lib/api-utils'
import { skipInstagramPost } from '@/lib/instagram-automation'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:instagram:skip',
    maxRequests: 30,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const { id } = await params
    const post = await skipInstagramPost(id)
    return NextResponse.json({ success: true, post })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
