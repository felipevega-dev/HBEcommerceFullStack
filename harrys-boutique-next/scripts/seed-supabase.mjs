import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { PrismaClient, Role } from '@prisma/client'

const DEFAULT_ADMIN_EMAIL = 'admin@harrys-boutique.com'
const DEFAULT_ADMIN_NAME = 'Admin'
const DEFAULT_ADMIN_PASSWORD = 'HarrysBoutique!2026'
const ADMIN_ROLES = new Set([Role.OWNER, Role.ADMIN, Role.MODERATOR])

const targetDatabaseUrl = process.env.DATABASE_URL?.trim()
if (!targetDatabaseUrl) {
  throw new Error('DATABASE_URL is required')
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: targetDatabaseUrl,
    },
  },
})

const snapshotUrl = new URL('./seed-snapshot.json', import.meta.url)

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must have at least 12 characters')
  }
  return password
}

function getAdminRole() {
  const role = process.env.ADMIN_ROLE?.trim().toUpperCase() || Role.OWNER
  if (!ADMIN_ROLES.has(role)) {
    throw new Error('ADMIN_ROLE must be OWNER, ADMIN or MODERATOR')
  }
  return role
}

function toDate(value) {
  return value ? new Date(value) : null
}

async function loadSnapshot() {
  const rawSnapshot = await readFile(snapshotUrl, 'utf8')
  const snapshot = JSON.parse(rawSnapshot)

  if (!snapshot?.categories || !snapshot?.users || !snapshot?.products) {
    throw new Error('seed snapshot is missing categories, users or products')
  }

  return snapshot
}

async function truncateTarget() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "products", "categories", "users" RESTART IDENTITY CASCADE',
  )
}

async function importCategories(categories) {
  for (const category of categories) {
    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        subcategories: category.subcategories,
        createdAt: toDate(category.createdAt) ?? undefined,
      },
    })
  }
}

async function importUsers(users) {
  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        profileImage: user.profileImage,
        tags: user.tags ?? [],
        createdAt: toDate(user.createdAt) ?? undefined,
        updatedAt: toDate(user.updatedAt) ?? undefined,
      },
    })
  }
}

async function importProducts(products) {
  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        slug: product.slug,
        sku: product.sku,
        name: product.name,
        description: product.description,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images ?? [],
        categoryId: product.categoryId,
        subCategory: product.subCategory,
        colors: product.colors ?? [],
        sizes: product.sizes,
        bestSeller: product.bestSeller,
        active: product.active,
        stock: product.stock,
        ratingAverage: product.ratingAverage ?? 0,
        ratingCount: product.ratingCount ?? 0,
        createdAt: toDate(product.createdAt) ?? undefined,
        updatedAt: toDate(product.updatedAt) ?? undefined,
      },
    })
  }
}

async function ensureAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || DEFAULT_ADMIN_EMAIL
  const adminName = process.env.ADMIN_NAME?.trim() || DEFAULT_ADMIN_NAME
  const adminPassword = getAdminPassword()
  const adminRole = getAdminRole()
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: adminRole,
    },
    update: {
      name: adminName,
      password: hashedPassword,
      role: adminRole,
    },
  })

  return { email: adminEmail, name: adminName, role: adminRole }
}

async function main() {
  const snapshot = await loadSnapshot()

  await prisma.$queryRaw`SELECT 1 AS ok`
  await truncateTarget()

  await importCategories(snapshot.categories)
  await importUsers(snapshot.users)
  const admin = await ensureAdmin()
  await importProducts(snapshot.products)

  console.log(
    JSON.stringify(
      {
        source: snapshot.source,
        exportedAt: snapshot.exportedAt,
        imported: {
          categories: snapshot.categories.length,
          users: snapshot.users.length,
          products: snapshot.products.length,
        },
        admin,
        snapshot: fileURLToPath(snapshotUrl),
      },
      null,
      2,
    ),
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
