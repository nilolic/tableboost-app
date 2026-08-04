"use client"
import { useEffect, useState } from "react"

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

const SUBCATEGORY_MAP: Record<string, {name:string, nameEn:string, image:string, desc:string}[]> = {
  "Hrana": [
    {name:"Riba", nameEn:"Fish", image:"https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400", desc:"Svježa riba i morski plodovi"},
    {name:"Meso", nameEn:"Meat", image:"https://images.unsplash.com/photo-1546964052-d2934a92c4a5?w=400", desc:"Sočna mesa sa žara"},
    {name:"Burgeri", nameEn:"Burgers", image:"https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400", desc:"Gourmet burgeri"},
    {name:"Deserti", nameEn:"Desserts", image:"https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400", desc:"Domaći deserti"},
  ],
  "Piće": [
    {name:"Alkoholna", nameEn:"Alcoholic", image:"https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400", desc:"Žestoka pića"},
    {name:"Bezalkoholna", nameEn:"Non-Alcoholic", image:"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", desc:"Sokovi, vode"},
    {name:"Topli napitci", nameEn:"Hot Drinks", image:"https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400", desc:"Kave, čajevi"},
    {name:"Piva", nameEn:"Beers", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400", desc:"Točena i flaširana piva"},
  ],
  "Pice": [
    {name:"Alkoholna", nameEn:"Alcoholic", image:"https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400", desc:"Žestoka pića"},
    {name:"Bezalkoholna", nameEn:"Non-Alcoholic", image:"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", desc:"Sokovi, vode"},
    {name:"Topli napitci", nameEn:"Hot Drinks", image:"https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400", desc:"Kave, čajevi"},
    {name:"Piva", nameEn:"Beers", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400", desc:"Točena i flaširana piva"},
  ]
}

export default function CategoriesPage(){
  const [cats, setCats] = useState<Cat[]>([])
  const [all, setAll] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Cat|null>(null)
  const [showNew, setShowNew] = useState<{parentId:string|null}|null>(null)
  const [form, setForm] = useState({name:"", nameEn:"", nameDe:"", description:"", imageUrl:"", sendsToKitchen:false, parentId: null as string|null})

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

  // NOVI FULL SEED PO TVOM PLANU
  const seedFullStructure = async()=>{
    if(!confirm("Kreirati kompletnu shemu?\nFooter: Hrana, Piće, Kokteli, Vina\nHrana -> Riba, Meso, Burgeri, Deserti\nPiće -> Alkoholna, Bezalkoholna, Topli napitci, Piva\n(Sve sa slikama i kuhinja postavkama)")) return

    const mains = [
      {name:"Hrana", nameEn:"Food", nameDe:"Essen", sendsToKitchen:true, imageUrl:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", description:"Glavna jela - ide direktno u kuhinju 🍳"},
      {name:"Piće", nameEn:"Drinks", nameDe:"Getränke", sendsToKitchen:false, imageUrl:"https://images.unsplash.com/photo-1544148103-0772165dca03?w=800", description:"Sokovi, pivo, kava, alkohol"},
      {name:"Kokteli", nameEn:"Cocktails", nameDe:"Cocktails", sendsToKitchen:false, imageUrl:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800", description:"Kokteli i miks pića"},
      {name:"Vina", nameEn:"Wines", nameDe:"Weine", sendsToKitchen:false, imageUrl:"https://images.unsplash.com/photo-1510812431401-41d2bd2722f?w=800", description:"Crna, bijela, rose vina"},
    ]

    // 1. Kreiraj glavne ako ne postoje
    const createdMains: Record<string, any> = {}
    for(const m of mains){
      let existing = all.find(c=> c.name.toLowerCase()===m.name.toLowerCase() && !c.parentId)
      if(!existing){
        const res = await fetch("/api/admin/categories", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(m)})
        const data = await res.json()
        if(res.ok) existing = data
      }
      if(existing) createdMains[m.name] = existing
    }

    // reload da dobijemo ids
    await load()
    // pricekaj malo i ponovo dohvati
    const r = await fetch("/api/admin/categories")
    const d = await r.json()
    const freshAll = d.all||[]

    // 2. Kreiraj podkategorije
    for(const mainName of Object.keys(SUBCATEGORY_MAP)){
      const mainCat = freshAll.find((c:any)=> c.name.toLowerCase()===mainName.toLowerCase() && !c.parentId) || createdMains[mainName]
      if(!mainCat) continue
      const subs = SUBCATEGORY_MAP[mainName]
      const isKitchen = mainCat.sendsToKitchen || mainName.toLowerCase()==="hrana"
      for(const sub of subs){
        const exists = freshAll.find((c:any)=> c.parentId===mainCat.id && c.name.toLowerCase()===sub.name.toLowerCase())
        if(!exists){
          await fetch("/api/admin/categories", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({
            name: sub.name,
            nameEn: sub.nameEn,
            description: sub.desc,
            imageUrl: sub.image,
            parentId: mainCat.id,
            sendsToKitchen: isKitchen
          })})
        }
      }
    }

    alert("✅ Gotovo! Kreirane 4 glavne + 8 podkategorija po tvom planu!")
    load()
  }

  const moveExistingToHrana = async()=>{
    const hrana = all.find(c=>c.name.toLowerCase().includes("hrana") && !c.parentId)
    if(!hrana){alert("Prvo kreiraj kategoriju Hrana"); return}
    if(!confirm(`Premjestiti sve postojeće kategorije bez parenta (osim glavnih) pod ${hrana.name} kao podkategorije?`)) return
    const mainNames = ["hrana","piće","pice","kokteli","vina","vino"]
    const toMove = all.filter(c=>!c.parentId && !mainNames.includes(c.name.toLowerCase()))
    for(const c of toMove){
      await fetch(`/api/admin/categories/${c.id}`, {method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({parentId: hrana.id, sendsToKitchen:true})})
    }
    load()
  }

  if(loading) return <div className="p-8">Učitavam...</div>

  return(
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Kategorije • Hijerarhija</h1>
          <p className="text-sm text-zinc-500 mt-1">Footer gostu: <b>Hrana</b> (Riba, Meso, Burgeri, Deserti) • <b>Piće</b> (Alkoholna, Bezalkoholna, Topli, Piva) • <b>Kokteli</b> • <b>Vina</b>. Sve editable + slike.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={seedFullStructure} className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-black shadow">✨ Seed po planu (4+8)</button>
          <button onClick={moveExistingToHrana} className="px-4 py-2 rounded-full border text-sm font-bold bg-amber-50">Premjesti stare pod Hrana</button>
          <button onClick={()=>startNew(null)} className="px-4 py-2 rounded-full border bg-white text-sm font-bold">+ Nova glavna</button>
        </div>
      </div>

      {(showNew || editing) && (
        <div className="mb-8 p-5 rounded-2xl bg-white border shadow-lg max-w-2xl">
          <h3 className="font-bold mb-3">{editing? "Uredi kategoriju" : showNew?.parentId ? "Nova podkategorija" : "Nova glavna kategorija"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Naziv HR *" className="border rounded-xl px-3 py-2 text-sm col-span-2"/>
            <input value={form.nameEn} onChange={e=>setForm({...form, nameEn:e.target.value})} placeholder="Name EN" className="border rounded-xl px-3 py-2 text-sm"/>
            <input value={form.nameDe} onChange={e=>setForm({...form, nameDe:e.target.value})} placeholder="Name DE" className="border rounded-xl px-3 py-2 text-sm"/>
            <input value={form.imageUrl} onChange={e=>setForm({...form, imageUrl:e.target.value})} placeholder="Image URL (https://images.unsplash.com/...)" className="border rounded-xl px-3 py-2 text-sm col-span-2"/>
            <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Opis kategorije" className="border rounded-xl px-3 py-2 text-sm col-span-2" rows={2}/>
            <label className="flex items-center gap-2 text-sm col-span-2 bg-zinc-50 p-2 rounded-xl border">
              <input type="checkbox" checked={form.sendsToKitchen} onChange={e=>setForm({...form, sendsToKitchen:e.target.checked})}/>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${form.sendsToKitchen? "bg-orange-500 text-white":"bg-zinc-200"}`}>Šalje se u kuhinju 🍳</span>
              <span className="text-zinc-500 text-xs ml-1">Samo Hrana + Riba/Meso/Burgeri/Deserti = ON, ostalo OFF</span>
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
                  <p className="text-white/80 text-xs">{main._count?.items||0} artikala • {main.children?.length||0} podkat</p>
                </div>
                {main.sendsToKitchen && <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">KUHINJA</span>}
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
                  <div key={sub.id} className="group flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition">
                    <div className="w-11 h-11 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border">
                      <img src={sub.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{sub.name}</div>
                      <div className="text-xs text-zinc-500 truncate">{sub._count?.items||0} artikala {sub.sendsToKitchen?"• KUHINJA":""}</div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={()=>startEdit(sub)} className="w-7 h-7 rounded-full bg-white border text-xs shadow-sm">✎</button>
                      <button onClick={()=>del(sub.id)} className="w-7 h-7 rounded-full bg-red-50 text-red-600 text-xs border">✕</button>
                    </div>
                  </div>
                ))}
                {(!main.children || main.children.length===0) && <div className="text-xs text-zinc-400 py-6 text-center border border-dashed rounded-2xl bg-zinc-50/50">Nema podkategorija<br/>Dodaj Riba, Meso, Burgeri...</div>}
              </div>
            </div>
          </div>
        ))}
        {cats.length===0 && <div className="col-span-4 py-12 text-center border-2 border-dashed rounded-3xl bg-white"><p className="font-bold">Nema glavnih kategorija</p><p className="text-sm text-zinc-500">Klikni ✨ Seed po planu</p></div>}
      </div>

      <div className="bg-gradient-to-br from-zinc-900 to-black text-white rounded-2xl p-5 mb-8">
        <h4 className="font-black text-sm mb-2">✅ Tvoj plan - kako radi:</h4>
        <div className="grid md:grid-cols-2 gap-4 text-xs leading-relaxed text-zinc-300">
          <div><b className="text-white">Footer gostu:</b><br/>Hrana, Piće, Kokteli, Vina (4 glavne)<br/><b className="text-white">Hrana →</b> Riba, Meso, Burgeri, Deserti (sve KUHINJA 🍳)<br/><b className="text-white">Piće →</b> Alkoholna, Bezalkoholna, Topli napitci, Piva (ŠANK)</div>
          <div><b className="text-white">Slike:</b> Svaka kategorija/podkat/artikl ima imageUrl<br/><b className="text-white">Kuhinja:</b> Samo Hrana + njene podkategorije idu na KUHINJA ekran<br/><b className="text-white">Admin:</b> Može dodavati nove kategorije/podkat u hodu</div>
        </div>
      </div>
    </div>
  )
}
