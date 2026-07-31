import { prisma } from "@/lib/prisma"
import { getCurrentUser, getImpersonateId } from "@/lib/auth"
import { getRestaurantId } from "@/lib/getRestaurantId"
import AdminSidebar from "./components/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user: any = null
  let restaurant: any = null
  let impersonated: any = null
  try {
    user = await getCurrentUser()
    const impId = await getImpersonateId()
    if (user) {
      const restaurantId = getRestaurantId(user, impId)
      if (restaurantId) {
        restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
      }
      if (impId && user.role === 'SUPER_ADMIN' && restaurant) {
        impersonated = restaurant
      }
    }
  } catch {}

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AdminSidebar user={user} restaurant={restaurant} impersonated={impersonated} />
      {/* Ovo je ključ - ml- gura content, ne pl */}
      <div className="flex-1 lg:ml- min-w-0 flex flex-col">
        {impersonated && (
          <div className="sticky top-0 z-30 bg-amber-400 text-black text- font-medium px-4 py-2.5 text-center flex items-center justify-center gap-2">
            <span>👀 Gledaš kao: {impersonated.name}</span>
            <a href="/api/superadmin/impersonate?clear=true" className="ml-3 px-3 py-1 rounded-full bg-black text-white text-xs hover:bg-zinc-800">Izađi</a>
          </div>
        )}
        <main className="flex-1 min-h-screen w-full bg-[#F8FAFC] overflow-x-hidden">
          {/* mobitel spacer */}
          <div className="lg:hidden h-16" />
          <div className="w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
