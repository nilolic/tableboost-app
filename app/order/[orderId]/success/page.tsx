import { prisma } from "@/lib/prisma"
import Link from 'next/link'

export default async function SuccessPage({ params, searchParams }: { params: { orderId: string }, searchParams: { session_id?: string, method?: string, mock?: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { restaurant: true, table: true, items: { include: { menuItem: true } } }
  })

  if(!order) return <div className="p-10 text-center">Narudžba nije pronađena</div>

  const method = searchParams.method || order.paymentMethod || 'CASH'
  const isOnline = method === 'CARD_ONLINE'
  const isTerminal = method === 'CARD_TERMINAL'
  const isMock = searchParams.mock === '1'

  const methodLabel = isOnline ? 'Kartica online' : isTerminal ? 'POS terminal na stolu' : 'Gotovina'
  const methodIcon = isOnline ? '🌐' : isTerminal ? '💳' : '💵'
  const methodDesc = isOnline ? (isMock ? 'Test plaćanje simulirano - gost nije naplaćen' : 'Plaćanje karticom uspješno!') : isTerminal ? 'Konobar će donijeti POS terminal na vaš stol' : 'Platite konobaru na stolu'

  return (
    <div className="min-h-screen bg-[#fdf8f3] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[28px] shadow-xl border border-zinc-100 p-8 text-center">
        <div className={`w-16 h-16 rounded-full grid place-items-center text-2xl mx-auto mb-4 ${isOnline && !isMock ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
          {isOnline && !isMock ? '✓' : '◷'}
        </div>
        <h1 className="text-2xl font-black tracking-tight">
          {isOnline && !isMock ? 'Plaćanje uspješno!' : 'Narudžba zaprimljena!'}
        </h1>
        <p className="text-sm text-zinc-500 mt-2">{order.restaurant.name} • Stol {order.table.number} • {methodIcon} {methodLabel}</p>
        
        <div className={`mt-4 rounded-2xl p-3 text-sm font-medium ${isOnline ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
          {methodDesc}
        </div>

        <div className="mt-6 bg-zinc-50 rounded-2xl p-4 text-left text-sm space-y-2">
          {order.items.map(i=>(
            <div key={i.id} className="flex justify-between gap-2">
              <span className="flex-1">{i.menuItem.name} x{i.quantity}</span>
              <span className="font-bold">{(i.price*i.quantity).toFixed(2)}€</span>
            </div>
          ))}
          {order.tipAmount > 0 && (
            <div className="flex justify-between text-zinc-500"><span>Napojnica {order.tipPercent}%</span><span>{order.tipAmount.toFixed(2)}€</span></div>
          )}
          <div className="border-t pt-2 flex justify-between font-black text-[15px]"><span>Ukupno</span><span>{order.total.toFixed(2)}€</span></div>
          <div className="text-[11px] text-zinc-500 pt-1">ID: {order.id.slice(0,8)} • {new Date().toLocaleTimeString('hr-HR')}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-zinc-50 border rounded-xl p-2.5 text-left">
            <div className="font-bold">🍳 Kuhinja</div>
            <div className="text-zinc-500 mt-0.5">Hrana se priprema</div>
          </div>
          <div className="bg-zinc-50 border rounded-xl p-2.5 text-left">
            <div className="font-bold">🍹 Šank</div>
            <div className="text-zinc-500 mt-0.5">Piće stiže odmah</div>
          </div>
        </div>

        <Link href={`/menu/${order.restaurant.slug}?table=${order.table.number}`} className="mt-6 block w-full bg-black text-white py-3.5 rounded-full font-bold text-sm">Nazad na meni</Link>
        <p className="text-[10px] text-zinc-400 mt-3">Račun će donijeti konobar • Hvala!</p>
      </div>
    </div>
  )
}
