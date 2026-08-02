"use client"
import { useState, useTransition } from "react"
import { addTable, addMultipleTables, deleteTable } from "./actions"

export default function ManageTables({ restaurantId, tables }: { restaurantId: string, tables: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string|null>(null)
  const [count, setCount] = useState(1)
  const [customNum, setCustomNum] = useState("")

  const handleAddOne = () => {
    setError(null)
    startTransition(async () => {
      try {
        const num = customNum? parseInt(customNum) : undefined
        await addTable(restaurantId, num)
        setCustomNum("")
      } catch (e:any) { setError(e.message) }
    })
  }
  const handleAddMany = () => {
    setError(null)
    startTransition(async () => {
      try { await addMultipleTables(restaurantId, count) } catch (e:any) { setError(e.message) }
    })
  }
  const handleDelete = (id: string) => {
    if (!confirm("Obrisati stol?")) return
    setError(null)
    startTransition(async () => {
      try { await deleteTable(id) } catch (e:any) { setError(e.message) }
    })
  }

  return (
    <div className="bg-white border border-zinc-200 rounded- p-6 mb-8 print:hidden">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
        <div>
          <h2 className="font-black text-lg">Upravljanje stolovima</h2>
          <p className="text-sm text-zinc-500">Trenutno: <b>{tables.length}</b> stolova</p>
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="text- font-bold uppercase text-zinc-500">Broj stola (opcionalno)</label>
            <input value={customNum} onChange={e=>setCustomNum(e.target.value)} placeholder="npr. 12" type="number" className="w- ml-2 md:ml-0 block border border-zinc-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <button disabled={isPending} onClick={handleAddOne} className="h- px-5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-black disabled:opacity-50">+ Dodaj stol</button>
          <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-2 h-">
            <input type="number" min={1} max={50} value={count} onChange={e=>setCount(parseInt(e.target.value)||1)} className="w-12 text-center text-sm outline-none" />
            <button disabled={isPending} onClick={handleAddMany} className="text-sm font-bold">+ Dodaj više</button>
          </div>
        </div>
      </div>

      {tables.length>0 && (
        <div className="flex flex-wrap gap-2">
          {tables.map((t:any)=>(
            <div key={t.id} className="group flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-sm">
              <span className="font-bold">Stol {t.number}</span>
              <button onClick={()=>handleDelete(t.id)} disabled={isPending} className="w-5 h-5 rounded-full bg-white border border-zinc-200 flex items-center justify-center text- hover:bg-red-50 hover:text-red-600 hover:border-red-200">✕</button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
      {isPending && <p className="mt-3 text-xs text-zinc-500">Spremam...</p>}
    </div>
  )
}
