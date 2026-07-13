import { prisma } from '../src/lib/prisma'

const LISTING = {
  itemId: 'MLC4144018020',
  status: 'ACTIVE' as const,
  url: 'https://www.mercadolibre.cl/poleron-para-perro-thundercats-con-capucha-rojo---negro/up/MLCU4196933505?pdp_filters=item_id:MLC4144018020',
}

const args = new Set(process.argv.slice(2))
const productIdIndex = process.argv.indexOf('--product-id')
const productId = productIdIndex >= 0 ? process.argv[productIdIndex + 1] : undefined
const shouldApply = args.has('--apply')

async function main() {
  if (!productId) {
    const candidates = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'thundercats', mode: 'insensitive' } },
          { description: { contains: 'thundercats', mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, slug: true, active: true },
      take: 20,
    })
    console.log(
      JSON.stringify(
        { dryRun: true, candidates, usage: 'pass --product-id <uuid> [--apply]' },
        null,
        2,
      ),
    )
    return
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      slug: true,
      mercadoLibreUrl: true,
      mercadoLibreItemId: true,
      mercadoLibreStatus: true,
    },
  })
  if (!product) throw new Error('PRODUCT_NOT_FOUND')

  const nextValue = { ...product, ...LISTING }
  if (!shouldApply) {
    console.log(JSON.stringify({ dryRun: true, current: product, next: nextValue }, null, 2))
    return
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      mercadoLibreUrl: LISTING.url,
      mercadoLibreItemId: LISTING.itemId,
      mercadoLibreStatus: LISTING.status,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      mercadoLibreUrl: true,
      mercadoLibreItemId: true,
      mercadoLibreStatus: true,
    },
  })
  console.log(JSON.stringify({ applied: true, product: updated }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
