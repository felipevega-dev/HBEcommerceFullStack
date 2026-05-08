import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'
import {
  ensureInstagramAutomationSettings,
  updateInstagramAutomationSettings,
} from '@/lib/instagram-automation'

const settingsSchema = z.object({
  enabled: z.boolean(),
  timezone: z.string().min(1),
  dailyHour: z.number().int().min(0).max(23),
  dailyMinute: z.number().int().min(0).max(59),
  sourceType: z.string().min(1),
  captionTemplate: z.string().min(1),
  fallbackHashtags: z.string(),
  maxDailyPosts: z.number().int().min(1).max(10),
  requireManualApproval: z.boolean(),
})

export async function GET() {
  try {
    const settings = await ensureInstagramAutomationSettings()
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:instagram:settings',
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, settingsSchema)
  if (validationError) return validationError

  try {
    const settings = await updateInstagramAutomationSettings(data!)
    return NextResponse.json({ success: true, settings })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
