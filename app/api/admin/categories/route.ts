import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getImpersonateId } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getRestaurantId } from "@/lib/getRestaurantId"

export async function GET(){
  try {
    const user = await getCurrentUser()
    const impId = await getImpersonateId()
    const restaurantId = getRestaurantId(user, impId)
    if(!restaurantId) return NextResponse.json({categories:[]})
    const categories = await prisma.menuCategory.findMany({
      where:{restaurantId},
      orderBy:{order:"asc"},
      include:{
        _count:{select:{items:true, children:true}}, 
        children:{
          orderBy:{order:"asc"}, 
          include:{
            _count:{select:{items:true}},
            parent: true
          }
        }
      }
    })
    const parents = categories.filter(c=>!c.parentId)
    return NextResponse.json({categories: parents, all: categories})
  } catch(e:any){
    console.error("GET categories", e)
    return NextResponse.json({error:e.message},{status:500})
  }
}

export async function POST(req: NextRequest){
  try {
    const user = await getCurrentUser()
    const impId = await getImpersonateId()
    const restaurantId = getRestaurantId(user, impId)
    if(!user) return NextResponse.json({error:"Nisi logiran"},{status:401})
    if(!restaurantId) return NextResponse.json({error:"Nema restorana"},{status:400})
    const body = await req.json()
    const name = body.name?.trim()
    if(!name) return NextResponse.json({error:"Ime obavezno"},{status:400})

    let parent = null
    if(body.parentId){
      parent = await prisma.menuCategory.findFirst({where:{id:body.parentId, restaurantId}})
      if(!parent) return NextResponse.json({error:"Parent ne postoji"},{status:400})
    }

    const maxOrder = await prisma.menuCategory.aggregate({ where:{restaurantId, parentId: body.parentId||null}, _max:{order:true} })

    let sendsToKitchen = body.sendsToKitchen
    if(sendsToKitchen === undefined || sendsToKitchen === null){
      if(parent){
        sendsToKitchen = parent.sendsToKitchen
      } else {
        sendsToKitchen = name.toLowerCase().includes('hrana') || name.toLowerCase().includes('food')
      }
    }

    const cat = await prisma.menuCategory.create({
      data:{
        name,
        nameEn: body.nameEn?.trim() || null,
        nameDe: body.nameDe?.trim() || null,
        description: body.description?.trim() || null,
        imageUrl: body.imageUrl || null,
        order: body.order ?? ((maxOrder._max.order||0)+1),
        restaurantId,
        parentId: body.parentId || null,
        sendsToKitchen
      }
    })
    const withCount = await prisma.menuCategory.findUnique({ where:{id:cat.id}, include:{_count:{select:{items:true, children:true}}}})
    return NextResponse.json(withCount)
  } catch(e:any){
    console.error("POST categories ERROR", e)
    return NextResponse.json({error: e.message || "Greška"},{status:500})
  }
}
