import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
export async function DELETE(_:Request,{params}:{params:{id:string}}){
  const cur = await getCurrentUser()
  if(!cur||cur.role!=='SUPER_ADMIN') return NextResponse.json({error:'Unauthorized'},{status:401})
  try{ await prisma.restaurant.delete({where:{id:params.id}}); return NextResponse.json({ok:true}) }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
