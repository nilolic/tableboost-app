import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserFromCookie } from '@/lib/auth-2fa'
export async function POST(){
  const cur = await getCurrentUserFromCookie()
  if(!cur) return NextResponse.json({error:'Nisi logiran'}, {status:401})
  await prisma.user.update({where:{id: cur.id}, data:{totp_enabled:false, totp_secret:null}})
  return NextResponse.json({ok:true})
}
