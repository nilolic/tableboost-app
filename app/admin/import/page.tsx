"use client"
import { useState } from "react"

export default function ImportPdfPage(){
  const [file,setFile]=useState<File|null>(null)
  const [preview,setPreview]=useState<any>(null)
  const [loading,setLoading]=useState(false)
  const [result,setResult]=useState<any>(null)

  const callApi = async (save:boolean)=>{
    if(!file) return
    setLoading(true)
    setResult(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('save', save? 'true' : 'false')
    const r = await fetch('/api/admin/menu/import-pdf', { method:'POST', body: fd })
    const j = await r.json()
    if(save) setResult(j)
    else setPreview(j)
    setLoading(false)
    if(j.error) alert(j.error)
  }

  return(
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Uvoz menija iz PDF-a</h1>
      <p className="text-sm text-gray-500 mb-6">Uploadaj PDF cjenik - automatski pravimo kategorije i artikle za trenutni restoran (radi i kad si impersonate kao SUPER_ADMIN).</p>

      <div className="border-2 border-dashed rounded-xl p-8 bg-white text-center">
        <input type="file" accept=".pdf" onChange={e=>setFile(e.target.files?.[0]||null)} className="mx-auto block text-sm"/>
        {file && <p className="mt-3 text-sm font-medium">{file.name} - {(file.size/1024).toFixed(0)} KB</p>}
        <div className="flex gap-3 justify-center mt-6">
          <button disabled={!file||loading} onClick={()=>callApi(false)} className="px-5 py-2.5 rounded-lg bg-black text-white text-sm disabled:opacity-50">1. Pregledaj PDF</button>
          <button disabled={!file||loading} onClick={()=>callApi(true)} className="px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm disabled:opacity-50">2. Uvezi u meni</button>
        </div>
      </div>

      {preview?.categories && (
        <div className="mt-8">
          <h2 className="font-bold mb-3">Preview: {preview.totalItems} artikala u {preview.categories.length} kategorija</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {preview.categories.map((c:any,i:number)=>(
              <div key={i} className="border rounded-xl p-4 bg-white">
                <h3 className="font-bold mb-2">{c.name} <span className="text-xs font-normal text-gray-400">({c.items.length})</span></h3>
                <div className="text- space-y-1.5 max-h-64 overflow-auto">
                  {c.items.map((it:any,j:number)=><div key={j} className="flex justify-between gap-2"><span className="truncate">{it.name}</span><span className="font-mono shrink-0">{it.price.toFixed(2)}€</span></div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.success && (
        <div className="mt-8 p-5 bg-green-50 border border-green-200 rounded-xl">
          <h3 className="font-bold text-green-800 text-lg">✅ Uvezeno!</h3>
          <p className="text-sm mt-1 text-green-700">Kreirano kategorija: <b>{result.createdCats}</b>, artikala: <b>{result.createdItems}</b></p>
          <div className="flex gap-3 mt-4">
            <a href="/admin/categories" className="text-sm bg-white border px-4 py-2 rounded-lg">Vidi kategorije →</a>
            <a href="/admin/menu" className="text-sm bg-black text-white px-4 py-2 rounded-lg">Vidi prijevode →</a>
          </div>
        </div>
      )}
    </div>
  )
}
