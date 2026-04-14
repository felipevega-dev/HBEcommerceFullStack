import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const EMAIL = process.argv[2] || 'admin@harrys.com'
const PASSWORD = process.argv[3] || 'Admin1234!'
const NAME = process.argv[4] || 'Admin'

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } })

  if (existing) {
    // Already exists — just promote to OWNER
    await prisma.user.update({
      where: { email: EMAIL },
      data: { role: 'OWNER' },
    })
    console.log(`✓ Usuario existente "${EMAIL}" actualizado a OWNER`)
    return
  }

  const hashed = await bcrypt.hash(PASSWORD, 10)
  const user = await prisma.user.create({
    data: {
      name: NAME,
      email: EMAIL,
      password: hashed,
      role: 'OWNER',
    },
  })

  console.log(`✓ Admin creado:`)
  console.log(`  Email:    ${user.email}`)
  console.log(`  Password: ${PASSWORD}`)
  console.log(`  Role:     ${user.role}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
