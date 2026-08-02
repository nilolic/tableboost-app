import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import SettingsClient from "./SettingsClient"

export default async function Page() {
  const cur = await getCurrentUser()
  if (!cur?.restaurantId) redirect("/login")
  const restaurant = await prisma.restaurant.findUnique({ where: { id: cur.restaurantId } })
  if (!restaurant) redirect("/login")
  return <SettingsClient restaurant={restaurant} />
}
