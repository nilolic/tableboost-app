import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'
export async function POST(req:Request,{params}:{params:{id:string}}){
  const cur = await getCurrentUser()
  if(!cur||cur.role!=='SUPER_ADMIN') return NextResponse.json({error:'Unauthorized'},{status:401})
  const { newPassword } = await req.json()
  if(!newPassword||newPassword.length<4) return NextResponse.json({error:'Lozinka prekratka'},{status:400})
  const hash = await bcrypt.hash(newPassword,10)
  await prisma.user.update({where:{id:params.id},data:{password:hash}})
  return NextResponse.json({ok:true})
}
