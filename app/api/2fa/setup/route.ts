import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserFromCookie } from '@/lib/auth-2fa'
import { generateSecret, toQRDataUrl, pending2FA } from '@/lib/twofa'

export async function POST(){
  const cur = await getCurrentUserFromCookie()
  if(!cur) return NextResponse.json({error:'Nisi logiran'}, {status:401})
  const secret = generateSecret(cur.email)
  if(!secret.otpauth_url) return NextResponse.json({error:'Greška generiranja secreta'}, {status:500})
  const qr = await toQRDataUrl(secret.otpauth_url as string)
  await prisma.user.update({where:{id: cur.id}, data:{totp_secret: secret.base32, totp_enabled:false}})
  const tempId = Math.random().toString(36).slice(2)
  pending2FA.set(tempId, { userId: cur.id, expires: Date.now()+10*60*1000 })
  return NextResponse.json({qr, secret: secret.base32, tempId})
}
