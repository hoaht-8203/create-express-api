import bcrypt from 'bcrypt'
import { prisma } from '../src/config/prisma'

async function main() {
  console.log('Start seeding...')

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN'
    }
  })
  console.log(`Role created or found: ${adminRole.name}`)

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER'
    }
  })
  console.log(`Role created or found: ${userRole.name}`)

  // Create Users
  const passwordHash = await bcrypt.hash('hoaht@123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'hoaht@pfm.com' },
    update: {},
    create: {
      email: 'hoaht@pfm.com',
      name: 'Hoàng Trung Hòa',
      password: passwordHash,
      roleId: adminRole.id
    }
  })
  console.log(`User created or found: ${admin.email}`)

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Normal User',
      password: passwordHash,
      roleId: userRole.id
    }
  })
  console.log(`User created or found: ${normalUser.email}`)

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
