import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getSession, handleApiError, protectMutation, requireAdminAuth } from '@/lib/api-utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function hasValidImageSignature(type: string, bytes: Uint8Array) {
  if (type === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }

  if (type === 'image/png') {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    )
  }

  if (type === 'image/webp') {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    )
  }

  return false
}

async function validateImages(files: File[]) {
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error('Solo se permiten imagenes JPG, PNG o WEBP')
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Cada imagen debe pesar menos de 5MB')
    }

    const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    if (!hasValidImageSignature(file.type, signature)) {
      throw new Error('El archivo no coincide con un formato de imagen permitido')
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const protectionError = await protectMutation(req, {
      keyPrefix: 'upload:image',
      maxRequests: 20,
      windowMs: 10 * 60 * 1000,
    })
    if (protectionError) return protectionError

    const formData = await req.formData()
    const multipleFiles = formData
      .getAll('images')
      .filter((value): value is File => value instanceof File)
    const singleFile = formData.get('file')

    if (multipleFiles.length > 0) {
      const { error } = await requireAdminAuth()
      if (error) return error

      await validateImages(multipleFiles)

      const uploadPromises = multipleFiles.map(async (file) => {
        const timestamp = Date.now()
        const filename = `products/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        const blob = await put(filename, file, {
          access: 'public',
          addRandomSuffix: true,
        })

        return blob.url
      })

      const urls = await Promise.all(uploadPromises)
      return NextResponse.json({ success: true, urls, url: urls[0] ?? null })
    }

    if (!(singleFile instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'No se proporcionaron imágenes' },
        { status: 400 },
      )
    }

    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 })
    }

    await validateImages([singleFile])

    const timestamp = Date.now()
    const filename = `profiles/${session.user.id}/${timestamp}-${singleFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const blob = await put(filename, singleFile, {
      access: 'public',
      addRandomSuffix: true,
    })

    return NextResponse.json({ success: true, url: blob.url, urls: [blob.url] })
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({ success: false, message: e.message }, { status: 400 })
    }

    return handleApiError(e)
  }
}
