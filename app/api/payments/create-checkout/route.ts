import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if(!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true, items: { include: { menuItem: true } } }
    })
    if(!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const restaurant = order.restaurant as any

    // Ako nema Stripe ključa ili je test mode, mockiraj
    if(!restaurant.stripeSecretKey || restaurant.paymentTestMode){
      return NextResponse.json({ 
        url: `/order/${order.id}/success?mock=1&method=CARD_ONLINE`,
        mock: true,
      })
    }

    try {
      // Pokušaj Stripe
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(restaurant.stripeSecretKey, { apiVersion: '2024-06-20' as any })

      const line_items = order.items.map((i:any)=>({
        price_data: {
          currency: 'eur',
          product_data: { name: i.menuItem.name },
          unit_amount: Math.round(i.price * 100),
        },
        quantity: i.quantity,
      }))

      if(order.tipAmount > 0){
        line_items.push({
          price_data: {
            currency: 'eur',
            product_data: { name: `Napojnica ${order.tipPercent}%` },
            unit_amount: Math.round(order.tipAmount * 100),
          },
          quantity: 1,
        } as any)
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || `https://${req.headers.get('host')}`

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items,
        success_url: `${appUrl}/order/${order.id}/success?session_id={CHECKOUT_SESSION_ID}&method=CARD_ONLINE`,
        cancel_url: `${appUrl}/menu/${restaurant.slug}?cancelled=1`,
        metadata: { orderId: order.id, restaurantId: restaurant.id },
      })

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentIntentId: session.id, paymentStatus: 'PENDING' }
      })

      return NextResponse.json({ url: session.url })
    } catch (stripeErr:any) {
      console.error('Stripe error, fallback to mock', stripeErr)
      return NextResponse.json({ 
        url: `/order/${order.id}/success?mock=1&method=CARD_ONLINE`,
        mock: true,
        warning: stripeErr.message
      })
    }
  } catch (e:any) {
    console.error('create-checkout error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
