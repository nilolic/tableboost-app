import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserFromCookie, isAdminRole } from '@/lib/auth-2fa'

export async function POST(req: Request){
  const cur = await getCurrentUserFromCookie()
  if(!cur || !isAdminRole(cur.role as any)) return NextResponse.json({error:'Samo admin'}, {status:403})
  const {userId, enabled} = await req.json()
  if(!userId) return NextResponse.json({error:'userId obavezan'}, {status:400})
  // ako gasis - brisi secret, ako palis - samo postavi enabled=false da mora setupirati (kao haccp-pro admin-setup)
  if(enabled === false){
    await prisma.user.update({where:{id:userId}, data:{totp_enabled:false, totp_secret:null}})
  } else {
    // ne palimo odmah enabled, nego pustimo da user setupira - ti iz admina mozes kasnije i reset
    // za tvoj zahtjev "ja iz admina palim kome zelim" - ako zelis odmah forsirati, ostavimo enabled=false ali ti ces vidjeti da ima secret
    // ovdje cemo samo ostaviti da admin moze reci "mora imati 2FA" - user ce na login dobiti redirect na setup
    // ako vec ima secret, upali mu ga
    const target = await prisma.user.findUnique({where:{id:userId}})
    if(target?.totp_secret){
      await prisma.user.update({where:{id:userId}, data:{totp_enabled:true}})
    } else {
      // oznaci da mora setupirati - u login cemo provjeriti
      await prisma.user.update({where:{id:userId}, data:{totp_enabled:false}})
    }
  }
  const updated = await prisma.user.findUnique({where:{id:userId}, select:{id:true, email:true, totp_enabled:true, totp_secret:true}})
  return NextResponse.json({ok:true, user: {id: updated?.id, email: updated?.email, twoFaEnabled: !!updated?.totp_enabled, hasSecret: !!updated?.totp_secret}})
}
