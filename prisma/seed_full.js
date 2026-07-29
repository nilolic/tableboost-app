const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()
async function main() {
  const hashedPassword = await bcrypt.hash('TableBoost123!', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tableboost.hr' },
    update: {},
    create: { email: 'admin@tableboost.hr', password: hashedPassword, name: 'Super Admin', role: 'SUPER_ADMIN' },
  })
  console.log('Super admin:', admin.email)
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'konoba-test' },
    update: {},
    create: { name: 'Konoba Test', slug: 'konoba-test' },
  })
  console.log('Restaurant:', restaurant.slug)
  for (let i = 1; i <= 5; i++) {
    await prisma.table.upsert({
      where: { qrSlug: `konoba-test-table-${i}` },
      update: {},
      create: { number: i, qrSlug: `konoba-test-table-${i}`, restaurantId: restaurant.id },
    })
  }
  console.log('Seed gotov!')
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
