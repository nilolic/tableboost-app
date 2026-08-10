import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
export async function DELETE(_:Request,{params}:{params:{id:string}}){
  const cur = await getCurrentUser()
  if(!cur||cur.role!=='SUPER_ADMIN') return NextResponse.json({error:'Unauthorized'},{status:401})
  try{
    await prisma.$transaction(async (tx)=>{
      await tx.upsellRule.deleteMany({where:{restaurantId:params.id}})
      await tx.payment.deleteMany({where:{order:{restaurantId:params.id}}})
      await tx.orderItem.deleteMany({where:{order:{restaurantId:params.id}}})
      await tx.orderItem.deleteMany({where:{menuItem:{restaurantId:params.id}}} as any)
      await tx.order.deleteMany({where:{restaurantId:params.id}})
      await tx.table.deleteMany({where:{restaurantId:params.id}})
      await tx.menuItem.deleteMany({where:{restaurantId:params.id}})
      await tx.menuCategory.deleteMany({where:{restaurantId:params.id}})
      await tx.user.deleteMany({where:{restaurantId:params.id}})
      await tx.restaurant.delete({where:{id:params.id}})
    })
    return NextResponse.json({ok:true})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
