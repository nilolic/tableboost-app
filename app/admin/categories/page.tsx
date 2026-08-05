"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Cat = {
  id: string
  name: string
  nameEn?: string|null
  nameDe?: string|null
  description?: string|null
  imageUrl?: string|null
  order: number
  parentId?: string|null
  sendsToKitchen: boolean
  _count?: { items: number, children?: number }
  children?: Cat[]
}

const DEFAULT_IMAGES: Record<string,string> = {
  "Hrana": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
  "Piće": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600",
  "Pice": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600",
  "Kokteli": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600",
  "Vina": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f?w=600",
}

export default function CategoriesPage(){
  const router = useRouter()
  const [cats, setCats] = useState<Cat[]>([])
  const [all, setAll] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Cat|null>(null)
  const [showNew, setShowNew] = useState<{parentId:string|null}|null>(null)
  const [form, setForm] = useState({name:"", nameEn:"", nameDe:"", description:"", imageUrl:"", sendsToKitchen:false, parentId: null as string|null})
  const [translating, setTranslating] = useState(false)
  const [bulkTranslating, setBulkTranslating] = useState(false)

  const load = async()=>{
    setLoading(true)
    const r = await fetch("/api/admin/categories")
    const d = await r.json()
    setCats(d.categories||[])
    setAll(d.all||d.categories||[])
    setLoading(false)
  }
  useEffect(()=>{load()},[])

  const resetForm = ()=>{
    setForm({name:"", nameEn:"", nameDe:"", description:"", imageUrl:"", sendsToKitchen:false, parentId: null})
    setEditing(null)
    setShowNew(null)
  }

  const translateText = async (text:string, target:"EN"|"DE")=>{
    const res = await fetch("/api/admin/translate", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({text, targetLang: target})})
    const data = await res.json()
    if(!res.ok) throw new Error(data.error||"Greška prijevoda")
    return data.translated || data.translation
  }

  const handleAutoTranslate = async ()=>{
    if(!form.name.trim()){alert("Prvo upiši naziv na HR"); return}
    setTranslating(true)
    try{
      const [en, de] = await Promise.all([
        translateText(form.name, "EN"),
        translateText(form.name, "DE")
      ])
      setForm(f=>({...f, nameEn: en, nameDe: de}))
    }catch(e:any){alert(e.message)}finally{setTranslating(false)}
  }

  const bulkTranslateAll = async ()=>{
    const toTranslate = all.filter(c=>!c.nameEn ||!c.nameDe)
    if(toTranslate.length===0){alert("Sve kategorije već imaju prijevode!"); return}
    if(!confirm(`Prevesti ${toTranslate.length} kategorija koje nemaju prijevod? (HR -> EN, DE)`)) return
    setBulkTranslating(true)
    try{
      for(const cat of toTranslate){
        try{
          const en =!cat.nameEn? await translateText(cat.name, "EN") : cat.nameEn
          const de =!cat.nameDe? await translateText(cat.name, "DE") : cat.nameDe
          await fetch(`/api/admin/categories/${cat.id}`, {method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({nameEn: en, nameDe: de})})
        }catch(e){console.error("fail", cat.name, e)}
      }
      await load()
      alert("Gotovo! Sve prevedeno.")
    }catch(e:any){alert(e.message)}finally{setBulkTranslating(false)}
  }

  const save = async()=>{
    if(!form.name.trim()){alert("Ime obavezno"); return}
    try{
      let res
      if(editing){
        res = await fetch(`/api/admin/categories/${editing.id}`, {method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form)})
      } else {
        res = await fetch(`/api/admin/categories`, {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form)})
      }
      const data = await res.json()
      if(!res.ok) throw new Error(data.error)
      await load()
      resetForm()
    }catch(e:any){alert(e.message)}
  }

  const del = async(id:string)=>{
    if(!confirm("Obrisati kategoriju?")) return
    const r = await fetch(`/api/admin/categories/${id}`, {method:"DELETE"})
    const d = await r.json()
    if(!r.ok){alert(d.error); return}
    load()
  }

  const startEdit = (c:Cat)=>{
    setEditing(c)
    setForm({name:c.name, nameEn:c.nameEn||"", nameDe:c.nameDe||"", description:c.description||"", imageUrl:c.imageUrl||"", sendsToKitchen:c.sendsToKitchen, parentId:c.parentId||null})
    setShowNew(null)
    window.scrollTo({top:0, behavior:'smooth'})
  }

  const startNew = (parentId:string|null, isKitchen:boolean=false)=>{
    setEditing(null)
    setShowNew({parentId})
    setForm({name:"", nameEn:"", nameDe:"", description:"", imageUrl:"", sendsToKitchen: isKitchen, parentId})
    window.scrollTo({top:0, behavior:'smooth'})
  }

  const seedFullStructure = async()=>{
    if(!confirm("Kreirati kompletnu shemu?\nFooter: Hrana, Piće, Kokteli, Vina\nHrana -> Riba, Meso, Burgeri, Deserti\nPiće -> Alkoholna, Bezalkoholna, Topli napitci, Piva")) return

    const mains = [
      {name:"Hrana", nameEn:"Food", nameDe:"Essen", sendsToKitchen:true, imageUrl:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", description:""},
      {name:"Piće", nameEn:"Drinks", nameDe:"Getränke", sendsToKitchen:false, imageUrl:"https://images.unsplash.com/photo-1544148103-0772165dca03?w=800", description:""},
      {name:"Kokteli", nameEn:"Cocktails", nameDe:"Cocktails", sendsToKitchen:false, imageUrl:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800", description:""},
      {name:"Vina", nameEn:"Wines", nameDe:"Weine", sendsToKitchen:false, imageUrl:"https://images.unsplash.com/photo-1510812431401-41d2bd2722f?w=800", description:""},
    ]

    const createdMains: Record<string, any> = {}
    for(const m of mains){
      let existing = all.find(c=> c.name.toLowerCase()===m.name.toLowerCase() &&!c.parentId)
      if(!existing){
        const res = await fetch("/api/admin/categories", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(m)})
        const data = await res.json()
        if(res.ok) createdMains[m.name]=data
        else console.error(data)
      } else createdMains[m.name]=existing
    }
    await load()

    const subMap: Record<string,string[]> = {
      "Hrana": ["Riba","Meso","Burgeri","Deserti"],
      "Piće": ["Alkoholna","Bezalkoholna","Topli napitci","Piva"],
    }
    const subDetails: Record<string,{en:string,de:string,img:string}> = {
      "Riba":{en:"Fish",de:"Fisch",img:"https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400"},
      "Meso":{en:"Meat",de:"Fleisch",img:"https://images.unsplash.com/photo-1546964052-d2934a92c4a5?w=400"},
      "Burgeri":{en:"Burgers",de:"Burger",img:"https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400"},
      "Deserti":{en:"Desserts",de:"Desserts",img:"https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400"},
      "Alkoholna":{en:"Alcoholic",de:"Alkoholisch",img:"https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400"},
      "Bezalkoholna":{en:"Non-Alcoholic",de:"Alkoholfrei",img:"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400"},
      "Topli napitci":{en:"Hot Drinks",de:"Heißgetränke",img:"https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400"},
      "Piva":{en:"Beers",de:"Biere",img:"https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400"},
    }
    for(const mainName in subMap){
      const parent = createdMains[mainName] || all.find(c=>c.name===mainName &&!c.parentId)
      if(!parent) continue
      for(const subName of subMap[mainName]){
        const exists = all.find(c=>c.name===subName && c.parentId===parent.id)
        if(exists) continue
        const det = subDetails[subName]
        await fetch("/api/admin/categories", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({name:subName, nameEn:det.en, nameDe:det.de, imageUrl:det.img, parentId: parent.id, sendsToKitchen: parent.sendsToKitchen})})
      }
    }
    await load()
    alert("Shema kreirana sa prijevodima!")
  }

  if(loading) return <div className="p-10">Učitavam...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black tracking-tight">Kategorije • {cats.length} glavnih</h1>
        <div className="flex gap-2">
          <button disabled={bulkTranslating} onClick={bulkTranslateAll} className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-lg disabled:opacity-50">
            {bulkTranslating? "⏳ Prevodim..." : "🌐 Prevedi sve što fali (EN/DE)"}
          </button>
          <button onClick={seedFullStructure} className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold">✨ Seed po planu (4+8)</button>
          <button onClick={()=>startNew(null)} className="px-4 py-2 rounded-full border bg-white text-sm font-bold">+ Nova glavna</button>
        </div>
      </div>

      {(showNew || editing) && (
        <div className="mb-8 p-5 rounded-2xl bg-white border shadow-lg max-w-2xl">
          <h3 className="font-bold mb-3 flex justify-between">
            <span>{editing? "Uredi kategoriju" : showNew?.parentId? "Nova podkategorija" : "Nova glavna kategorija"}</span>
            <span className="text-xs text-zinc-400">HR → auto EN/DE</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-zinc-500">Naziv HR *</label>
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="npr. Riba" className="border rounded-xl px-3 py-2.5 text-sm w-full font-medium"/>
            </div>

            <div className="col-span-2 flex gap-2">
              <button disabled={translating} onClick={handleAutoTranslate} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-black shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                {translating? "⏳ Prevodim..." : "🌐 Automatski prevedi HR → EN + DE"}
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500">Name EN</label>
              <input value={form.nameEn} onChange={e=>setForm({...form, nameEn:e.target.value})} placeholder="Fish" className="border rounded-xl px-3 py-2 text-sm w-full"/>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500">Name DE</label>
              <input value={form.nameDe} onChange={e=>setForm({...form, nameDe:e.target.value})} placeholder="Fisch" className="border rounded-xl px-3 py-2 text-sm w-full"/>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-zinc-500">Image URL</label>
              <input value={form.imageUrl} onChange={e=>setForm({...form, imageUrl:e.target.value})} placeholder="https://images.unsplash.com/..." className="border rounded-xl px-3 py-2 text-sm w-full"/>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-zinc-500">Opis (opcionalno, ne prikazuje se gostu ako sadrži kuhinja)</label>
              <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Opis kategorije" className="border rounded-xl px-3 py-2 text-sm w-full" rows={2}/>
            </div>
            <label className="flex items-center gap-2 text-sm col-span-2 bg-zinc-50 p-2.5 rounded-xl border">
              <input type="checkbox" checked={form.sendsToKitchen} onChange={e=>setForm({...form, sendsToKitchen:e.target.checked})}/>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${form.sendsToKitchen? "bg-orange-500 text-white":"bg-zinc-200"}`}>Šalje se u kuhinju</span>
              <span className="text-zinc-500 text-xs ml-1">Samo Hrana + podkat = ON</span>
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold">Spremi</button>
            <button onClick={resetForm} className="border px-6 py-2.5 rounded-full text-sm font-bold">Odustani</button>
          </div>
          {form.imageUrl && <img src={form.imageUrl} className="mt-3 w-full h-40 object-cover rounded-xl border"/>}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cats.map(main=>(
          <div key={main.id} className="rounded-3xl overflow-hidden bg-white border shadow-sm flex flex-col">
            <div className="h-36 relative bg-zinc-100 shrink-0">
              <img src={main.imageUrl || DEFAULT_IMAGES[main.name] || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600"} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"/>
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <div>
                  <h2 className="text-white font-black text-lg leading-tight drop-shadow">{main.name}</h2>
                  <p className="text-white/80 text-xs">{main.nameEn||"no EN"} • {main.nameDe||"no DE"} • {main._count?.items||0} artikala</p>
                </div>
              </div>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <div className="flex gap-1.5 mb-3">
                <button onClick={()=>startEdit(main)} className="text-xs px-3 py-1.5 rounded-full border font-bold hover:bg-zinc-50">Uredi</button>
                <button onClick={()=>startNew(main.id, main.sendsToKitchen)} className="text-xs px-3 py-1.5 rounded-full bg-black text-white font-bold">+ Podkat</button>
                <button onClick={()=>del(main.id)} className="text-xs px-2.5 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100">✕</button>
              </div>
              <div className="space-y-1.5 flex-1">
                {(main.children||[]).sort((a,b)=>a.order-b.order).map(sub=>(
                  <div key={sub.id} onClick={()=>router.push(`/admin/items?cat=${sub.id}`)} className="group flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition cursor-pointer">
                    <div className="w-11 h-11 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border">
                      <img src={sub.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{sub.name} <span className="text-zinc-400 text-xs">/ {sub.nameEn||"-"} / {sub.nameDe||"-"}</span></div>
                      <div className="text-xs text-zinc-500 truncate">{sub._count?.items||0} artikala • klik za artikle</div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={(e)=>{e.stopPropagation(); startEdit(sub)}} className="w-7 h-7 rounded-full bg-white border text-xs shadow-sm">✎</button>
                      <button onClick={(e)=>{e.stopPropagation(); del(sub.id)}} className="w-7 h-7 rounded-full bg-red-50 text-red-600 text-xs border">✕</button>
                    </div>
                  </div>
                ))}
                {(!main.children || main.children.length===0) && <div className="text-xs text-zinc-400 py-6 text-center border border-dashed rounded-2xl bg-zinc-50/50">Nema podkategorija</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
