import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')
  if(!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  const restaurants = await prisma.restaurant.findMany({
    where: { stripeSecretKey: { not: null }, stripeWebhookSecret: { not: null } }
  })

  let event: Stripe.Event | null = null

  for(const r of restaurants) {
    try {
      const stripe = new Stripe(r.stripeSecretKey!, { apiVersion: '2024-06-20' as any })
      event = stripe.webhooks.constructEvent(rawBody, sig, r.stripeWebhookSecret!)
      break
    } catch {}
  }

  if(!event) {
    const globalKey = process.env.STRIPE_SECRET_KEY
    const globalSecret = process.env.STRIPE_WEBHOOK_SECRET
    if(globalKey && globalSecret) {
      try {
        const stripe = new Stripe(globalKey, { apiVersion: '2024-06-20' as any })
        event = stripe.webhooks.constructEvent(rawBody, sig, globalSecret)
      } catch(e:any) {
        return NextResponse.json({ error: 'Invalid signature: '+e.message }, { status: 400 })
      }
    }
  }

  if(!event) return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })

  if(event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId
    if(orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'paid', paidAt: new Date(), paymentIntentId: session.id }
      }).catch(()=>{})
      await prisma.payment.updateMany({
        where: { providerIntentId: session.id },
        data: { status: 'PAID' }
      })
      // ako payment ne postoji, kreiraj ga
      const existing = await prisma.payment.findFirst({ where: { orderId } })
      if(!existing) {
        await prisma.payment.create({
          data: { orderId, amount: (session.amount_total||0)/100, provider: 'stripe', providerIntentId: session.id, status: 'PAID', rawResponse: session as any }
        }).catch(()=>{})
      }
    }
  }

  return NextResponse.json({ received: true })
}
