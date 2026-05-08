import { NextResponse } from 'next/server'
import { handleApiError, requireAdminAuth } from '@/lib/api-utils'
import { skipInstagramPost } from '@/lib/instagram-automation'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const { id } = await params
    const post = await skipInstagramPost(id)
    return NextResponse.json({ success: true, post })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
