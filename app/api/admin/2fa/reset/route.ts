import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request){
  const cur = await getCurrentUser()
  if(!cur) return NextResponse.json({error:'Nisi logiran'}, {status:401})
  if(cur.role !== 'SUPER_ADMIN' && cur.role !== 'RESTAURANT_ADMIN') return NextResponse.json({error:'Nemate ovlasti'}, {status:403})
  const { userId } = await req.json()
  if(!userId) return NextResponse.json({error:'userId obavezan'}, {status:400})
  await prisma.user.update({where:{id:userId}, data:{totp_secret:null, totp_enabled:false}})
  return NextResponse.json({ok:true})
}
