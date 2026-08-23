export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { prisma } from "@/lib/prisma"
import { getCurrentUser, getImpersonateId } from "@/lib/auth"
import { getRestaurantId } from "@/lib/getRestaurantId"
import { redirect } from "next/navigation"
import PrintButton from "./PrintButton"
import ManageTables from "./ManageTables"
import QRWithLogo from "./QRWithLogo"
export default async function QRPrintPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const impId = await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if (!restaurantId) redirect("/login")
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!restaurant) redirect("/login")
  const tables = await prisma.table.findMany({ where: { restaurantId }, orderBy: { number: 'asc' } })
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "RESTAURANT_ADMIN"
  return (
    <main className="p-4 md:p-8 bg-[#f8fafc] min-h-screen print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div><h1 className="text-3xl font-black tracking-tight">Stolovi & QR</h1><p className="text-sm text-zinc-500 mt-1">{restaurant.name} • {tables.length} stolova • QR s logom u sredini</p></div><PrintButton />
        </div>
        {isAdmin && <ManageTables restaurantId={restaurantId} tables={tables} initialLogo={(restaurant as any).logoUrl} />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
          {tables.map(table => {
            const url = `https://tableboost.app/menu/${table.qrSlug}`
            const logo = (restaurant as any).logoUrl
            return (
              <div key={table.id} className="bg-white border border-zinc-200 rounded-2xl p-7 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] print:shadow-none print:border-2 print:border-black print:rounded-2xl break-inside-avoid">
                <div className="flex flex-col items-center"><h2 className="font-black text- tracking-widest uppercase text-zinc-900">{restaurant.name}</h2><div className="mt-2 inline-flex items-center px-5 py-2 rounded-full bg-zinc-900 text-white text- font-black tracking-widest">STOL {table.number}</div></div>
                <div className="mt-6 flex justify-center"><div className="w-full max-w- bg-white rounded-2xl p-3 border border-zinc-100"><QRWithLogo url={url} logoUrl={logo} size={600} /></div></div>
                <div className="mt-5"><p className="font-bold text-sm tracking-tight">Skeniraj za narudžbu 📱</p><p className="text- text-zinc-400 mt-1">Brzo • Bez čekanja</p></div>
              </div>
            )
          })}
        </div>
      </div>
      <style>{`@media print { @page { margin: 12mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
    </main>
  )
}
