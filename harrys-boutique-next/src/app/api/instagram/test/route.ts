import { NextResponse } from 'next/server'
import { handleApiError, requireAdminAuth } from '@/lib/api-utils'
import { testInstagramConnection } from '@/lib/instagram-automation'

export async function POST() {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const account = await testInstagramConnection()
    return NextResponse.json({ success: true, account })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
