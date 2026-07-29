import { prisma } from "@/lib/prisma"
import PrintButton from "./PrintButton"

export default async function QRPrintPage() {
  const tables = await prisma.table.findMany({
    include: { restaurant: true },
    orderBy: [{ restaurantId: 'asc' }, { number: 'asc' }]
  })

  return (
    <main className="p-8 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black">QR Kodovi za ispis</h1>
          <PrintButton />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {tables.map(table => {
            const url = `https://tableboost.app/menu/${table.qrSlug}`
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`
            return (
              <div key={table.id} className="border-2 border-black rounded-2xl p-6 text-center">
                <h2 className="font-black text-xl mb-1">{table.restaurant.name}</h2>
                <p className="font-bold text-lg mb-4">STOL {table.number}</p>
                <img src={qrUrl} alt={`QR ${table.qrSlug}`} className="w-full aspect-square mx-auto mb-4" />
                <p className="text-xs opacity-60 break-all">{url}</p>
              </div>
            )
          })}
        </div>
        {tables.length === 0 && <p className="text-center opacity-60">Nema stolova. Dodaj ih u Prisma Studio.</p>}
      </div>
    </main>
  )
}
