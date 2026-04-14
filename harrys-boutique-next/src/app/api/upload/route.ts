import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { handleApiError, requireAdminAuth } from '@/lib/api-utils'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
})

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

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

      const result = await cloudinary.uploader.upload(base64, {
        resource_type: 'image',
        folder: 'harrys-boutique/products',
        transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }],
      })

      return result.secure_url
    })

    const urls = await Promise.all(uploadPromises)
    return NextResponse.json({ success: true, urls })
  } catch (e) {
    return handleApiError(e)
  }
}
