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
  
  // spriječi cirkularni parent
  if(body.parentId === params.id) return NextResponse.json({error:"Kategorija ne može biti parent sama sebi"},{status:400})
  if(body.parentId){
    const parent = await prisma.menuCategory.findFirst({where:{id:body.parentId, restaurantId}})
    if(!parent) return NextResponse.json({error:"Parent ne postoji"},{status:400})
    // provjeri da parent nije dijete ove kategorije (jednostavna zaštita)
    if(parent.parentId === params.id) return NextResponse.json({error:"Cirkularna hijerarhija nije dozvoljena"},{status:400})
  }

  const updated = await prisma.menuCategory.update({ 
    where:{id:params.id}, 
    data:{ 
      name: body.name, 
      nameEn: body.nameEn ?? undefined, 
      nameDe: body.nameDe ?? undefined,
      description: body.description ?? undefined,
      imageUrl: body.imageUrl ?? undefined,
      order: body.order,
      parentId: body.parentId !== undefined ? body.parentId || null : undefined,
      sendsToKitchen: body.sendsToKitchen !== undefined ? body.sendsToKitchen : undefined
    } 
  })
  return NextResponse.json(updated)
}

export async function DELETE(_:NextRequest, { params }: { params: { id: string } }){
  const user = await getCurrentUser()
  const impId = await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if(!user ||!restaurantId) return NextResponse.json({error:"Unauthorized"},{status:401})
  const existing = await prisma.menuCategory.findFirst({ where:{ id: params.id, restaurantId }, include:{_count:{select:{children:true}}} })
  if(!existing) return NextResponse.json({error:"Not found"},{status:404})
  const count = await prisma.menuItem.count({ where:{ categoryId: params.id } })
  if(count>0) return NextResponse.json({error:`Kategorija ima ${count} artikala, premjesti ih prvo`},{status:400})
  if(existing._count.children>0) return NextResponse.json({error:`Kategorija ima ${existing._count.children} podkategorija, obriši ih prvo`},{status:400})
  await prisma.menuCategory.delete({ where:{id:params.id} })
  return NextResponse.json({ok:true})
}
