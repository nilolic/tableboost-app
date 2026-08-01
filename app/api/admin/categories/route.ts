import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getImpersonateId } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getRestaurantId } from "@/lib/getRestaurantId"

export async function GET(){
  try {
    const user = await getCurrentUser()
    if(!user) return NextResponse.json({error:"Unauthorized"}, {status:401})
    const impId = await getImpersonateId()
    const restaurantId = getRestaurantId(user, impId)
    if(!restaurantId) return NextResponse.json({categories:[]})
    const categories = await prisma.menuCategory.findMany({
      where:{restaurantId},
      orderBy:{order:"asc"},
      include:{_count:{select:{items:true}}}
    })
    return NextResponse.json({categories})
  } catch(e:any) {
    return NextResponse.json({error:e.message}, {status:500})
  }
}

export async function POST(req: NextRequest){
  try {
    const user = await getCurrentUser()
    if(!user) return NextResponse.json({error:"Unauthorized"}, {status:401})
    const impId = await getImpersonateId()
    const restaurantId = getRestaurantId(user, impId)
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
    // vrati sa _count da ne puca frontend
    const withCount = await prisma.menuCategory.findUnique({
      where:{id:cat.id},
      include:{_count:{select:{items:true}}}
    })
    return NextResponse.json(withCount)
  } catch(e:any) {
    return NextResponse.json({error:e.message}, {status:500})
  }
}
