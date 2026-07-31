import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { translateText } from "@/lib/deepl"

export async function GET(){
  const user = await getCurrentUser()
  if(!user?.restaurantId){
    const r = await prisma.restaurant.findFirst()
    if(!r) return NextResponse.json({categories:[]})
    const categories = await prisma.menuCategory.findMany({ where:{restaurantId:r.id}, orderBy:{order:"asc"}, include:{_count:{select:{items:true}}}})
    return NextResponse.json({categories})
  }
  const categories = await prisma.menuCategory.findMany({ where:{restaurantId:user.restaurantId}, orderBy:{order:"asc"}, include:{_count:{select:{items:true}}}})
  return NextResponse.json({categories})
}

export async function POST(req: NextRequest){
  const user = await getCurrentUser()
  const restaurantId = user?.restaurantId || (await prisma.restaurant.findFirst())?.id
  if(!restaurantId) return NextResponse.json({error:"No restaurant"}, {status:400})
  const { name, nameEn, nameDe, order } = await req.json()
  if(!name?.trim()) return NextResponse.json({error:"Name required"}, {status:400})
  const maxOrder = await prisma.menuCategory.aggregate({ where:{restaurantId}, _max:{order:true} })
  const cat = await prisma.menuCategory.create({
    data:{
      name: name.trim(),
      nameEn: nameEn?.trim() || null,
      nameDe: nameDe?.trim() || null,
      order: order?? ((maxOrder._max.order||0)+1),
      restaurantId
    }
  })
  return NextResponse.json(cat)
}
