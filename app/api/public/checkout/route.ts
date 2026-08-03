import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments'

export async function POST(req: Request) {
  const { restaurantSlug, tableNumber, items, tipPercent = 0 } = await req.json()

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
  let subtotal = 0
  const orderItems = items.map((i:any)=>{
    const mi = menuItems.find(m=>m.id===i.id)
    if(!mi) return null
    subtotal += mi.price * i.qty
    return { menuItemId: mi.id, quantity: i.qty, price: mi.price }
  }).filter(Boolean)

  if(!orderItems.length) return NextResponse.json({ error: 'Prazna košarica' }, { status: 400 })

  const tipAmount = subtotal * (tipPercent / 100)
  const total = subtotal + tipAmount

  const order = await prisma.order.create({
    data: {
      total,
      tipPercent: parseInt(tipPercent)||0,
      tipAmount,
      tableId: table.id,
      restaurantId: restaurant.id,
      paymentMethod: 'CARD_ONLINE',
      paymentStatus: 'PENDING',
      paymentProvider: 'stripe',
      items: { create: orderItems }
    }
  })

  const provider = getPaymentProvider(restaurant)
  if(provider.name === 'mock') {
    return NextResponse.json({ order, url: null, mock: true })
  }

  const intent = await provider.createIntent({
    orderId: order.id,
    amount: total,
    currency: 'eur',
    restaurantId: restaurant.id,
    restaurantSlug: restaurant.slug
  })

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentIntentId: intent.intentId }
  })

  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: total,
      provider: 'stripe',
      providerIntentId: intent.intentId,
      status: 'PENDING'
    }
  })

  return NextResponse.json({ orderId: order.id, url: intent.checkoutUrl })
}
