import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, {params}:{params:{id:string}}){
  const body = await req.json()
  const data:any={}
  if(body.strength!==undefined) data.strength = Number(body.strength)
  if(body.type!==undefined) data.type = body.type
  const updated = await prisma.upsellRule.update({ where:{id:params.id}, data, include:{source:true,target:true}})
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, {params}:{params:{id:string}}){
  await prisma.upsellRule.delete({ where:{id:params.id}})
  return NextResponse.json({ok:true})
}
