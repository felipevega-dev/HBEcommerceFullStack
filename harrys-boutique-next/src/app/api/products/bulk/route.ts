import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAdminAuth, validateBody } from '@/lib/api-utils'

const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  active: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  stock: z.number().int().min(0).optional(),
  price: z.number().positive().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
})

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const { data, error: validationError } = await validateBody(req, bulkUpdateSchema)
  if (validationError) return validationError

  try {
    const { ids, active, bestSeller, stock, price, discountPercent } = data!

    // Build update data
    const updateData: any = {}
    
    if (active !== undefined) updateData.active = active
    if (bestSeller !== undefined) updateData.bestSeller = bestSeller
    if (stock !== undefined) updateData.stock = stock
    
    // Handle price updates
    if (price !== undefined) {
      updateData.price = price
    }
    
    // Handle discount application
    if (discountPercent !== undefined) {
      // Get current products to calculate new prices
      const products = await prisma.product.findMany({
        where: { id: { in: ids } },
        select: { id: true, price: true },
      })

      // Update each product with discounted price
      const updatePromises = products.map((product) => {
        const currentPrice = Number(product.price)
        const discountedPrice = currentPrice * (1 - discountPercent / 100)
        
        return prisma.product.update({
          where: { id: product.id },
          data: {
            originalPrice: currentPrice,
            price: discountedPrice,
          },
        })
      })

      await Promise.all(updatePromises)

      return NextResponse.json({
        success: true,
        updated: products.length,
        message: `Descuento del ${discountPercent}% aplicado a ${products.length} productos`,
      })
    }

    // Standard bulk update
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      updated: result.count,
      message: `${result.count} productos actualizados`,
    })
  } catch (e) {
    return handleApiError(e)
  }
}
