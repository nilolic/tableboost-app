import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserFromCookie } from '@/lib/auth-2fa'
import { generateSecret, toQRDataUrl, pendingSetup } from '@/lib/twofa'

export async function POST(){
  const cur = await getCurrentUserFromCookie()
  if(!cur) return NextResponse.json({error:'Nisi logiran'}, {status:401})
  const secret = generateSecret(cur.email)
  const qr = await toQRDataUrl(secret.otpauth_url)
  // spremi kao temp secret - kao u haccp-pro, enabled=false dok ne verificira
  await prisma.user.update({where:{id: cur.id}, data:{totp_secret: secret.base32, totp_enabled:false}})
  const tempId = Math.random().toString(36).slice(2)
  pendingSetup.set(tempId, {userId: cur.id, secret: secret.base32, expires: Date.now()+10*60*1000})
  return NextResponse.json({secret: secret.base32, qr, otpauth_url: secret.otpauth_url, tempId})
}
