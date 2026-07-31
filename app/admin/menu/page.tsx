"use client"
import { useEffect, useState } from "react"
type Item = { id: string; name: string; nameEn?: string|null; nameDe?: string|null; description?: string|null; descriptionEn?: string|null; descriptionDe?: string|null; price: number; category: {name:string} }
export default function AdminMenuPage(){
  const [items,setItems]=useState<Item[]>([])
  const [filter,setFilter]=useState("")
  const [saving,setSaving]=useState<string|null>(null)
  const load=async()=>{const r=await fetch("/api/admin/menu");const d=await r.json();setItems(d.items||[])}
  useEffect(()=>{load()},[])
  const save=async(it:Item)=>{
    setSaving(it.id)
    await fetch(`/api/admin/menu/${it.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:it.name,nameEn:it.nameEn,nameDe:it.nameDe,description:it.description,descriptionEn:it.descriptionEn,descriptionDe:it.descriptionDe})})
    setSaving(null)
  }
  const t=async(txt:string,lang:"EN"|"DE")=>{
    if(!txt?.trim()) return ""
    const r=await fetch("/api/admin/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:txt,targetLang:lang,sourceLang:"HR"})})
    const j=await r.json()
    if(!r.ok) throw new Error(j.error)
    return j.translated
  }
  const auto=async(it:Item)=>{
    setSaving(it.id)
    try{
      // prvo spremi HR
      await fetch(`/api/admin/menu/${it.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:it.name,description:it.description})})
      const [enN,deN,enD,deD]=await Promise.all([
        t(it.name,"EN"), t(it.name,"DE"),
        it.description? t(it.description,"EN") : Promise.resolve(it.descriptionEn||""),
        it.description? t(it.description,"DE") : Promise.resolve(it.descriptionDe||"")
      ])
      const updated={...it,nameEn:enN,nameDe:deN,descriptionEn:enD,descriptionDe:deD}
      setItems(p=>p.map(x=>x.id===it.id?updated:x))
      await fetch(`/api/admin/menu/${it.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({nameEn:enN,nameDe:deN,descriptionEn:enD,descriptionDe:deD})})
    }catch(e:any){alert(e.message)}
    setSaving(null)
  }
  const f=items.filter(i=>i.name.toLowerCase().includes(filter.toLowerCase()))
  return(
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Prijevodi menija</h1>
      <p className="text-sm text-gray-500 mb-4">Upiši HR → Spremi → Auto prevedi. DeepL prevodi i naziv i opis. Ručno možeš popraviti EN/DE pa opet Spremi.</p>
      <input placeholder="Filtriraj..." value={filter} onChange={e=>setFilter(e.target.value)} className="border px-3 py-2 rounded w-80 mb-4"/>
      <div className="space-y-3">
        {f.map(it=>(
          <div key={it.id} className="border rounded-xl p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><label className="text-xs font-bold">HR</label><input value={it.name} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,name:e.target.value}:x))} className="w-full border rounded px-2 py-1.5 mt-1 font-medium"/><textarea value={it.description||""} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,description:e.target.value}:x))} className="w-full border rounded px-2 py-1 mt-1 text-sm" rows={3} placeholder="Opis HR"/></div>
              <div><label className="text-xs font-bold text-blue-600">EN</label><input value={it.nameEn||""} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,nameEn:e.target.value}:x))} className="w-full border border-blue-200 rounded px-2 py-1.5 mt-1"/><textarea value={it.descriptionEn||""} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,descriptionEn:e.target.value}:x))} className="w-full border border-blue-200 rounded px-2 py-1 mt-1 text-sm" rows={3} placeholder="Description EN"/></div>
              <div><label className="text-xs font-bold text-red-600">DE</label><input value={it.nameDe||""} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,nameDe:e.target.value}:x))} className="w-full border border-red-200 rounded px-2 py-1.5 mt-1"/><textarea value={it.descriptionDe||""} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,descriptionDe:e.target.value}:x))} className="w-full border border-red-200 rounded px-2 py-1 mt-1 text-sm" rows={3} placeholder="Beschreibung DE"/></div>
            </div>
            <div className="flex gap-2 mt-3">
              <button disabled={saving===it.id} onClick={()=>save(it)} className="bg-black text-white px-4 py-1.5 rounded text-sm">{saving===it.id?"...":"Spremi"}</button>
              <button disabled={saving===it.id} onClick={()=>auto(it)} className="border bg-yellow-50 px-4 py-1.5 rounded text-sm">Auto prevedi naziv+opis</button>
              <span className="text-xs text-gray-400 ml-auto">{it.price}€ - {it.category?.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
