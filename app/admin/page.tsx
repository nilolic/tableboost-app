import { prisma } from "@/lib/prisma"
import { getCurrentUser, getImpersonateId } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const impersonateId = getImpersonateId()
  const restaurantId = impersonateId || user.restaurantId
  if (user.role === 'SUPER_ADMIN' &&!impersonateId) redirect('/superadmin')
  if (!restaurantId) return <div className="p-10">Nema restorana. <a href="/api/auth/logout" className="underline">Odjava</a></div>
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, include: { users: true, tables: true, _count: { select: { orders: true, items: true } } } })
  if (!restaurant) return <div className="p-10">Restoran ne postoji</div>
  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-start mb-6">
        <div>{impersonateId && <div className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm mb-4 inline-block">Super Admin mod - gledas kao {restaurant.name} <a href="/api/superadmin/impersonate?clear=1" className="underline ml-2 font-bold">Izađi u superadmin</a></div>}<h1 className="text-4xl font-black mb-2">{restaurant.name}</h1><p className="text-neutral-600">Slug: {restaurant.slug} • Stolova: {restaurant.tables.length} • Korisnika: {restaurant.users.length}</p></div>
        <a href="/api/auth/logout" className="border border-black px-5 py-2.5 rounded-full text-sm">Odjava</a>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Konobari</div><div className="text-3xl font-bold mt-2">{restaurant.users.filter(u=>u.role==='WAITER').length}</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Kuhinja</div><div className="text-3xl font-bold mt-2">{restaurant.users.filter(u=>u.role==='KITCHEN').length}</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Artikala</div><div className="text-3xl font-bold mt-2">{restaurant._count.items}</div></div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <a href={`/menu/${restaurant.slug}`} target="_blank" className="bg-black text-white px-6 py-3 rounded-full">Vidi meni</a>
        <a href="/admin/qr" className="border border-black px-6 py-3 rounded-full">QR kodovi</a>
      </div>
    </main>
  )
}
