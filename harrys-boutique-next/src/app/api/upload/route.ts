import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { handleApiError, requireAdminAuth } from '@/lib/api-utils'

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const formData = await req.formData()
    const files = formData.getAll('images') as File[]

    if (!files.length) {
      return NextResponse.json(
        { success: false, message: 'No se proporcionaron imágenes' },
        { status: 400 },
      )
    }

    // Upload files to Vercel Blob Storage
    const uploadPromises = files.map(async (file) => {
      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const filename = `products/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      // Upload to Vercel Blob (works with both public and private stores)
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true,
      })

      return blob.url
    })

    const urls = await Promise.all(uploadPromises)
    return NextResponse.json({ success: true, urls })
  } catch (e) {
    return handleApiError(e)
  }
}
