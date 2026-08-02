"use client"
import { useState, useTransition } from "react"
import { addTable, addMultipleTables, deleteTable } from "./actions"

export default function ManageTables({ restaurantId, tables, initialLogo }: { restaurantId: string, tables: any[], initialLogo?: string|null }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string|null>(null)
  const [count, setCount] = useState(1)
  const [customNum, setCustomNum] = useState("")
  const [tab, setTab] = useState<"tables"|"logo">("tables")
  const [logo, setLogo] = useState(initialLogo || "")
  const [uploading, setUploading] = useState(false)

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "logo")
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload fail")
      setLogo(data.url)
      // spremi u restaurant
      const patch = await fetch("/api/admin/restaurant", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ logoUrl: data.url }) })
      if (!patch.ok) {
        const d = await patch.json()
        throw new Error(d.error || "Ne mogu spremiti logo")
      }
      // reload da se vidi u QR
      location.reload()
    } catch (err:any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!confirm("Maknuti logo iz QR koda?")) return
    setUploading(true)
    try {
      const patch = await fetch("/api/admin/restaurant", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ logoUrl: "" }) })
      if (!patch.ok) throw new Error("Greška")
      setLogo("")
      location.reload()
    } catch (e:any) { setError(e.message) } finally { setUploading(false) }
  }

  return (
    <div className="bg-white border border-zinc-200 rounded- p-6 mb-8 print:hidden">
      <div className="flex gap-2 mb-6 border-b border-zinc-100 pb-2">
        <button onClick={()=>setTab("tables")} className={`px-4 py-2 rounded-full text-sm font-bold transition ${tab==="tables"? "bg-zinc-900 text-white":"bg-zinc-50 text-zinc-600 hover:bg-zinc-100"}`}>🪑 Stolovi ({tables.length})</button>
        <button onClick={()=>setTab("logo")} className={`px-4 py-2 rounded-full text-sm font-bold transition ${tab==="logo"? "bg-zinc-900 text-white":"bg-zinc-50 text-zinc-600 hover:bg-zinc-100"}`}>🖼️ Logo u QR-u</button>
      </div>

      {tab==="tables" && (
        <>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
            <div>
              <h2 className="font-black text-lg">Upravljanje stolovima</h2>
              <p className="text-sm text-zinc-500">Povećaj / smanji broj stolova. Brisanje je blokirano ako stol ima aktivne narudžbe.</p>
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
        </>
      )}

      {tab==="logo" && (
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div>
            <h2 className="font-black text-lg">Logo unutar QR koda</h2>
            <p className="text-sm text-zinc-500 mt-1">Logo se prikazuje u sredini QR koda. Preporuka: kvadratni PNG/JPG, min 300x300px, s bijelom pozadinom.</p>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs font-bold uppercase text-zinc-600">Upload logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-zinc-900 file:text-white hover:file:bg-black" />
              </label>
              {logo && (
                <button onClick={handleRemoveLogo} disabled={uploading} className="text-sm text-red-600 font-bold hover:underline">Ukloni logo iz QR-a</button>
              )}
              {uploading && <p className="text-xs text-zinc-500">Uploadam...</p>}
            </div>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col items-center">
            <p className="text-xs font-bold uppercase text-zinc-500 mb-3">Preview kako će izgledati u QR-u</p>
            {logo? (
              <div className="relative w- h- bg-white rounded-xl border border-zinc-200 p-2">
                <div className="w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] opacity-20 rounded-lg"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded- shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-zinc-100">
                  <img src={logo} alt="logo preview" className="w-12 h-12 object-cover rounded-" />
                </div>
              </div>
            ) : (
              <div className="w- h- bg-white border border-dashed border-zinc-300 rounded-xl flex items-center justify-center text-xs text-zinc-400 text-center p-4">Nema loga.<br/>QR će biti bez loga.</div>
            )}
            <p className="text- text-zinc-400 mt-3 text-center">Logo se automatski stavlja u sredinu svih QR kodova ispod.</p>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
      {isPending && <p className="mt-3 text-xs text-zinc-500">Spremam...</p>}
    </div>
  )
}
