import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { restaurantSlug, tableNumber, items } = await req.json() // items: [{id, qty}]
  let restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } })
  let table = null
  if (!restaurant) {
    table = await prisma.table.findUnique({ where: { qrSlug: restaurantSlug }, include: { restaurant: true } })
    if (!table) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    restaurant = table.restaurant
  } else if (tableNumber) {
    table = await prisma.table.findFirst({ where: { restaurantId: restaurant.id, number: tableNumber } })
  }
  if (!table) {
    table = await prisma.table.findFirst({ where: { restaurantId: restaurant.id } })
  }
  if (!table) return NextResponse.json({ error: 'No table' }, { status: 400 })

  const menuItems = await prisma.menuItem.findMany({ where: { id: { in: items.map((i:any)=>i.id) } } })
  let total = 0
  const orderItems = items.map((i:any)=>{
    const mi = menuItems.find(m=>m.id===i.id)
    if(!mi) return null
    total += mi.price * i.qty
    return { menuItemId: mi.id, quantity: i.qty, price: mi.price }
  }).filter(Boolean)

  const order = await prisma.order.create({
    data: { total, tableId: table.id, restaurantId: restaurant.id, items: { create: orderItems } },
    include: { items: true }
  })
  return NextResponse.json({ order })
}
