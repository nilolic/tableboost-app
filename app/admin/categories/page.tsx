"use client"
import { useEffect, useState } from "react"

type Cat = { id:string, name:string, nameEn?:string|null, nameDe?:string|null, order:number, _count:{items:number} }

export default function CategoriesPage(){
  const [cats,setCats]=useState<Cat[]>([])
  const [newName,setNewName]=useState("")
  const [saving,setSaving]=useState<string|null>(null)

  const load=async()=>{
    const r=await fetch("/api/admin/categories")
    const d=await r.json()
    setCats(d.categories||[])
  }
  useEffect(()=>{load()},[])

  const add=async()=>{
    if(!newName.trim()) return
    setSaving("new")
    const r=await fetch("/api/admin/categories",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newName})})
    const j=await r.json()
    if(r.ok){ setNewName(""); setCats([...cats,j]) }
    else alert(j.error)
    setSaving(null)
  }

  const save=async(c:Cat)=>{
    setSaving(c.id)
    await fetch(`/api/admin/categories/${c.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:c.name,nameEn:c.nameEn,nameDe:c.nameDe,order:c.order})})
    setSaving(null)
  }

  const autoTrans=async(c:Cat)=>{
    setSaving(c.id)
    try{
      const t=async(txt:string,lang:string)=>{
        const r=await fetch("/api/admin/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:txt,targetLang:lang,sourceLang:"HR"})})
        const j=await r.json()
        return j.translated
      }
      const en=await t(c.name,"EN")
      const de=await t(c.name,"DE")
      setCats(p=>p.map(x=>x.id===c.id?{...x,nameEn:en,nameDe:de}:x))
      await fetch(`/api/admin/categories/${c.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({nameEn:en,nameDe:de})})
    }catch(e:any){alert(e.message)}
    setSaving(null)
  }

  const del=async(id:string)=>{
    if(!confirm("Obrisati kategoriju?")) return
    const r=await fetch(`/api/admin/categories/${id}`,{method:"DELETE"})
    const j=await r.json()
    if(!r.ok) alert(j.error)
    else setCats(p=>p.filter(x=>x.id!==id))
  }

  const move=async(id:string, dir: -1|1)=>{
    const idx=cats.findIndex(x=>x.id===id)
    const newIdx=idx+dir
    if(newIdx<0||newIdx>=cats.length) return
    const newCats=[...cats]
    const [moved]=newCats.splice(idx,1)
    newCats.splice(newIdx,0,moved)
    const withOrder=newCats.map((c,i)=>({...c,order:i}))
    setCats(withOrder)
    // save order
    await Promise.all(withOrder.map(c=>fetch(`/api/admin/categories/${c.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({order:c.order})})))
  }

  return(
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Kategorije</h1>
      <p className="text-sm text-gray-500 mb-6">Npr. Meso, Riba, Prilozi, Pića. Redoslijed određuje kako se prikazuju gostu.</p>

      <div className="flex gap-2 mb-6">
        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nova kategorija npr. Meso" className="border rounded px-3 py-2 flex-1" onKeyDown={e=>e.key==="Enter"&&add()}/>
        <button onClick={add} disabled={saving==="new"} className="bg-black text-white px-6 py-2 rounded">{saving==="new"?"...":"Dodaj"}</button>
      </div>

      <div className="space-y-2">
        {cats.map(c=>(
          <div key={c.id} className="border rounded-xl p-4 bg-white flex gap-3 items-start">
            <div className="flex flex-col gap-1">
              <button onClick={()=>move(c.id,-1)} className="border px-2 py-1 rounded text-xs">↑</button>
              <button onClick={()=>move(c.id,1)} className="border px-2 py-1 rounded text-xs">↓</button>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div><label className="text- font-bold">HR</label><input value={c.name} onChange={e=>setCats(p=>p.map(x=>x.id===c.id?{...x,name:e.target.value}:x))} className="w-full border rounded px-2 py-1.5 font-medium"/></div>
              <div><label className="text- font-bold text-blue-600">EN</label><input value={c.nameEn||""} onChange={e=>setCats(p=>p.map(x=>x.id===c.id?{...x,nameEn:e.target.value}:x))} placeholder="EN" className="w-full border border-blue-100 rounded px-2 py-1.5"/></div>
              <div><label className="text- font-bold text-red-600">DE</label><input value={c.nameDe||""} onChange={e=>setCats(p=>p.map(x=>x.id===c.id?{...x,nameDe:e.target.value}:x))} placeholder="DE" className="w-full border border-red-100 rounded px-2 py-1.5"/></div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button onClick={()=>save(c)} disabled={saving===c.id} className="bg-black text-white px-3 py-1 rounded text-xs">{saving===c.id?"...":"Spremi"}</button>
              <button onClick={()=>autoTrans(c)} disabled={saving===c.id} className="border bg-yellow-50 px-3 py-1 rounded text-xs">Prevedi</button>
              <button onClick={()=>del(c.id)} className="text-red-500 text-xs">Obriši ({c._count.items})</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
