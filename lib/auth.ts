import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const c = cookies().get('tb_user')?.value
  if (!c) return null
  try {
    const p = JSON.parse(c)
    return await prisma.user.findUnique({ where: { id: p.id }, include: { restaurant: true } })
  } catch { return null }
}

export function getImpersonateId() {
  return cookies().get('tb_impersonate')?.value || null
}
