import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, {params}:{params:{id:string}}){
  const body = await req.json()
  const data:any = {}
  if(body.name!==undefined) data.name = body.name
  if(body.nameEn!==undefined) data.nameEn = body.nameEn || null
  if(body.nameDe!==undefined) data.nameDe = body.nameDe || null
  if(body.description!==undefined) data.description = body.description || null
  if(body.descriptionEn!==undefined) data.descriptionEn = body.descriptionEn || null
  if(body.descriptionDe!==undefined) data.descriptionDe = body.descriptionDe || null
  if(body.price!==undefined) data.price = Number(body.price)
  if(body.categoryId!==undefined) data.categoryId = body.categoryId
  if(body.imageUrl!==undefined) data.imageUrl = body.imageUrl || null
  if(body.available!==undefined) data.available = Boolean(body.available)
  if(body.isBoosted!==undefined) data.isBoosted = Boolean(body.isBoosted)
  if(body.boostLevel!==undefined) data.boostLevel = Number(body.boostLevel)
  if(body.upsellEnabled!==undefined) data.upsellEnabled = Boolean(body.upsellEnabled)
  if(body.order!==undefined) data.order = Number(body.order)

  const updated = await prisma.menuItem.update({ where:{id: params.id}, data })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, {params}:{params:{id:string}}){
  // obriši i upsell pravila vezana uz artikal
  await prisma.upsellRule.deleteMany({ where:{ OR:[{sourceId:params.id},{targetId:params.id}] } })
  await prisma.orderItem.deleteMany({ where:{menuItemId:params.id} }).catch(()=>{})
  await prisma.menuItem.delete({ where:{id:params.id} })
  return NextResponse.json({ok:true})
}
