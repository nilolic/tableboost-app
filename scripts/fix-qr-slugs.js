const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function genSlug() {
  // 10 znakova, nemoguće pogoditi npr. 7k9x2aPq8Z
  return crypto.randomBytes(7).toString('base64url');
}

async function main() {
  const tables = await prisma.table.findMany({ include: { restaurant: true } });
  console.log(`Ukupno stolova: ${tables.length}`);
  
  for (const t of tables) {
    const insecure = !t.qrSlug || /^\d+$/.test(t.qrSlug) || t.qrSlug.length < 8;
    if (insecure) {
      const newSlug = genSlug();
      console.log(`FIX: ${t.restaurant.slug} | Stol ${t.number} | ${t.qrSlug} -> ${newSlug}`);
      await prisma.table.update({ where: { id: t.id }, data: { qrSlug: newSlug } });
    }
  }

  const all = await prisma.table.findMany({ include: { restaurant: true }, orderBy: [{ restaurantId: 'asc' }, { number: 'asc' }] });
  console.log("\n--- QR LINKOVI ZA PRINTANJE ---");
  for (const t of all) {
    console.log(`Stol ${t.number} @ ${t.restaurant.name} => https://tableboost.app/menu/${t.qrSlug}`);
  }
}
main().catch(e=>{console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect());
