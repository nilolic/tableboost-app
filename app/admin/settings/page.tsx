import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import SettingsClient from "./SettingsClient"

export default async function SettingsPage() {
  const cookieStore = cookies()
  const session = cookieStore.get("tb_session")?.value
  if(!session) redirect("/login")
  let payload:any
  try{ payload = JSON.parse(Buffer.from(session, 'base64').toString()) } catch{ redirect("/login") }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: payload.restaurantId } })
  if(!restaurant) redirect("/login")

  return <SettingsClient restaurant={restaurant} />
}
