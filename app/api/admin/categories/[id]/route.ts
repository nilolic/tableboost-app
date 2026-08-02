import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getImpersonateId } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getRestaurantId } from "@/lib/getRestaurantId"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }){
  const user = await getCurrentUser()
  const impId = await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if(!user ||!restaurantId) return NextResponse.json({error:"Unauthorized"},{status:401})
  const existing = await prisma.menuCategory.findFirst({ where:{ id: params.id, restaurantId } })
  if(!existing) return NextResponse.json({error:"Not found"},{status:404})
  const body = await req.json()
  const updated = await prisma.menuCategory.update({ where:{id:params.id}, data:{ name: body.name, nameEn: body.nameEn, nameDe: body.nameDe, order: body.order } })
  return NextResponse.json(updated)
}
export async function DELETE(_:NextRequest, { params }: { params: { id: string } }){
  const user = await getCurrentUser()
  const impId = await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if(!user ||!restaurantId) return NextResponse.json({error:"Unauthorized"},{status:401})
  const existing = await prisma.menuCategory.findFirst({ where:{ id: params.id, restaurantId } })
  if(!existing) return NextResponse.json({error:"Not found"},{status:404})
  const count = await prisma.menuItem.count({ where:{ categoryId: params.id } })
  if(count>0) return NextResponse.json({error:`Kategorija ima ${count} artikala`},{status:400})
  await prisma.menuCategory.delete({ where:{id:params.id} })
  return NextResponse.json({ok:true})
}
