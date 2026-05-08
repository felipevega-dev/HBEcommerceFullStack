import { NextResponse } from 'next/server'
import { handleApiError, requireAdminAuth } from '@/lib/api-utils'
import { approveInstagramPost, processInstagramPost } from '@/lib/instagram-automation'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const { id } = await params
    await approveInstagramPost(id)
    const post = await processInstagramPost(id)
    return NextResponse.json({ success: true, post })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
