const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const bcrypt = require('bcryptjs')
  const hash = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@tableboost.app' },
    update: { password: hash, role: 'SUPER_ADMIN', name: 'Admin' },
    create: { email: 'admin@tableboost.app', password: hash, name: 'Admin', role: 'SUPER_ADMIN' }
  })
  console.log('USER KREIRAN:', user.email, user.role)
}
main().finally(()=>prisma.$disconnect())
