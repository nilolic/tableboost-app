import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
export async function POST(_:Request,{params}:{params:{id:string}}){
  const cur = await getCurrentUser()
  if(!cur||cur.role!=='SUPER_ADMIN') return NextResponse.json({error:'Unauthorized'},{status:401})
  try{
    const r = await prisma.restaurant.findUnique({where:{id:params.id}})
    if(!r) return NextResponse.json({error:'Nema restorana'},{status:404})
    if(!r.isDemo) return NextResponse.json({error:'Nije DEMO'},{status:400})
    const updated = await prisma.restaurant.update({ where:{id:params.id}, data:{ isDemo:false, expiresAt:null, convertedAt:new Date() } })
    return NextResponse.json({ok:true, restaurant:updated})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
