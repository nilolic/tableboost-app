import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Ako nema restaurantId (SUPER_ADMIN bez impersonate)
  if (!user.restaurantId) {
    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      restaurantId: null,
      restaurant: null,
      impersonate: false,
      _impersonated: false
    })
  }

  // Dohvati puni restoran sa svim relacijama koje admin/page.tsx treba
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: user.restaurantId },
    include: {
      tables: true,
      users: true,
      _count: { select: { items: true } }
    }
  })

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
    restaurant,
    impersonate: (user as any)._impersonated || false,
    _impersonated: (user as any)._impersonated || false
  })
}
