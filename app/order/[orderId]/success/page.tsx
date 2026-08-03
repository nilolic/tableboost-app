import { prisma } from "@/lib/prisma"
import Link from 'next/link'

export default async function SuccessPage({ params, searchParams }: { params: { orderId: string }, searchParams: { session_id?: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { restaurant: true, table: true, items: { include: { menuItem: true } } }
  })

  if(!order) return <div className="p-10 text-center">Narudžba nije pronađena</div>

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border p-8 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full grid place-items-center text-2xl mx-auto mb-4">✓</div>
        <h1 className="text-2xl font-bold">Plaćanje uspješno!</h1>
        <p className="text-sm opacity-60 mt-2">{order.restaurant.name} • Stol {order.table.number}</p>
        <div className="mt-6 bg-zinc-50 rounded-2xl p-4 text-left text-sm space-y-2">
          {order.items.map(i=>(
            <div key={i.id} className="flex justify-between"><span>{i.menuItem.name} x{i.quantity}</span><span>{(i.price*i.quantity).toFixed(2)}€</span></div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold"><span>Ukupno</span><span>{order.total.toFixed(2)}€</span></div>
        </div>
        <p className="text-xs opacity-50 mt-4">ID narudžbe: {order.id.slice(0,8)}</p>
        <Link href={`/menu/${order.restaurant.slug}`} className="mt-6 block w-full bg-black text-white py-3 rounded-full font-bold text-sm">Nazad na meni</Link>
      </div>
    </div>
  )
}
