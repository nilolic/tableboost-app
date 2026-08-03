import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function POST(req: Request) {
  const { restaurantSlug, tableNumber, items, paymentMethod = 'CASH', tipPercent = 0 } = await req.json()
  let restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } })
  let table = null
  if (!restaurant) {
    table = await prisma.table.findUnique({ where: { qrSlug: restaurantSlug }, include: { restaurant: true } })
    if (!table) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    restaurant = table.restaurant
  } else if (tableNumber) { table = await prisma.table.findFirst({ where: { restaurantId: restaurant.id, number: tableNumber } }) }
  if (!table) table = await prisma.table.findFirst({ where: { restaurantId: restaurant.id } })
  if (!table) return NextResponse.json({ error: 'No table' }, { status: 400 })
  const menuItems = await prisma.menuItem.findMany({ where: { id: { in: items.map((i:any)=>i.id) } } })
  let subtotal = 0
  const orderItems = items.map((i:any)=>{ const mi = menuItems.find(m=>m.id===i.id); if(!mi) return null; subtotal += mi.price * i.qty; return { menuItemId: mi.id, quantity: i.qty, price: mi.price } }).filter(Boolean)
  const tipAmount = subtotal * (tipPercent / 100)
  const total = subtotal + tipAmount
  const isCash = (paymentMethod||'').toUpperCase().includes('CASH') || (paymentMethod||'').toUpperCase().includes('POS') || (paymentMethod||'').toUpperCase().includes('TERMINAL')
  const order = await prisma.order.create({
    data: {
      total, tipPercent: parseInt(tipPercent)||0, tipAmount, tableId: table.id, restaurantId: restaurant.id,
      paymentMethod, paymentStatus: 'PENDING', status: isCash? 'awaiting_confirmation' : 'pending',
      paymentProvider: paymentMethod === 'CARD_ONLINE'? 'stripe' : 'mock',
      items: { create: orderItems }
    }, include: { items: true }
  })
  return NextResponse.json({ order })
}
