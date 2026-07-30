import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getImpersonateId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
function getRestaurantId(user: any, impId: string | null) { if (user.role === 'SUPER_ADMIN' && impId) return impId; return user.restaurantId }
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const impId = getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if (!restaurantId) return NextResponse.json({ error: 'No restaurant' }, { status: 400 })
  const categories = await prisma.menuCategory.findMany({ where: { restaurantId }, include: { items: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } })
  return NextResponse.json({ categories })
}
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const impId = getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if (!restaurantId) return NextResponse.json({ error: 'No restaurant' }, { status: 400 })
  const body = await req.json()
  const { action } = body
  try {
    if (action === 'createCategory') {
      const { name, nameEn, nameDe } = body
      const count = await prisma.menuCategory.count({ where: { restaurantId } })
      const cat = await prisma.menuCategory.create({ data: { name, nameEn, nameDe, restaurantId, order: count } })
      return NextResponse.json(cat)
    }
    if (action === 'updateCategory') {
      const { id, name, nameEn, nameDe, order } = body
      const cat = await prisma.menuCategory.update({ where: { id }, data: { name, nameEn, nameDe,...(order!== undefined? { order } : {}) } })
      return NextResponse.json(cat)
    }
    if (action === 'deleteCategory') {
      const { id } = body
      await prisma.menuCategory.delete({ where: { id } })
      return NextResponse.json({ ok: true })
    }
    if (action === 'createItem') {
      const { name, nameEn, nameDe, description, descriptionEn, descriptionDe, price, categoryId, available, isBoosted, boostLevel } = body
      const count = await prisma.menuItem.count({ where: { categoryId } })
      const item = await prisma.menuItem.create({ data: { name, nameEn, nameDe, description, descriptionEn, descriptionDe, price: parseFloat(price), categoryId, restaurantId, order: count, available: available?? true, isBoosted: isBoosted?? false, boostLevel: boostLevel?? 0 } })
      return NextResponse.json(item)
    }
    if (action === 'updateItem') {
      const { id,...data } = body
      if (data.price) data.price = parseFloat(data.price)
      const item = await prisma.menuItem.update({ where: { id }, data: { name: data.name, nameEn: data.nameEn, nameDe: data.nameDe, description: data.description, descriptionEn: data.descriptionEn, descriptionDe: data.descriptionDe, price: data.price, categoryId: data.categoryId, available: data.available, isBoosted: data.isBoosted, boostLevel: data.boostLevel, order: data.order } })
      return NextResponse.json(item)
    }
    if (action === 'deleteItem') {
      const { id } = body
      await prisma.menuItem.delete({ where: { id } })
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) { console.error(e); return NextResponse.json({ error: e.message }, { status: 500 }) }
}
