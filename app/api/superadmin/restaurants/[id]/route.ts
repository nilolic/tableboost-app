import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(_:Request,{params}:{params:{id:string}}){
  const cur = await getCurrentUser()
  if(!cur || cur.role !== 'SUPER_ADMIN') return NextResponse.json({error:'Samo SUPER_ADMIN'}, {status:401})
  const id = params.id

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Upsell pravila (ovise o MenuItem + Restaurant) - Cascade ali brišemo prvo
      await tx.upsellRule.deleteMany({ where: { restaurantId: id } })

      // 2. OrderItem ovise o Order i MenuItem (Restrict na menuItem) - mora prije MenuItem i Order
      await tx.orderItem.deleteMany({ where: { order: { restaurantId: id } } })
      // za svaki slučaj i direktno po menuItem
      await tx.orderItem.deleteMany({ where: { menuItem: { restaurantId: id } } } as any)

      // 3. Order ovise o Table i Restaurant (Restrict) - mora prije Table
      await tx.order.deleteMany({ where: { restaurantId: id } })

      // 4. Table sad nema više narudžbi
      await tx.table.deleteMany({ where: { restaurantId: id } })

      // 5. MenuItem ovise o Category i Restaurant - mora prije Category
      await tx.menuItem.deleteMany({ where: { restaurantId: id } })

      // 6. Kategorije
      await tx.menuCategory.deleteMany({ where: { restaurantId: id } })

      // 7. Korisnici restorana (ne diraj SUPER_ADMIN koji ima restaurantId null)
      await tx.user.deleteMany({ where: { restaurantId: id } })

      // 8. Na kraju restoran
      await tx.restaurant.delete({ where: { id } })
    })

    return NextResponse.json({ ok: true })
  } catch (e:any) {
    console.error('DELETE restaurant failed', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
