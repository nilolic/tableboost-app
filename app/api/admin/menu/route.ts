import { NextResponse } from 'next/server'
import { getCurrentUser, getImpersonateId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRestaurantId } from '@/lib/getRestaurantId'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const impId = await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if (!restaurantId) return NextResponse.json({ error: 'No restaurant' }, { status: 400 })
  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId },
    include: { items: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' }
  })
  const items = categories.flatMap(c => c.items.map(i => ({...i, category: { name: c.name, id: c.id } })))
  return NextResponse.json({ categories, items })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  const impId = await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if (!user ||!restaurantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { name, price, description, categoryId, imageUrl, available, isBoosted, boostLevel, nameEn, nameDe, descriptionEn, descriptionDe, allergens, allergensNote, allergensNoteEn, allergensNoteDe } = body
  if (!name || price == null ||!categoryId) return NextResponse.json({ error: 'Ime, cijena, kategorija obavezni' }, { status: 400 })
  const cat = await prisma.menuCategory.findFirst({ where: { id: categoryId, restaurantId } })
  if (!cat) return NextResponse.json({ error: 'Kategorija ne pripada restoranu' }, { status: 400 })
  const maxOrder = await prisma.menuItem.aggregate({ where: { categoryId }, _max: { order: true } })
  const created = await prisma.menuItem.create({
    data: {
      name: name.trim(),
      nameEn: nameEn?.trim() || null,
      nameDe: nameDe?.trim() || null,
      price: Number(price),
      description: description || null,
      descriptionEn: descriptionEn || null,
      descriptionDe: descriptionDe || null,
      categoryId,
      restaurantId,
      imageUrl: imageUrl || null,
      available: available?? true,
      isBoosted: isBoosted?? false,
      boostLevel: boostLevel? Number(boostLevel) : 0,
      order: (maxOrder._max.order?? 0) + 1,
      allergens: allergens || null,
      allergensNote: allergensNote || null,
      allergensNoteEn: allergensNoteEn || null,
      allergensNoteDe: allergensNoteDe || null,
    } as any
  })
  return NextResponse.json(created)
}
