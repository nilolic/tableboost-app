
'use client'
import { useState, useRef, useMemo } from 'react'
type Item = { id:string, name:string, nameEn?:string|null, nameDe?:string|null, description?:string|null, price:number, imageUrl?:string|null, categoryId:string }
type SubCat = { id:string, name:string, nameEn?:string|null, nameDe?:string|null, imageUrl?:string|null, items: Item[], order:number }
type MainCat = { id:string, name:string, nameEn?:string|null, nameDe?:string|null, imageUrl?:string|null, order:number, children: SubCat[], items: Item[] }
export default function MenuClient({ restaurant, tableNumber, mains, lang, slug }: { restaurant:any, tableNumber:number|null, mains:MainCat[], lang:'hr'|'en'|'de', slug:string }) {
  const [cart, setCart] = useState<{id:string, qty:number}[]>([])
  const [activeMain, setActiveMain] = useState(mains[0]?.id || "")
  const [search, setSearch] = useState("")
  const [showCart, setShowCart] = useState(false)
  const [sending, setSending] = useState(false)
  const subRefs = useRef<Record<string, any>>({})
  const t = (hr:string, en?:string|null, de?:string|null)=> lang==='en'?(en||hr):lang==='de'?(de||hr):hr
  const allItems = useMemo(()=> mains.flatMap(m=> [...m.items,...m.children.flatMap(s=>s.items)]), [mains])
  const cartDetailed = useMemo(()=> cart.map(c=>{ const it=allItems.find(i=>i.id===c.id); return it? {...it, qty:c.qty}:null }).filter(Boolean) as any[], [cart, allItems])
  const total = cartDetailed.reduce((s:any,i:any)=>s+i.price*i.qty,0)
  const currentMain = mains.find(m=>m.id===activeMain) || mains[0]
  const filteredSubs = useMemo(()=>{
    if(!currentMain) return []
    const q=search.toLowerCase().trim()
    if(!q) return currentMain.children
    return currentMain.children.map(s=>({...s, items:s.items.filter(i=> t(i.name,i.nameEn,i.nameDe).toLowerCase().includes(q))})).filter(s=>s.items.length>0)
  },[currentMain, search])
  const add = (id:string)=> setCart(p=>{ const ex=p.find(x=>x.id===id); return ex? p.map(x=>x.id===id?{...x,qty:x.qty+1}:x) : [...p,{id,qty:1}] })
  const dec = (id:string)=> setCart(p=> p.map(x=>x.id===id?{...x,qty:x.qty-1}:x).filter(x=>x.qty>0))
  const order = async()=>{
    if(!cart.length) return
    setSending(true)
    try{
      const res=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({restaurantSlug:slug,tableNumber,items:cart,paymentMethod:'CASH'})})
      const data=await res.json()
      if(data.order){ alert('Narudzba poslana!'); setCart([]); setShowCart(false) } else throw new Error(data.error||'')
    }catch(e:any){ alert(e.message) } finally{ setSending(false) }
  }
  const getQty=(id:string)=> cart.find(c=>c.id===id)?.qty||0
  return (
    <div className="min-h-screen bg-[#fdf8f3] pb-[200px] text-zinc-900">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b p-4 flex justify-between max-w-5xl mx-auto">
        <div className="font-black">{restaurant?.name} - Stol {tableNumber}</div>
        <div className="flex gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Trazi..." className="bg-white border rounded-full px-4 py-2 text-sm w-[120px] focus:w-[180px] outline-none"/>
          <button onClick={()=>setShowCart(true)} className="bg-black text-white w-10 h-10 rounded-full">{cart.reduce((s,c)=>s+c.qty,0)}</button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto p-4">
        {currentMain?.items?.map((item:any)=>{const qty=getQty(item.id); return (
          <div key={item.id} className="bg-white rounded-[20px] border p-3 flex gap-3 mb-3">
            <div className="w-[84px] h-[84px] rounded-2xl bg-zinc-100 overflow-hidden shrink-0"><img src={item.imageUrl||''} className="w-full h-full object-cover"/></div>
            <div className="flex-1">
              <div className="flex justify-between"><b className="text-[14px] leading-tight">{t(item.name,item.nameEn,item.nameDe)}</b><span className="text-[13px] bg-black text-white px-2 rounded-full">{item.price}€</span></div>
              <p className="text-[12px] text-zinc-500">{item.description}</p>
              <div className="flex justify-end mt-2">{qty===0? <button onClick={()=>add(item.id)} className="bg-black text-white w-9 h-9 rounded-full">+</button>: <div className="flex gap-1 bg-black text-white rounded-full p-1"><button onClick={()=>dec(item.id)} className="w-7 h-7">-</button><span className="w-7 text-center text-[12px]">{qty}</span><button onClick={()=>add(item.id)} className="w-7 h-7 bg-white text-black rounded-full">+</button></div>}</div>
            </div>
          </div>
        )})}
        {filteredSubs.map(sub=>(
          <section key={sub.id} ref={el=>{subRefs.current[sub.id]=el}} className="mb-8">
            <h2 className="font-black text-xl mb-3">{t(sub.name,sub.nameEn,sub.nameDe)}</h2>
            {sub.items.map((item:any)=>{const qty=getQty(item.id); return (
              <div key={item.id} className="bg-white rounded-[20px] border p-3 flex gap-3 mb-3">
                <div className="w-[84px] h-[84px] rounded-2xl bg-zinc-100 overflow-hidden shrink-0"><img src={item.imageUrl||''} className="w-full h-full object-cover"/></div>
                <div className="flex-1">
                  <div className="flex justify-between"><b className="text-[14px] leading-tight">{t(item.name,item.nameEn,item.nameDe)}</b><span className="text-[13px] bg-black text-white px-2 rounded-full">{item.price}€</span></div>
                  <p className="text-[12px] text-zinc-500">{item.description}</p>
                  <div className="flex justify-end mt-2">{qty===0? <button onClick={()=>add(item.id)} className="bg-black text-white w-9 h-9 rounded-full">+</button>: <div className="flex gap-1 bg-black text-white rounded-full p-1"><button onClick={()=>dec(item.id)} className="w-7 h-7">-</button><span className="w-7 text-center text-[12px]">{qty}</span><button onClick={()=>add(item.id)} className="w-7 h-7 bg-white text-black rounded-full">+</button></div>}</div>
                </div>
              </div>
            )})}
          </section>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex gap-2 overflow-x-auto">
        {mains.map(m=>{const active=m.id===activeMain; return <button key={m.id} onClick={()=>setActiveMain(m.id)} className={"min-w-[84px] shrink-0 rounded-2xl py-2 px-3 text-[11px] font-black "+(active?"bg-black text-white":"bg-zinc-100")}>{t(m.name,m.nameEn,m.nameDe)} <span className="text-[9px] bg-black/10 px-1 rounded-full ml-1">{m.items.length+m.children.reduce((s,c)=>s+c.items.length,0)}</span></button>})}
      </div>
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-white w-full rounded-t-[32px] max-h-[88vh] flex flex-col">
            <div className="p-4 flex justify-between border-b"><b>Kosarica</b><button onClick={()=>setShowCart(false)}>X</button></div>
            <div className="flex-1 overflow-auto p-4 space-y-2">{cartDetailed.map((i:any)=><div key={i.id} className="flex justify-between border p-2 rounded-xl"><span>{i.name} x {i.qty}</span><span>{i.price*i.qty}€</span></div>)}</div>
            <div className="p-4 border-t"><div className="flex justify-between font-black mb-3"><span>Ukupno</span><span>{total.toFixed(2)}€</span></div><button disabled={sending} onClick={order} className="w-full bg-black text-white py-4 rounded-full font-black">Naruci {total.toFixed(2)}€</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
