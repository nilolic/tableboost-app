import { NextResponse } from 'next/server'
import { getCurrentUserFromCookie } from '@/lib/auth-2fa'
export async function GET(){
  const cur = await getCurrentUserFromCookie()
  if(!cur) return NextResponse.json({enabled:false})
  return NextResponse.json({enabled: !!cur.totp_enabled, hasSecret: !!cur.totp_secret})
}
