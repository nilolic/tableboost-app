import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request){
  const cur = await getCurrentUser()
  if(!cur) return NextResponse.json({error:'Nisi logiran'}, {status:401})
  if(cur.role !== 'SUPER_ADMIN' && cur.role !== 'RESTAURANT_ADMIN') return NextResponse.json({error:'Nemate ovlasti'}, {status:403})
  
  const { userId, enabled } = await req.json()
  if(!userId) return NextResponse.json({error:'userId obavezan'}, {status:400})

  const target = await prisma.user.findUnique({where:{id:userId}})
  if(!target) return NextResponse.json({error:'Korisnik ne postoji'}, {status:404})

  if(cur.role === 'RESTAURANT_ADMIN' && target.restaurantId !== cur.restaurantId) {
    return NextResponse.json({error:'Možete uređivati samo svoje osoblje'}, {status:403})
  }

  if(enabled){
    // Upali = resetiraj da korisnik mora na /2fa/setup skenirati QR
    await prisma.user.update({where:{id:userId}, data:{totp_secret: null, totp_enabled:false}})
  } else {
    // Ugasi
    await prisma.user.update({where:{id:userId}, data:{totp_secret: null, totp_enabled:false}})
  }
  return NextResponse.json({ok:true})
}
