export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { prisma } from "@/lib/prisma"
import PrintButton from "./PrintButton"

export default async function QRPrintPage() {
  const tables = await prisma.table.findMany({
    include: { restaurant: true },
    orderBy: [{ restaurantId: 'asc' }, { number: 'asc' }]
  })

  return (
    <main className="p-4 md:p-8 bg-[#f8fafc] min-h-screen print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div>
            <h1 className="text-3xl font-black tracking-tight">QR Kodovi za ispis</h1>
            <p className="text-sm text-zinc-500 mt-1">Novi dizajn • bez linka • s logom objekta</p>
          </div>
          <PrintButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
          {tables.map(table => {
            const url = `https://tableboost.app/menu/${table.qrSlug}`
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(url)}&qzone=1`
            const logo = (table.restaurant as any).logoUrl
            return (
              <div key={table.id} className="bg-white border border-zinc-200 rounded- p-7 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] print:shadow-none print:border-2 print:border-black print:rounded- break-inside-avoid">
                {/* HEADER */}
                <div className="flex flex-col items-center">
                  {logo? (
                    <img src={logo} alt="logo" className="w-16 h-16 rounded-2xl object-cover shadow-sm mb-3" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-xl font-black mb-3">
                      {table.restaurant.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h2 className="font-black text- tracking-tight leading-tight uppercase text-zinc-900">{table.restaurant.name}</h2>
                  <div className="mt-2 inline-flex items-center px-3.5 py-1.5 rounded-full bg-zinc-900 text-white text- font-bold tracking-widest">STOL {table.number}</div>
                </div>

                {/* QR */}
                <div className="mt-6 bg-white rounded- p-3 border border-zinc-100">
                  <img src={qrUrl} alt={`QR ${table.qrSlug}`} className="w-full aspect-square mx-auto rounded-xl" />
                </div>

                {/* FOOTER CTA - bez linka */}
                <div className="mt-5">
                  <p className="font-bold text-sm tracking-tight">Skeniraj za narudžbu 📱</p>
                  <p className="text- text-zinc-400 mt-1">Brzo • Jednostavno • Bez čekanja</p>
                </div>
              </div>
            )
          })}
        </div>
        {tables.length === 0 && <p className="text-center opacity-60 mt-20">Nema stolova. Dodaj ih u /admin/qr ili Prisma Studio.</p>}
      </div>

      <style>{`
        @media print {
          @page { margin: 12mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </main>
  )
}
