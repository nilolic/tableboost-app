import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { translateText } from '@/lib/deepl'
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role!== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { restaurantId, targetLang, overwrite } = await req.json()
  if (!targetLang ||!['EN','DE'].includes(targetLang)) return NextResponse.json({ error: 'targetLang mora biti EN ili DE' }, { status: 400 })
  const where: any = {}
  if (restaurantId) where.restaurantId = restaurantId
  const categories = await prisma.menuCategory.findMany({ where })
  const items = await prisma.menuItem.findMany({ where })
  let translated = 0
  const field = targetLang === 'EN'? 'En' : 'De'
  for (const cat of categories) {
    const current = (cat as any)[`name${field}`]
    if (!overwrite && current) continue
    if (!cat.name) continue
    try { const t = await translateText(cat.name, targetLang as any, 'HR'); await prisma.menuCategory.update({ where: { id: cat.id }, data: { [`name${field}`]: t } as any }); translated++; await new Promise(r => setTimeout(r, 250)) } catch (e) { console.error(e) }
  }
  for (const item of items) {
    try {
      if ((overwrite ||!(item as any)[`name${field}`]) && item.name) {
        const t = await translateText(item.name, targetLang as any, 'HR'); await prisma.menuItem.update({ where: { id: item.id }, data: { [`name${field}`]: t } as any }); await new Promise(r => setTimeout(r, 250))
      }
      if ((overwrite ||!(item as any)[`description${field}`]) && item.description) {
        const t = await translateText(item.description, targetLang as any, 'HR'); await prisma.menuItem.update({ where: { id: item.id }, data: { [`description${field}`]: t } as any }); await new Promise(r => setTimeout(r, 250))
      }
      translated++
    } catch (e) { console.error(e) }
  }
  return NextResponse.json({ ok: true, translated })
}
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role!== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const stats: any = await prisma.$queryRaw`SELECT r.id, r.name, r.slug, (SELECT COUNT(*) FROM "MenuCategory" WHERE "restaurantId"=r.id) as cat_count, (SELECT COUNT(*) FROM "MenuItem" WHERE "restaurantId"=r.id) as item_count, (SELECT COUNT(*) FROM "MenuItem" WHERE "restaurantId"=r.id AND "nameEn" IS NULL) as missing_en, (SELECT COUNT(*) FROM "MenuItem" WHERE "restaurantId"=r.id AND "nameDe" IS NULL) as missing_de FROM "Restaurant" r`
  return NextResponse.json({ stats })
}
