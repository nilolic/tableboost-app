import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
    restaurant: user.restaurant,
    _impersonated: (user as any)._impersonated || false
  })
}
