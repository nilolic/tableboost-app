import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserFromCookie } from '@/lib/auth-2fa'
import { verifyToken, pendingSetup } from '@/lib/twofa'

export async function POST(req: Request){
  const cur = await getCurrentUserFromCookie()
  if(!cur) return NextResponse.json({error:'Nisi logiran'}, {status:401})
  const {code, tempId} = await req.json()
  if(!code) return NextResponse.json({error:'Kod obavezan'}, {status:400})
  const user = await prisma.user.findUnique({where:{id: cur.id}})
  if(!user?.totp_secret) return NextResponse.json({error:'Nema secreta, prvo setup'}, {status:400})
  const secretToCheck = tempId ? (pendingSetup.get(tempId)?.secret || user.totp_secret) : user.totp_secret
  const ok = verifyToken(secretToCheck, code.trim())
  if(!ok) return NextResponse.json({error:'Pogrešan kod'}, {status:401})
  await prisma.user.update({where:{id: cur.id}, data:{totp_enabled:true, totp_secret: secretToCheck}})
  if(tempId) pendingSetup.delete(tempId)
  return NextResponse.json({ok:true, enabled:true})
}
