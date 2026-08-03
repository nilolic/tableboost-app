import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  let r = await prisma.restaurant.findUnique({
    where: { slug: params.slug },
    select: { name: true, slug: true, logoUrl: true, loginImageUrl: true, paymentCashEnabled: true, paymentCardTerminalEnabled: true, paymentCardOnlineEnabled: true, paymentProvider: true }
  })
  if (!r) {
    const table = await prisma.table.findUnique({ where: { qrSlug: params.slug }, include: { restaurant: true } })
    if(table) {
      r = { name: table.restaurant.name, slug: table.restaurant.slug, logoUrl: table.restaurant.logoUrl, loginImageUrl: table.restaurant.loginImageUrl, paymentCashEnabled: table.restaurant.paymentCashEnabled, paymentCardTerminalEnabled: table.restaurant.paymentCardTerminalEnabled, paymentCardOnlineEnabled: table.restaurant.paymentCardOnlineEnabled, paymentProvider: table.restaurant.paymentProvider } as any
    }
  }
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(r)
}
