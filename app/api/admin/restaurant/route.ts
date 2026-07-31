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
  const { logoUrl, loginImageUrl, name } = await req.json()

  const updated = await prisma.restaurant.update({
    where: { id: user.restaurantId },
    data: {
     ...(logoUrl!== undefined? { logoUrl } : {}),
     ...(loginImageUrl!== undefined? { loginImageUrl } : {}),
     ...(name? { name } : {}),
    }
  })
  return NextResponse.json(updated)
}
