import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.restaurantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const r = await prisma.restaurant.findUnique({ where: { id: user.restaurantId } })
  return NextResponse.json(r)
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  if (!user?.restaurantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  const allowed = ["name","legalName","address","city","postalCode","oib","phone","email","website","iban","vatNumber","description","workingHours","logoUrl","loginImageUrl"]
  const data:any = {}
  for(const k of allowed){
    if(k in body) data[k] = body[k] || null
  }

  const updated = await prisma.restaurant.update({
    where: { id: user.restaurantId },
    data
  })
  return NextResponse.json(updated)
}
