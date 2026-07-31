import { NextResponse } from 'next/server'
import { getCurrentUser, getImpersonateId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRestaurantId } from '@/lib/getRestaurantId'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const impId = await await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if (!restaurantId) return NextResponse.json({ error: 'No restaurant' }, { status: 400 })
  const categories = await prisma.menuCategory.findMany({ where: { restaurantId }, include: { items: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } })
  return NextResponse.json({ categories })
}
