const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const r = await prisma.restaurant.upsert({
    where: { slug: 'konoba-kastela' },
    update: {},
    create: {
      name: 'Konoba Kaštela',
      slug: 'konoba-kastela',
      email: 'info@konoba-kastela.hr',
      address: 'Kaštel Stari',
      categories: {
        create: [
          {
            name: 'Predjela',
            order: 1,
            items: {
              create: [
                { name: 'Pršut i sir', price: 9.5, description: 'Dalmatinski pršut, paški sir' },
                { name: 'Bruschetta', price: 5.5, description: 'Rajčica, bosiljak' }
              ]
            }
          },
          {
            name: 'Glavna jela',
            order: 2,
            items: {
              create: [
                { name: 'Peka', price: 18, description: 'Teletina, krumpir' },
                { name: 'Brancin na zaru', price: 16, description: 'Divlji brancin, blitva' }
              ]
            }
          }
        ]
      }
    }
  })
  console.log('KREIRAN:', r.slug)
}
main().finally(()=>process.exit())
