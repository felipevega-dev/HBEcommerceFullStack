import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAdminAuth } from '@/lib/api-utils'

const DEFAULT_SETTINGS = [
  { key: 'store_name', value: "Harry's Boutique", description: 'Nombre de la tienda' },
  { key: 'shipping_fee', value: '10', description: 'Costo de envío base' },
  { key: 'free_shipping_threshold', value: '0', description: 'Monto mínimo para envío gratis' },
  { key: 'currency', value: '$', description: 'Símbolo de moneda' },
]

export async function GET() {
  try {
    const count = await prisma.settings.count()
    if (count === 0) {
      await prisma.settings.createMany({ data: DEFAULT_SETTINGS })
    }
    const settings = await prisma.settings.findMany()
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    return NextResponse.json({ success: true, settings: map })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const updates: Record<string, string> = await req.json()
    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.settings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        }),
      ),
    )
    const settings = await prisma.settings.findMany()
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    return NextResponse.json({ success: true, settings: map })
  } catch (e) {
    return handleApiError(e)
  }
}
