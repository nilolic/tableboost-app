import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, pending2FA } from '@/lib/twofa'

export async function POST(req: Request){
  const {tempId, code} = await req.json()
  if(!tempId || !code) return NextResponse.json({error:'tempId i code obavezni'}, {status:400})
  const pend = pending2FA.get(tempId)
  if(!pend) return NextResponse.json({error:'2FA isteklo, logiraj se ponovo'}, {status:401})
  if(Date.now() > pend.expires){ pending2FA.delete(tempId); return NextResponse.json({error:'2FA isteklo'}, {status:401}) }
  const user = await prisma.user.findUnique({where:{id: pend.userId}})
  if(!user?.totp_secret) return NextResponse.json({error:'Nema 2FA'}, {status:400})
  const ok = verifyToken(user.totp_secret, code.trim())
  if(!ok) return NextResponse.json({error:'Pogrešan kod'}, {status:401})
  pending2FA.delete(tempId)
  const res = NextResponse.json({ok:true, role: user.role, email: user.email, id: user.id})
  res.cookies.set('tb_user', JSON.stringify({id: user.id, role: user.role, restaurantId: user.restaurantId, email: user.email}), {httpOnly:true, path:'/', maxAge:60*60*24*7, sameSite:'lax'})
  return res
}
