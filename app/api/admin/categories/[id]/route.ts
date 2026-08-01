import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getImpersonateId } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getRestaurantId } from "@/lib/getRestaurantId"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }){
  try {
    const user = await getCurrentUser()
    if(!user) return NextResponse.json({error:"Unauthorized"}, {status:401})
    const impId = await getImpersonateId()
    const restaurantId = getRestaurantId(user, impId)
    if(!restaurantId) return NextResponse.json({error:"No restaurant"}, {status:400})
    const data = await req.json()
    const cat = await prisma.menuCategory.findFirst({ where:{id:params.id, restaurantId} })
    if(!cat) return NextResponse.json({error:"Not found"}, {status:404})
    const updated = await prisma.menuCategory.update({
      where:{id:params.id},
      data:{
        name: data.name,
        nameEn: data.nameEn,
        nameDe: data.nameDe,
        order: data.order
      }
    })
    return NextResponse.json(updated)
  } catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }){
  try {
    const user = await getCurrentUser()
    if(!user) return NextResponse.json({error:"Unauthorized"}, {status:401})
    const impId = await getImpersonateId()
    const restaurantId = getRestaurantId(user, impId)
    if(!restaurantId) return NextResponse.json({error:"No restaurant"}, {status:400})
    const cat = await prisma.menuCategory.findFirst({ where:{id:params.id, restaurantId} })
    if(!cat) return NextResponse.json({error:"Not found"}, {status:404})
    const count = await prisma.menuItem.count({ where:{categoryId:params.id} })
    if(count>0) return NextResponse.json({error:`Kategorija ima ${count} artikala. Prvo ih premjesti.`}, {status:400})
    await prisma.menuCategory.delete({ where:{id:params.id} })
    return NextResponse.json({success:true})
  } catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
