import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserFromCookie, isAdminRole } from '@/lib/auth-2fa'
export async function POST(req: Request){
  const cur = await getCurrentUserFromCookie()
  if(!cur || !isAdminRole(cur.role as any)) return NextResponse.json({error:'Samo admin'}, {status:403})
  const {userId} = await req.json()
  if(!userId) return NextResponse.json({error:'userId obavezan'}, {status:400})
  await prisma.user.update({where:{id:userId}, data:{totp_enabled:false, totp_secret:null}})
  return NextResponse.json({ok:true})
}
