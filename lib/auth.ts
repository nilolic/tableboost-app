import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const c = cookieStore.get('tb_user')?.value
  if (!c) return null
  try {
    const p = JSON.parse(c)
    const user = await prisma.user.findUnique({ where: { id: p.id }, include: { restaurant: true } })
    if (!user) return null

    const impId = cookieStore.get('tb_impersonate')?.value
    if (impId && user.role === 'SUPER_ADMIN') {
      const impRest = await prisma.restaurant.findUnique({ 
        where: { id: impId },
        include: {
          tables: true,
          users: true,
          _count: { select: { items: true } }
        }
      })
      if (impRest) {
        return { ...user, restaurantId: impRest.id, restaurant: impRest, _impersonated: true } as any
      }
    }
    return user
  } catch { return null }
}

export async function getImpersonateId() {
  const cookieStore = await cookies()
  return cookieStore.get('tb_impersonate')?.value || null
}
