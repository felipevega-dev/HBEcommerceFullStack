import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, protectMutation, requireAdminAuth } from '@/lib/api-utils'
import { testInstagramConnection } from '@/lib/instagram-automation'

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:instagram:test',
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const account = await testInstagramConnection()
    return NextResponse.json({ success: true, account })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
