/**
 * Migration script: MongoDB → PostgreSQL
 *
 * Usage:
 *   npx tsx scripts/migrate-from-mongo.ts
 */

import { MongoClient, ObjectId } from 'mongodb'
import { PrismaClient, Role, OrderStatus } from '@prisma/client'
import { v5 as uuidv5 } from 'uuid'
import 'dotenv/config'

const prisma = new PrismaClient()

const MONGO_UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

function toUuid(objectId: string | ObjectId): string {
  return uuidv5(objectId.toString(), MONGO_UUID_NAMESPACE)
}

// ─── Report ───────────────────────────────────────────────────────────────────

interface Report {
  collection: string
  read: number
  inserted: number
  skipped: number
  errors: Array<{ id: string; error: string }>
}

const reports: Report[] = []

function createReport(collection: string): Report {
  const r: Report = { collection, read: 0, inserted: 0, skipped: 0, errors: [] }
  reports.push(r)
  return r
}

function printReport() {
  console.log('\n' + '═'.repeat(60))
  console.log('MIGRATION REPORT')
  console.log('═'.repeat(60))
  for (const r of reports) {
    console.log(`\n📦 ${r.collection}`)
    console.log(`   Read:     ${r.read}`)
    console.log(`   Inserted: ${r.inserted}`)
    console.log(`   Skipped:  ${r.skipped}`)
    if (r.errors.length > 0) {
      console.log(`   Errors:   ${r.errors.length}`)
      r.errors.slice(0, 5).forEach((e) => console.log(`     - ${e.id}: ${e.error}`))
      if (r.errors.length > 5) console.log(`     ... and ${r.errors.length - 5} more`)
    }
  }
  console.log('\n' + '═'.repeat(60))
}

// ─── Migration functions ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>

async function migrateCategories(db: import('mongodb').Db) {
  const report = createReport('categories')
  const docs = (await db.collection('categories').find({}).toArray()) as Doc[]
  report.read = docs.length
  console.log(`  Found ${docs.length} categories in MongoDB`)

  for (const doc of docs) {
    try {
      const id = toUuid(doc._id)
      await prisma.category.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name: doc.name as string,
          subcategories: (doc.subcategories as string[]) ?? [],
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        },
      })
      report.inserted++
    } catch (e) {
      report.errors.push({ id: doc._id.toString(), error: String(e) })
    }
  }
}

async function migrateProducts(db: import('mongodb').Db) {
  const report = createReport('products')
  const docs = (await db.collection('products').find({}).toArray()) as Doc[]
  report.read = docs.length
  console.log(`  Found ${docs.length} products in MongoDB`)

  for (const doc of docs) {
    try {
      const id = toUuid(doc._id)

      // Find category by name in PostgreSQL
      const category = await prisma.category.findFirst({
        where: { name: doc.category as string },
      })

      if (!category) {
        // Create category on the fly if it doesn't exist
        const catId = toUuid(new ObjectId().toString())
        await prisma.category.upsert({
          where: { name: doc.category as string },
          update: {},
          create: {
            id: catId,
            name: doc.category as string,
            subcategories: doc.subCategory ? [doc.subCategory as string] : [],
          },
        })
      }

      const finalCategory = await prisma.category.findFirst({
        where: { name: doc.category as string },
      })

      if (!finalCategory) {
        report.errors.push({
          id: doc._id.toString(),
          error: `Could not find/create category: ${doc.category}`,
        })
        report.skipped++
        continue
      }

      await prisma.product.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name: doc.name as string,
          description: (doc.description as string) || '',
          price: Number(doc.price),
          images: (doc.images as string[]) ?? [],
          categoryId: finalCategory.id,
          subCategory: (doc.subCategory as string) || '',
          colors: (doc.colors as string[]) ?? [],
          sizes: doc.sizes ?? [],
          bestSeller: Boolean(doc.bestSeller),
          ratingAverage: Number(doc.rating?.average ?? 0),
          ratingCount: Number(doc.rating?.count ?? 0),
          createdAt: doc.date ? new Date(doc.date) : new Date(),
        },
      })
      report.inserted++
    } catch (e) {
      report.errors.push({ id: doc._id.toString(), error: String(e) })
    }
  }
}

async function migrateUsers(db: import('mongodb').Db) {
  const report = createReport('users')
  const docs = (await db.collection('users').find({}).toArray()) as Doc[]
  report.read = docs.length
  console.log(`  Found ${docs.length} users in MongoDB`)

  for (const doc of docs) {
    try {
      const id = toUuid(doc._id)

      await prisma.user.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name: (doc.name as string) || 'Usuario',
          email: doc.email as string,
          password: doc.password as string,
          role: (doc.role as Role) ?? Role.USER,
          profileImage: doc.profileImage as string | undefined,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
        },
      })

      // Migrate billing addresses
      const addresses = (doc.billingAddresses as Doc[]) ?? []
      for (const addr of addresses) {
        await prisma.address
          .create({
            data: {
              userId: id,
              firstname: (addr.firstname as string) ?? '',
              lastname: (addr.lastname as string) ?? '',
              phone: (addr.phone as string) ?? '',
              street: (addr.street as string) ?? '',
              city: (addr.city as string) ?? '',
              region: (addr.region as string) ?? '',
              postalCode: (addr.postalCode as string) ?? '',
              country: (addr.country as string) ?? '',
              isDefault: Boolean(addr.isDefault),
            },
          })
          .catch(() => {})
      }

      // Migrate cartData
      const cartData = doc.cartData as Record<string, Record<string, number>> | undefined
      if (cartData && Object.keys(cartData).length > 0) {
        const cart = await prisma.cart.upsert({
          where: { userId: id },
          update: {},
          create: { userId: id },
        })

        for (const [productMongoId, sizes] of Object.entries(cartData)) {
          const productId = toUuid(productMongoId)
          const productExists = await prisma.product.findUnique({ where: { id: productId } })
          if (!productExists) continue

          for (const [size, quantity] of Object.entries(sizes as Record<string, number>)) {
            if (Number(quantity) > 0) {
              await prisma.cartItem
                .create({
                  data: { cartId: cart.id, productId, quantity: Number(quantity), size },
                })
                .catch(() => {})
            }
          }
        }
      }

      report.inserted++
    } catch (e) {
      report.errors.push({ id: doc._id.toString(), error: String(e) })
    }
  }
}

async function migrateOrders(db: import('mongodb').Db) {
  const report = createReport('orders')
  const docs = (await db.collection('orders').find({}).toArray()) as Doc[]
  report.read = docs.length
  console.log(`  Found ${docs.length} orders in MongoDB`)

  const statusMap: Record<string, OrderStatus> = {
    pending: OrderStatus.PENDING,
    processing: OrderStatus.PROCESSING,
    shipped: OrderStatus.SHIPPED,
    delivered: OrderStatus.DELIVERED,
  }

  for (const doc of docs) {
    try {
      const id = toUuid(doc._id)
      const userId = toUuid(doc.userId.toString())

      const userExists = await prisma.user.findUnique({ where: { id: userId } })
      if (!userExists) {
        report.errors.push({ id: doc._id.toString(), error: `User not found: ${doc.userId}` })
        report.skipped++
        continue
      }

      const order = await prisma.order.upsert({
        where: { id },
        update: {},
        create: {
          id,
          userId,
          amount: Number(doc.amount),
          addressSnapshot: (doc.address as object) ?? {},
          status: statusMap[doc.status as string] ?? OrderStatus.PENDING,
          paymentMethod: (doc.paymentMethod as string) ?? 'COD',
          payment: Boolean(doc.payment),
          createdAt: doc.date ? new Date(doc.date) : new Date(),
        },
      })

      const items = (doc.items as Doc[]) ?? []
      for (const item of items) {
        const productId = item._id ? toUuid(item._id.toString()) : undefined
        await prisma.orderItem
          .create({
            data: {
              orderId: order.id,
              productId: productId ?? null,
              name: (item.name as string) ?? '',
              price: Number(item.price ?? 0),
              quantity: Number(item.quantity ?? 1),
              size: (item.size as string) ?? '',
              color: (item.color as string) ?? '',
              image: (item.images as string[])?.[0] ?? (item.image as string) ?? '',
            },
          })
          .catch(() => {})
      }

      report.inserted++
    } catch (e) {
      report.errors.push({ id: doc._id.toString(), error: String(e) })
    }
  }
}

async function migrateReviews(db: import('mongodb').Db) {
  const report = createReport('reviews')
  const docs = (await db.collection('reviews').find({}).toArray()) as Doc[]
  report.read = docs.length
  console.log(`  Found ${docs.length} reviews in MongoDB`)

  for (const doc of docs) {
    try {
      const id = toUuid(doc._id)
      const userId = toUuid(doc.userId.toString())
      const productId = toUuid(doc.productId.toString())

      const [userExists, productExists] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.product.findUnique({ where: { id: productId } }),
      ])

      if (!userExists || !productExists) {
        report.skipped++
        continue
      }

      await prisma.review.upsert({
        where: { userId_productId: { userId, productId } },
        update: {},
        create: {
          id,
          userId,
          productId,
          rating: Number(doc.rating),
          comment: (doc.comment as string) ?? '',
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        },
      })
      report.inserted++
    } catch (e) {
      report.errors.push({ id: doc._id.toString(), error: String(e) })
    }
  }
}

async function migrateSettings(db: import('mongodb').Db) {
  const report = createReport('settings')
  const docs = (await db.collection('settings').find({}).toArray()) as Doc[]
  report.read = docs.length
  console.log(`  Found ${docs.length} settings in MongoDB`)

  for (const doc of docs) {
    try {
      await prisma.settings.upsert({
        where: { key: doc.key as string },
        update: { value: String(doc.value) },
        create: {
          key: doc.key as string,
          value: String(doc.value),
          description: doc.description as string | undefined,
        },
      })
      report.inserted++
    } catch (e) {
      report.errors.push({ id: doc._id.toString(), error: String(e) })
    }
  }
}

async function migrateHeroSlides(db: import('mongodb').Db) {
  const report = createReport('heroslides')
  // Try both possible collection names
  const collections = await db.listCollections().toArray()
  const collectionNames = collections.map((c) => c.name)
  console.log('  Available collections:', collectionNames.join(', '))

  const collectionName =
    collectionNames.find(
      (n) => n.toLowerCase() === 'heroslides' || n.toLowerCase() === 'heroslide',
    ) ?? 'HeroSlides'

  const docs = (await db.collection(collectionName).find({}).toArray()) as Doc[]
  report.read = docs.length
  console.log(`  Found ${docs.length} hero slides in collection '${collectionName}'`)

  for (const doc of docs) {
    try {
      const id = toUuid(doc._id)
      const productId = toUuid(doc.productId.toString())

      const productExists = await prisma.product.findUnique({ where: { id: productId } })
      if (!productExists) {
        report.skipped++
        continue
      }

      await prisma.heroSlide.upsert({
        where: { id },
        update: {},
        create: {
          id,
          title: (doc.title as string) ?? '',
          subtitle: (doc.subtitle as string) ?? '',
          image: (doc.image as string) ?? '',
          productId,
          order: Number(doc.order ?? 0),
        },
      })
      report.inserted++
    } catch (e) {
      report.errors.push({ id: doc._id.toString(), error: String(e) })
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('❌ MONGO_URI is not set in .env')
    process.exit(1)
  }

  console.log('🚀 Starting migration: MongoDB → PostgreSQL\n')

  // Use native MongoDB driver — no Mongoose model naming issues
  const client = new MongoClient(mongoUri)
  await client.connect()
  console.log('✅ Connected to MongoDB')

  const db = client.db('Harrysboutique')

  // List all collections so we can debug
  const collections = await db.listCollections().toArray()
  console.log('\n📋 Collections found in MongoDB:')
  collections.forEach((c) => console.log(`   - ${c.name}`))
  console.log()

  await migrateCategories(db)
  console.log('✅ Categories done\n')

  await migrateProducts(db)
  console.log('✅ Products done\n')

  await migrateUsers(db)
  console.log('✅ Users done\n')

  await migrateOrders(db)
  console.log('✅ Orders done\n')

  await migrateReviews(db)
  console.log('✅ Reviews done\n')

  await migrateSettings(db)
  console.log('✅ Settings done\n')

  await migrateHeroSlides(db)
  console.log('✅ Hero slides done\n')

  // Validation
  console.log('🔍 PostgreSQL final counts:')
  const [users, products, orders, categories, reviews] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.category.count(),
    prisma.review.count(),
  ])
  console.log(`   Users:      ${users}`)
  console.log(`   Products:   ${products}`)
  console.log(`   Orders:     ${orders}`)
  console.log(`   Categories: ${categories}`)
  console.log(`   Reviews:    ${reviews}`)

  printReport()

  await client.close()
  await prisma.$disconnect()

  const totalErrors = reports.reduce((sum, r) => sum + r.errors.length, 0)
  if (totalErrors > 0) {
    console.log(`\n⚠️  Migration completed with ${totalErrors} errors.`)
    process.exit(1)
  } else {
    console.log('\n✅ Migration completed successfully!')
  }
}

main().catch((e) => {
  console.error('❌ Migration failed:', e)
  process.exit(1)
})
