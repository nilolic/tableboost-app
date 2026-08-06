import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getCurrentUserFromCookie(){
  try{
    const c = cookies().get('tb_user')?.value
    if(!c) return null
    const parsed = JSON.parse(c)
    if(!parsed?.id) return null
    const user = await prisma.user.findUnique({where:{id: parsed.id}})
    return user
  }catch{ return null }
}
export function isAdminRole(role: string){
  return ['ADMIN','OWNER','SUPERADMIN','admin','owner'].includes(role)
}
