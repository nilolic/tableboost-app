import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getImpersonateId } from '@/lib/auth'
import { getRestaurantId } from '@/lib/getRestaurantId'
import bcrypt from 'bcryptjs'
export const dynamic = 'force-dynamic'

export async function DELETE(_:Request,{params}:{params:{id:string}}){
  const user = await getCurrentUser()
  const impId = await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if(!user ||!restaurantId) return NextResponse.json({error:'Unauthorized'},{status:401})
  if(!['RESTAURANT_ADMIN','SUPER_ADMIN'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403})
  const target = await prisma.user.findUnique({where:{id:params.id}})
  if(!target || target.restaurantId!== restaurantId) return NextResponse.json({error:'Nije pronađen'},{status:404})
  if(['SUPER_ADMIN','RESTAURANT_ADMIN'].includes(target.role)) return NextResponse.json({error:'Ne možeš obrisati admina ovdje'},{status:400})
  await prisma.user.delete({where:{id:params.id}})
  return NextResponse.json({ok:true})
}
export async function PATCH(req:Request,{params}:{params:{id:string}}){
  const user = await getCurrentUser()
  const impId = await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if(!user ||!restaurantId) return NextResponse.json({error:'Unauthorized'},{status:401})
  if(!['RESTAURANT_ADMIN','SUPER_ADMIN'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403})
  const target = await prisma.user.findUnique({where:{id:params.id}})
  if(!target || target.restaurantId!== restaurantId) return NextResponse.json({error:'Nije pronađen'},{status:404})
  const { password, name } = await req.json()
  const data:any = {}
  if(name!== undefined) data.name = name
  if(password){
    if(password.length < 6) return NextResponse.json({error:'Lozinka min 6'},{status:400})
    data.password = await bcrypt.hash(password,10)
  }
  const updated = await prisma.user.update({where:{id:params.id}, data})
  return NextResponse.json({ok:true, user:updated})
}
