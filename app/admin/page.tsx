import { prisma } from "@/lib/prisma"
import { getCurrentUser, getImpersonateId } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const impersonateId = getImpersonateId()
  const restaurantId = impersonateId || user.restaurantId

  if (user.role === 'SUPER_ADMIN' && !impersonateId) redirect('/superadmin')
  if (!restaurantId) return <div className="p-10">Nema restorana dodijeljenog. Kontaktiraj super admina.</div>

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, include: { users: true, tables: true, _count: { select: { orders: true, items: true } } } })
  if (!restaurant) return <div className="p-10">Restoran ne postoji</div>

  return (
    <main className="max-w-6xl mx-auto p-8">
      {impersonateId && <div className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm mb-6 inline-block">Super Admin mod - gledas kao {restaurant.name} <a href="/api/superadmin/impersonate?clear=1" className="underline ml-2 font-bold">Izađi</a></div>}
      <h1 className="text-4xl font-black mb-2">{restaurant.name}</h1>
      <p className="text-neutral-600 mb-8">Slug: {restaurant.slug} • Stolova: {restaurant.tables.length} • Korisnika: {restaurant.users.length}</p>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Konobari</div><div className="text-3xl font-bold mt-2">{restaurant.users.filter(u=>u.role==='WAITER').length}</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Kuhinja</div><div className="text-3xl font-bold mt-2">{restaurant.users.filter(u=>u.role==='KITCHEN').length}</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Artikala</div><div className="text-3xl font-bold mt-2">{restaurant._count.items}</div></div>
      </div>
      <div className="flex gap-3">
        <a href={`/menu/${restaurant.slug}`} target="_blank" className="bg-black text-white px-6 py-3 rounded-full">Vidi meni</a>
        <a href="/admin/qr" className="border border-black px-6 py-3 rounded-full">QR kodovi</a>
        <a href="/dashboard" className="border border-black px-6 py-3 rounded-full">Dashboard</a>
      </div>
      <div className="mt-10">
        <h2 className="font-bold text-xl mb-4">Osoblje</h2>
        <div className="bg-white border rounded-2xl overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-zinc-50 text-zinc-500 text-xs uppercase"><tr><th className="text-left p-4">Email</th><th className="text-left p-4">Rola</th><th className="text-left p-4">Ime</th></tr></thead>
          <tbody>{restaurant.users.map(u=><tr key={u.id} className="border-t"><td className="p-4">{u.email}</td><td className="p-4">{u.role}</td><td className="p-4">{u.name||'—'}</td></tr>)}</tbody></table>
        </div>
      </div>
    </main>
  )
}
