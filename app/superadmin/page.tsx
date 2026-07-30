import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SuperAdminClient from './components/SuperAdminClient'

export default async function Page() {
  const cur = await getCurrentUser()
  if (!cur || cur.role !== 'SUPER_ADMIN') redirect('/login')

  const restaurants = await prisma.restaurant.findMany({
    include: { users: true, tables: true, _count: { select: { orders: true, items: true } } },
    orderBy: { createdAt: 'desc' }
  })
  const users = await prisma.user.findMany({ include: { restaurant: true }, orderBy: { createdAt: 'desc' } })
  return <SuperAdminClient restaurants={restaurants} users={users} currentUser={cur} />
}
