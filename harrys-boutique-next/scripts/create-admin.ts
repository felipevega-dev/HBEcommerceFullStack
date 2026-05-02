import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

const ADMIN_ROLES: Role[] = [Role.OWNER, Role.ADMIN, Role.MODERATOR]

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const generatedPassword = !process.env.ADMIN_PASSWORD
  const password = process.env.ADMIN_PASSWORD ?? randomBytes(18).toString('base64url')
  const name = process.env.ADMIN_NAME?.trim() || 'Admin'
  const role = (process.env.ADMIN_ROLE as Role | undefined) || Role.OWNER

  if (!email) {
    throw new Error('Debes definir ADMIN_EMAIL.')
  }

  if (!ADMIN_ROLES.includes(role)) {
    throw new Error('ADMIN_ROLE debe ser OWNER, ADMIN o MODERATOR.')
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 12 caracteres.')
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      password: hashedPassword,
      role,
    },
    update: {
      name,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  console.log(`Admin listo: ${user.email} (${user.role})`)
  if (generatedPassword) {
    console.log(`Password temporal: ${password}`)
    console.log('Guárdalo ahora y cámbialo con el flujo de recuperación si lo necesitas.')
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
