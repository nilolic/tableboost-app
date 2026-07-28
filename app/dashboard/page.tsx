import { prisma } from "@/lib/prisma"
export default async function Dashboard() {
  const count = await prisma.restaurant.count().catch(() => 0)
  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-black mb-2">Dashboard</h1>
      <p className="text-neutral-600 mb-8">Baza spojena: tableboost_db • Restorana: {count}</p>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Narudžbe danas</div><div className="text-3xl font-bold mt-2">0</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Promet danas</div><div className="text-3xl font-bold mt-2">€0</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Aktivni stolovi</div><div className="text-3xl font-bold mt-2">0</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Restorani</div><div className="text-3xl font-bold mt-2">{count}</div></div>
      </div>
      <div className="mt-10 bg-black text-white rounded- p-8">
        <h2 className="text-2xl font-bold mb-2">Sljedeći korak:</h2>
        <ol className="list-decimal ml-6 space-y-2 text-neutral-300">
          <li>Otvori Prisma Studio: npx prisma studio</li>
          <li>Dodaj prvi restoran (slug npr: konoba-kastela)</li>
          <li>Dodaj kategoriju i jela</li>
          <li>Otvori /menu/konoba-kastela da vidiš QR meni</li>
        </ol>
      </div>
    </main>
  )
}
