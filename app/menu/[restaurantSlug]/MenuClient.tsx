'use client'
import { useState, useRef, useMemo, useEffect } from 'react'

type Item = { 
  id:string, name:string, nameEn?:string|null, nameDe?:string|null, 
  description?:string|null, price:number, imageUrl?:string|null, 
  categoryId:string, sendsToKitchen?:boolean
}
type SubCat = { 
  id:string, name:string, nameEn?:string|null, nameDe?:string|null, 
  imageUrl?:string|null, description?:string|null, items: Item[], order:number,
  sendsToKitchen:boolean
}
type MainCat = { 
  id:string, name:string, nameEn?:string|null, nameDe?:string|null, 
  imageUrl?:string|null, description?:string|null, order:number, 
  children: SubCat[], items: Item[], sendsToKitchen:boolean
}

const MAIN_IMAGES: Record<string,string> = {
  "Hrana": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
  "Piće": "https://images.unsplash.com/photo-1544148103-0772165dca03?w=800&h=600&fit=crop",
  "Pice": "https://images.unsplash.com/photo-1544148103-0772165dca03?w=800&h=600&fit=crop",
  "Kokteli": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop",
  "Vina": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f?w=800&h=600&fit=crop",
}
const SUB_IMAGES: Record<string,string> = {
  "Riba": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400",
  "Meso": "https://images.unsplash.com/photo-1546964052-d2934a92c4a5?w=400",
  "Burgeri": "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400",
  "Deserti": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
  "Alkoholna": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400",
  "Bezalkoholna": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400",
  "Topli napitci": "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400",
  "Piva": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400",
}

export default function MenuClient({ restaurant, tableNumber, mains, lang, slug }: { restaurant:any, tableNumber:number|null, mains:MainCat[], lang:'hr'|'en'|'de', slug:string }) {
  const [cart, setCart] = useState<{id:string, qty:number}[]>([])
  const [activeMain, setActiveMain] = useState(mains[0]?.id || "")
  const [activeSub, setActiveSub] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [showCart, setShowCart] = useState(false)
  const [sending, setSending] = useState(false)
  const subRefs = useRef<Record<string, any>>({})

  const t = (hr:string, en?:string|null, de?:string|null)=> lang==='en'?(en||hr):lang==='de'?(de||hr):hr

  useEffect(()=>{ setActiveSub("all") }, [activeMain])

  const currentMain = mains.find(m=>m.id===activeMain) || mains[0]
  
  const allItems = useMemo(()=> mains.flatMap(m=> [...m.items,...m.children.flatMap(s=>s.items)]), [mains])
  const cartDetailed = useMemo(()=> cart.map(c=>{ const it=allItems.find(i=>i.id===c.id); return it? {...it, qty:c.qty}:null }).filter(Boolean) as any[], [cart, allItems])
  const total = cartDetailed.reduce((s:any,i:any)=>s+i.price*i.qty,0)
  const cartCount = cart.reduce((s,c)=>s+c.qty,0)

  const filteredData = useMemo(()=>{
    if(!currentMain) return { subs: [], directItems: [] }
    const q=search.toLowerCase().trim()
    
    // filter subs
    let subs = currentMain.children
    if(q){
      subs = subs.map(s=>({...s, items:s.items.filter(i=> 
        t(i.name,i.nameEn,i.nameDe).toLowerCase().includes(q) ||
        (i.description||'').toLowerCase().includes(q)
      )})).filter(s=>s.items.length>0)
    }
    
    // filter direct items of main
    let directItems = currentMain.items
    if(q){
      directItems = directItems.filter(i=> 
        t(i.name,i.nameEn,i.nameDe).toLowerCase().includes(q) ||
        (i.description||'').toLowerCase().includes(q)
      )
    }

    return { subs, directItems }
  },[currentMain, search])

  const visibleItems = useMemo(()=>{
    if(activeSub === "all"){
      return filteredData
    } else {
      const sub = filteredData.subs.find(s=>s.id===activeSub)
      return { subs: sub ? [sub] : [], directItems: [] }
    }
  }, [activeSub, filteredData])

  const add = (id:string)=> setCart(p=>{ const ex=p.find(x=>x.id===id); return ex? p.map(x=>x.id===id?{...x,qty:x.qty+1}:x) : [...p,{id,qty:1}] })
  const dec = (id:string)=> setCart(p=> p.map(x=>x.id===id?{...x,qty:x.qty-1}:x).filter(x=>x.qty>0))
  const getQty=(id:string)=> cart.find(c=>c.id===id)?.qty||0

  const order = async()=>{
    if(!cart.length) return
    setSending(true)
    try{
      const res=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({restaurantSlug:slug,tableNumber,items:cart,paymentMethod:'CASH'})})
      const data=await res.json()
      if(data.order){ alert('Narudžba poslana! 🍽️ Kuhinja priprema hranu, piće stiže odmah.'); setCart([]); setShowCart(false) } else throw new Error(data.error||'')
    }catch(e:any){ alert(e.message) } finally{ setSending(false) }
  }

  if(!currentMain){
    return <div className="min-h-screen bg-[#fdf8f3] flex items-center justify-center p-10 text-center"><div><h1 className="text-2xl font-black">Menu je prazan</h1><p className="text-zinc-500 mt-2">Admin treba dodati kategorije Hrana, Piće, Kokteli, Vina</p></div></div>
  }

  return (
    <div className="min-h-screen bg-[#fdf8f3] text-zinc-900 selection:bg-black selection:text-white">
      {/* TOP HEADER - MODERN GLASS */}
      <div className="sticky top-0 z-30 backdrop-blur-2xl bg-white/80 border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white grid place-items-center font-black text-[18px]">{restaurant?.name?.[0]?.toUpperCase()||"T"}</div>
            <div className="leading-tight">
              <div className="font-black text-[15px] tracking-tight">{restaurant?.name}</div>
              <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> Stol {tableNumber} • QR Menu</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Traži jelo, piće..." className="bg-zinc-100 focus:bg-white border border-transparent focus:border-zinc-200 rounded-full pl-9 pr-4 py-2.5 text-[13px] w-[140px] md:w-[240px] focus:w-[260px] transition-all outline-none font-medium"/>
              <span className="absolute left-3 top-2.5 text-zinc-400">⌕</span>
            </div>
            <button onClick={()=>setShowCart(true)} className="relative bg-black text-white h-10 px-4 rounded-full font-black text-[13px] flex items-center gap-2 shadow-lg shadow-black/20 active:scale-95 transition">
              <span>Košarica</span>
              <span className="bg-white text-black min-w-5 h-5 grid place-items-center rounded-full text-[11px] px-1">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* HERO CATEGORY BANNER */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="relative h-[160px] md:h-[200px] rounded-[24px] overflow-hidden bg-zinc-900">
          <img src={currentMain.imageUrl || MAIN_IMAGES[currentMain.name] || MAIN_IMAGES["Hrana"]} className="w-full h-full object-cover opacity-80"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"/>
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-white font-black text-[28px] md:text-[34px] leading-none tracking-tight">{t(currentMain.name, currentMain.nameEn, currentMain.nameDe)}</h1>
                {currentMain.sendsToKitchen && <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">IDE U KUHINJU 🍳</span>}
              </div>
              <p className="text-white/70 text-[13px] max-w-[520px] leading-snug">{currentMain.description || (currentMain.name==="Hrana" ? "Svježe pripremljeno • Ide direktno u kuhinju" : currentMain.name==="Piće" ? "Alkoholna, bezalkoholna, topli napitci i piva" : "")}</p>
              <div className="flex gap-1.5 mt-2.5">
                <span className="bg-white/15 backdrop-blur text-white text-[11px] px-2.5 py-1 rounded-full border border-white/10">{currentMain.children.length} podkategorija</span>
                <span className="bg-white/15 backdrop-blur text-white text-[11px] px-2.5 py-1 rounded-full border border-white/10">{currentMain.items.length + currentMain.children.reduce((s,c)=>s+c.items.length,0)} artikala</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUBCATEGORY FILTER - MODERN PILLS WITH IMAGES */}
      {currentMain.children.length>0 && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-2">
            <button onClick={()=>setActiveSub("all")} className={`shrink-0 h-[46px] px-5 rounded-full font-bold text-[13px] border transition-all flex items-center gap-2 ${activeSub==="all" ? "bg-black text-white border-black shadow-lg shadow-black/20" : "bg-white border-zinc-200 hover:border-zinc-300"}`}>
              <span className="text-[14px]">✨</span> Sve
            </button>
            {filteredData.subs.map(sub=>(
              <button key={sub.id} onClick={()=>{setActiveSub(sub.id); subRefs.current[sub.id]?.scrollIntoView({behavior:'smooth', block:'start'})}} className={`shrink-0 group flex items-center gap-2.5 h-[46px] pl-1.5 pr-4 rounded-full font-bold text-[13px] border transition-all ${activeSub===sub.id ? "bg-black text-white border-black shadow-lg" : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm"}`}>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100">
                  <img src={sub.imageUrl || SUB_IMAGES[sub.name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} className="w-full h-full object-cover"/>
                </div>
                <span className="whitespace-nowrap">{t(sub.name, sub.nameEn, sub.nameDe)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSub===sub.id ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"}`}>{sub.items.length}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ITEMS GRID */}
      <div className="max-w-6xl mx-auto px-4 mt-6 pb-[120px]">
        {/* Direct items of main (if any) */}
        {visibleItems.directItems && visibleItems.directItems.length>0 && (
          <section className="mb-8">
            <div className="grid md:grid-cols-2 gap-3">
              {visibleItems.directItems.map((item:any)=>{
                const qty=getQty(item.id)
                return (
                  <div key={item.id} className="group bg-white rounded-[20px] border border-zinc-100 p-3 flex gap-3.5 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all">
                    <div className="w-[96px] h-[96px] rounded-[16px] bg-zinc-100 overflow-hidden shrink-0 relative">
                      <img src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                      {qty>0 && <div className="absolute top-1.5 left-1.5 bg-black text-white text-[10px] font-black w-5 h-5 grid place-items-center rounded-full">{qty}</div>}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-[14.5px] leading-[1.2] tracking-tight line-clamp-2">{t(item.name,item.nameEn,item.nameDe)}</h3>
                        <span className="shrink-0 bg-zinc-900 text-white text-[12.5px] font-black px-2.5 py-1 rounded-full">{item.price.toFixed(2)}€</span>
                      </div>
                      <p className="text-[12px] text-zinc-500 leading-[1.35] mt-1 line-clamp-2">{item.description||"Svježe pripremljeno"}</p>
                      <div className="mt-auto flex justify-end pt-2">
                        {qty===0 ? (
                          <button onClick={()=>add(item.id)} className="bg-black text-white h-8 px-4 rounded-full text-[12px] font-black hover:bg-zinc-800 active:scale-95 transition">+ Dodaj</button>
                        ) : (
                          <div className="flex items-center gap-1 bg-black text-white rounded-full p-1 shadow">
                            <button onClick={()=>dec(item.id)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-white/15">−</button>
                            <span className="w-6 text-center text-[12px] font-black">{qty}</span>
                            <button onClick={()=>add(item.id)} className="w-7 h-7 grid place-items-center rounded-full bg-white text-black">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Subcategories */}
        {visibleItems.subs.map(sub=>(
          <section key={sub.id} ref={el=>{subRefs.current[sub.id]=el}} className="mb-10 scroll-mt-[140px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-100 border"><img src={sub.imageUrl || SUB_IMAGES[sub.name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} className="w-full h-full object-cover"/></div>
              <div className="flex-1">
                <h2 className="font-black text-[18px] tracking-tight leading-none flex items-center gap-2">
                  {t(sub.name,sub.nameEn,sub.nameDe)} 
                  {sub.sendsToKitchen && <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[9px] px-1.5 py-0.5 rounded-full">KUHINJA</span>}
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">{sub.items.length} artikala {sub.sendsToKitchen ? "• ide u kuhinju" : "• poslužuje konobar"}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3">
              {sub.items.map((item:any)=>{
                const qty=getQty(item.id)
                return (
                  <div key={item.id} className="group bg-white rounded-[20px] border border-zinc-100 p-3 flex gap-3.5 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all">
                    <div className="w-[96px] h-[96px] rounded-[16px] bg-zinc-100 overflow-hidden shrink-0 relative">
                      <img src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                      {qty>0 && <div className="absolute top-1.5 left-1.5 bg-black text-white text-[10px] font-black w-5 h-5 grid place-items-center rounded-full">{qty}</div>}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-[14.5px] leading-[1.2] tracking-tight line-clamp-2">{t(item.name,item.nameEn,item.nameDe)}</h3>
                        <span className="shrink-0 bg-zinc-900 text-white text-[12.5px] font-black px-2.5 py-1 rounded-full">{item.price.toFixed(2)}€</span>
                      </div>
                      <p className="text-[12px] text-zinc-500 leading-[1.35] mt-1 line-clamp-2">{item.description||""}</p>
                      <div className="mt-auto flex justify-end pt-2">
                        {qty===0 ? (
                          <button onClick={()=>add(item.id)} className="bg-black text-white h-8 px-4 rounded-full text-[12px] font-black hover:bg-zinc-800 active:scale-95 transition">+ Dodaj</button>
                        ) : (
                          <div className="flex items-center gap-1 bg-black text-white rounded-full p-1 shadow">
                            <button onClick={()=>dec(item.id)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-white/15">−</button>
                            <span className="w-6 text-center text-[12px] font-black">{qty}</span>
                            <button onClick={()=>add(item.id)} className="w-7 h-7 grid place-items-center rounded-full bg-white text-black">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {filteredData.subs?.length || 0===0 && filteredData.directItems?.length || 0===0 && (
          <div className="py-16 text-center bg-white rounded-[24px] border border-dashed"><p className="font-bold">Nema artikala</p><p className="text-sm text-zinc-500 mt-1">Dodaj artikle u {currentMain.name} u adminu</p></div>
        )}
      </div>

      {/* FOOTER - 4 GLAVNE KATEGORIJE - PREMIUM */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-6xl mx-auto p-3">
          <div className="bg-zinc-900/95 backdrop-blur-2xl rounded-[26px] p-1.5 flex gap-1.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10">
            {mains.map(m=>{
              const active=m.id===activeMain
              const count = m.items.length + m.children.reduce((s,c)=>s+c.items.length,0)
              return (
                <button key={m.id} onClick={()=>setActiveMain(m.id)} className={`flex-1 relative flex flex-col items-center justify-center gap-1 py-2.5 rounded-[18px] transition-all ${active ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
                  <div className={`w-7 h-7 rounded-full overflow-hidden ${active?"bg-zinc-100":"bg-white/10"} grid place-items-center`}>
                    <img src={m.imageUrl || MAIN_IMAGES[m.name] || MAIN_IMAGES["Hrana"]} className="w-full h-full object-cover opacity-80"/>
                  </div>
                  <span className="text-[11px] font-black tracking-wide leading-none">{t(m.name,m.nameEn,m.nameDe)}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-none ${active ? "bg-black text-white" : "bg-white/15 text-white/70"}`}>{count}</span>
                  {m.sendsToKitchen && active && <span className="absolute -top-1 -right-1 bg-orange-500 w-2.5 h-2.5 rounded-full border-2 border-zinc-900"/>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* CART SHEET */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
          <div className="bg-white w-full rounded-t-[28px] max-h-[86vh] flex flex-col shadow-2xl">
            <div className="p-5 flex justify-between items-center border-b">
              <div><h2 className="font-black text-[18px] tracking-tight">Košarica • Stol {tableNumber}</h2><p className="text-[11px] text-zinc-500">{cartCount} artikala • Hrana ide u kuhinju, piće direktno konobaru</p></div>
              <button onClick={()=>setShowCart(false)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2.5">
              {cartDetailed.length===0 && <div className="py-12 text-center text-zinc-400">Košarica je prazna</div>}
              {cartDetailed.map((i:any)=>{
                const isKitchen = mains.some(m=> m.sendsToKitchen && (m.items.some(it=>it.id===i.id) || m.children.some(c=> c.sendsToKitchen && c.items.some(it=>it.id===i.id)) ))
                return (
                  <div key={i.id} className="flex gap-3 border border-zinc-100 p-3 rounded-2xl bg-zinc-50/50">
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden"><img src={i.imageUrl||""} className="w-full h-full object-cover"/></div>
                    <div className="flex-1">
                      <div className="flex justify-between"><span className="font-bold text-[13px]">{i.name}</span><span className="font-black text-[13px]">{(i.price*i.qty).toFixed(2)}€</span></div>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isKitchen?"bg-orange-500 text-white":"bg-zinc-900 text-white"}`}>{isKitchen?"KUHINJA 🍳":"ŠANK"}</span>
                        <div className="flex items-center gap-1 bg-black text-white rounded-full p-0.5"><button onClick={()=>dec(i.id)} className="w-6 h-6 grid place-items-center">−</button><span className="w-5 text-center text-[11px]">{i.qty}</span><button onClick={()=>add(i.id)} className="w-6 h-6 grid place-items-center bg-white text-black rounded-full">+</button></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="p-5 border-t bg-zinc-50 rounded-t-[28px]">
              <div className="flex justify-between font-black text-[16px] mb-3"><span>Ukupno</span><span>{total.toFixed(2)}€</span></div>
              <button disabled={sending || cart.length===0} onClick={order} className="w-full bg-black text-white py-4 rounded-full font-black text-[15px] shadow-lg shadow-black/20 disabled:opacity-50 active:scale-[0.98] transition">
                {sending ? "Šaljem..." : `Naruči • ${total.toFixed(2)}€`}
              </button>
              <p className="text-[10px] text-center text-zinc-500 mt-2">Hrana automatski ide u kuhinju, piće konobaru</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
