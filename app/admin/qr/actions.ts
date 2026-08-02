"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

function genSlug(base: string, num: number) {
  const clean = base.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,20)
  const rnd = Math.random().toString(36).slice(2,6)
  return `${clean}-stol-${num}-${rnd}`
}

export async function addTable(restaurantId: string, customNumber?: number) {
  if (!restaurantId) throw new Error("No restaurantId")
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!restaurant) throw new Error("Restoran ne postoji")

  let number = customNumber
  if (!number) {
    const max = await prisma.table.findFirst({ where: { restaurantId }, orderBy: { number: 'desc' } })
    number = (max?.number || 0) + 1
  }
  const exists = await prisma.table.findFirst({ where: { restaurantId, number } })
  if (exists) throw new Error(`Stol ${number} već postoji`)

  const qrSlug = genSlug(restaurant.slug || restaurant.name, number)
  const table = await prisma.table.create({ data: { number, qrSlug, restaurantId } })
  revalidatePath("/admin/qr")
  return table
}

export async function addMultipleTables(restaurantId: string, count: number) {
  if (count < 1 || count > 50) throw new Error("1-50")
  const res = []
  for (let i=0;i<count;i++) {
    const t = await addTable(restaurantId)
    res.push(t)
  }
  return res
}

export async function deleteTable(tableId: string) {
  const table = await prisma.table.findUnique({ where: { id: tableId }, include: { orders: { take: 1 } } })
  if (!table) throw new Error("Stol ne postoji")
  // ako ima narudžbi - ne daj brisati zadnjih 24h aktivnih
  const hasActiveOrders = await prisma.order.findFirst({ where: { tableId, status: { notIn: ["COMPLETED","CANCELLED"] } } })
  if (hasActiveOrders) throw new Error("Stol ima aktivne narudžbe - ne može se obrisati")
  await prisma.table.delete({ where: { id: tableId } })
  revalidatePath("/admin/qr")
}
