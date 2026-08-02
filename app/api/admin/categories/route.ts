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
    const categories = await prisma.menuCategory.findMany({ where:{restaurantId}, orderBy:{order:"asc"}, include:{_count:{select:{items:true}}} })
    return NextResponse.json({categories})
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
    console.log("POST /api/admin/categories", { email: user?.email, role: user?.role, impId, restaurantId })
    if(!user) return NextResponse.json({error:"Nisi logiran"},{status:401})
    if(!restaurantId) return NextResponse.json({error:"Nema restorana - nisi u impersonate modu. Vrati se u SuperAdmin pa opet Uđi kao vlasnik"},{status:400})
    const body = await req.json()
    const name = body.name?.trim()
    if(!name) return NextResponse.json({error:"Ime obavezno"},{status:400})
    const maxOrder = await prisma.menuCategory.aggregate({ where:{restaurantId}, _max:{order:true} })
    const cat = await prisma.menuCategory.create({
      data:{ name, nameEn: body.nameEn?.trim() || null, nameDe: body.nameDe?.trim() || null, order: body.order ?? ((maxOrder._max.order||0)+1), restaurantId }
    })
    const withCount = await prisma.menuCategory.findUnique({ where:{id:cat.id}, include:{_count:{select:{items:true}}} })
    return NextResponse.json(withCount)
  } catch(e:any){
    console.error("POST categories ERROR", e)
    return NextResponse.json({error: e.message || "Greška"},{status:500})
  }
}
