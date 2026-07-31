import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUpsells } from '@/lib/upsell'

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const body = await req.json()
  const cartItemIds: string[] = body.cartItemIds || []
  let restaurant = await prisma.restaurant.findUnique({ where: { slug: params.slug } })
  if (!restaurant) {
    const table = await prisma.table.findUnique({ where: { qrSlug: params.slug } })
    if (table) restaurant = await prisma.restaurant.findUnique({ where: { id: table.restaurantId } })
  }
  if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const upsells = await getUpsells(restaurant.id, cartItemIds, 4)
  return NextResponse.json({ upsells })
}
