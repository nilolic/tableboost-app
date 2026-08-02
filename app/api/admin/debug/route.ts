import { NextResponse } from 'next/server'
import { getCurrentUser, getImpersonateId } from '@/lib/auth'
import { getRestaurantId } from '@/lib/getRestaurantId'
export async function GET(){
  const user = await getCurrentUser()
  const impId = await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  return NextResponse.json({ 
    user: user ? { email: user.email, role: user.role, restaurantId: user.restaurantId, _imp: (user as any)._impersonated } : null,
    impId,
    restaurantId,
    hasImpersonate: !!impId
  })
}
