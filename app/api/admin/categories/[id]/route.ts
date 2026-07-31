import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, {params}:{params:{id:string}}){
  const body = await req.json()
  const updated = await prisma.menuCategory.update({
    where:{id:params.id},
    data:{
      name: body.name,
      nameEn: body.nameEn || null,
      nameDe: body.nameDe || null,
      order: body.order!==undefined? Number(body.order) : undefined
    }
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, {params}:{params:{id:string}}){
  const count = await prisma.menuItem.count({ where:{categoryId:params.id} })
  if(count>0) return NextResponse.json({error:`Ne možeš obrisati - kategorija ima ${count} artikala. Prvo ih premjesti.`}, {status:400})
  await prisma.menuCategory.delete({ where:{id:params.id} })
  return NextResponse.json({ok:true})
}
