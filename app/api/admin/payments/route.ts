import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cur = await getCurrentUser()
  if (!cur?.restaurantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const r = await prisma.restaurant.findUnique({ where: { id: cur.restaurantId } })
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // ne vraćamo puni secret
  return NextResponse.json({
    paymentCashEnabled: r.paymentCashEnabled,
    paymentCardTerminalEnabled: r.paymentCardTerminalEnabled,
    paymentCardOnlineEnabled: r.paymentCardOnlineEnabled,
    paymentProvider: r.paymentProvider,
    paymentTestMode: r.paymentTestMode,
    stripePublicKey: r.stripePublicKey || '',
    hasSecret:!!r.stripeSecretKey,
  })
}

export async function PATCH(req: Request) {
  const cur = await getCurrentUser()
  if (!cur?.restaurantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  const data: any = {}
  if (typeof body.paymentCashEnabled === 'boolean') data.paymentCashEnabled = body.paymentCashEnabled
  if (typeof body.paymentCardTerminalEnabled === 'boolean') data.paymentCardTerminalEnabled = body.paymentCardTerminalEnabled
  if (typeof body.paymentCardOnlineEnabled === 'boolean') data.paymentCardOnlineEnabled = body.paymentCardOnlineEnabled
  if (body.paymentProvider) data.paymentProvider = body.paymentProvider
  if (typeof body.paymentTestMode === 'boolean') data.paymentTestMode = body.paymentTestMode
  if (body.stripePublicKey!== undefined) data.stripePublicKey = body.stripePublicKey
  if (body.stripeSecretKey) data.stripeSecretKey = body.stripeSecretKey
  if (body.stripeWebhookSecret!== undefined) data.stripeWebhookSecret = body.stripeWebhookSecret

  const updated = await prisma.restaurant.update({
    where: { id: cur.restaurantId },
    data
  })
  return NextResponse.json({ ok: true })
}
