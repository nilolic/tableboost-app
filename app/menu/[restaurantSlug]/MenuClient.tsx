'use client'
import { useState, useRef, useMemo, useEffect } from 'react'

const UI_TEXT = {
  hr: { search: "Traži jelo, piće...", cart: "Košarica", items: "artikala", tapOpen: "tapni za otvaranje", tapClose: "tapni za zatvaranje", table: "Stol", cartEmpty: "Košarica je prazna", total: "Ukupno", subtotal: "Međuzbroj", tip: "Napojnica", add: "Dodaj", sending: "Šaljem...", orderCash: "Naruči • Gotovina", orderPos: "Naruči • POS", payOnline: "Plati online", notePlaceholder: "Napomena npr. jače pečeno, bez luka...", noteLabel: "Napomena za kuhinju" },
  en: { search: "Search dishes, drinks...", cart: "Cart", items: "items", tapOpen: "tap to open", tapClose: "tap to close", table: "Table", cartEmpty: "Cart is empty", total: "Total", subtotal: "Subtotal", tip: "Tip", add: "Add", sending: "Sending...", orderCash: "Order • Cash", orderPos: "Order • POS", payOnline: "Pay online", notePlaceholder: "Note e.g. well done, no onion...", noteLabel: "Kitchen note" },
  de: { search: "Gericht, Getränk suchen...", cart: "Warenkorb", items: "Artikel", tapOpen: "tippen zum Öffnen", tapClose: "tippen zum Schließen", table: "Tisch", cartEmpty: "Warenkorb ist leer", total: "Gesamt", subtotal: "Zwischensumme", tip: "Trinkgeld", add: "Hinzufügen", sending: "Senden...", orderCash: "Bestellen • Bar", orderPos: "Bestellen • POS", payOnline: "Online bezahlen", notePlaceholder: "Hinweis z.B. gut durchgebraten, ohne Zwiebel...", noteLabel: "Hinweis für Küche" },
};
const getInitialLang = (): "hr"|"en"|"de" => {
  if (typeof window!== "undefined") {
    const p = new URLSearchParams(window.location.search);
    const q = p.get("lang");
    if (q && ["hr","en","de"].includes(q)) return q as any;
    const nav = navigator.language?.toLowerCase() || "";
    if (nav.startsWith("de")) return "de";
    if (nav.startsWith("en")) return "en";
  }
  return "hr";
};
type Item = {
  id:string, name:string, nameEn?:string|null, nameDe?:string|null,
  description?:string|null, descriptionEn?:string|null, descriptionDe?:string|null,
  price:number, imageUrl?:string|null,
  categoryId:string, sendsToKitchen?:boolean,
  allergens?:string|null, allergensNote?:string|null, allergensNoteEn?:string|null, allergensNoteDe?:string|null,
  isBoosted?:boolean, boostLevel?:number, upsellEnabled?:boolean
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
const ALLERGENS_MAP: Record<string, {hr:string}> = {
  "1": {hr:"Gluten"}, "2": {hr:"Rakovi"}, "3": {hr:"Jaja"}, "4": {hr:"Riba"},
  "5": {hr:"Kikiriki"}, "6": {hr:"Soja"}, "7": {hr:"Mlijeko"}, "8": {hr:"Orašasti"},
  "9": {hr:"Celer"}, "10": {hr:"Gorušica"}, "11": {hr:"Sezam"}, "12": {hr:"Sulfiti"},
  "13": {hr:"Lupine"}, "14": {hr:"Mekušci"},
};
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
function AllergensBadge({ item, lang }: { item: Item, lang: 'hr'|'en'|'de' }) {
  const codes = (item.allergens||"").split(",").filter(Boolean);
  if(codes.length===0 &&!item.allergensNote) return null;
  const note = lang==='en'? item.allergensNoteEn || item.allergensNote : lang==='de'? item.allergensNoteDe || item.allergensNote : item.allergensNote;
  return (
    <div className="flex flex-wrap gap-1 mt-1.5 items-center">
      {codes.map(c=>(
        <span key={c} title={ALLERGENS_MAP[c]?.hr || c} className="text- font-black px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
          {c}
        </span>
      ))}
      {codes.length>0 && <span className="text- text-orange-700/70 ml-1">{codes.map(c=>ALLERGENS_MAP[c]?.hr).join(", ")}</span>}
      {note && <span className="text- text-zinc-500 italic w-full mt-0.5">⚠ {note}</span>}
    </div>
  )
}
export default function MenuClient({ restaurant, tableNumber, mains, lang: propLang, slug }: { restaurant:any, tableNumber:number|null, mains:MainCat[], lang:'hr'|'en'|'de', slug:string }) {
  const [cart, setCart] = useState<{id:string, qty:number, note?:string}[]>([])
  const [activeMain, setActiveMain] = useState(mains[0]?.id || "")
  const [activeSub, setActiveSub] = useState<string>("all")
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [lang] = useState<"hr"|"en"|"de">(getInitialLang())
 const T = UI_TEXT[lang]
 const [search, setSearch] = useState("")
  const [showCart, setShowCart] = useState(false)
  const [sending, setSending] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'CASH'|'CARD_TERMINAL'|'CARD_ONLINE'>('CASH')
  const [orderNote, setOrderNote] = useState("")
 const [tipPercent, setTipPercent] = useState<number>(0)
  const [upsells, setUpsells] = useState<Item[]>([])
  const [loadingUpsell, setLoadingUpsell] = useState(false)
  const subRefs = useRef<Record<string, any>>({})
  const t = (hr:string, en?:string|null, de?:string|null)=> lang==='en'?(en||hr):lang==='de'?(de||hr):hr
  const tDesc = (item:Item)=> lang==='en'? (item.descriptionEn || item.description) : lang==='de'? (item.descriptionDe || item.description) : item.description
  useEffect(()=>{ setActiveSub("all"); setOpenAccordion(null) }, [activeMain])
  const currentMain = mains.find(m=>m.id===activeMain) || mains[0]
  const allItems = useMemo(()=> mains.flatMap(m=> [...m.items,...m.children.flatMap(s=>s.items)]), [mains])
  const cartDetailed = useMemo(()=> cart.map(c=>{ const it=allItems.find(i=>i.id===c.id); return it? {...it, qty:c.qty, note:c.note}:null }).filter(Boolean) as any[], [cart, allItems])
  const subtotal = cartDetailed.reduce((s:any,i:any)=>s+i.price*i.qty,0)
  const tipAmount = subtotal * (tipPercent/100)
  const total = subtotal + tipAmount
  const cartCount = cart.reduce((s,c)=>s+c.qty,0)
  useEffect(()=>{
    const ids = cart.map(c=>c.id)
    if(ids.length===0){
      setLoadingUpsell(true)
      fetch(`/api/menu/${slug}/upsell`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cartItemIds:[]})})
     .then(r=>r.json()).then(d=>setUpsells(d.upsells||[])).catch(()=>setUpsells([])).finally(()=>setLoadingUpsell(false))
      return
    }
    setLoadingUpsell(true)
    fetch(`/api/menu/${slug}/upsell`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cartItemIds:ids})})
   .then(r=>r.json()).then(d=>setUpsells(d.upsells||[])).catch(()=>setUpsells([])).finally(()=>setLoadingUpsell(false))
  }, [cart, slug])
  const filteredData = useMemo(()=>{
    if(!currentMain) return { subs: [], directItems: [] }
    const q=search.toLowerCase().trim()
    let subs = currentMain.children
    if(q){
      subs = subs.map(s=>({...s, items:s.items.filter(i=>
        t(i.name,i.nameEn,i.nameDe).toLowerCase().includes(q) ||
        (tDesc(i)||'').toLowerCase().includes(q)
      )})).filter(s=>s.items.length>0)
    }
    let directItems = currentMain.items
    if(q){
      directItems = directItems.filter(i=>
        t(i.name,i.nameEn,i.nameDe).toLowerCase().includes(q) ||
        (tDesc(i)||'').toLowerCase().includes(q)
      )
    }
    return { subs, directItems }
  },[currentMain, search])
  const visibleItems = useMemo(()=>{
    if(activeSub === "all"){
      return filteredData
    } else {
      const sub = filteredData.subs.find(s=>s.id===activeSub)
      return { subs: sub? [sub] : [], directItems: [] }
    }
  }, [activeSub, filteredData])
  const add = (id:string)=> setCart(p=>{ const ex=p.find(x=>x.id===id); return ex? p.map(x=>x.id===id?{...x,qty:x.qty+1}:x) : [...p,{id,qty:1, note:""}] })
  const dec = (id:string)=> setCart(p=> p.map(x=>x.id===id?{...x,qty:x.qty-1}:x).filter(x=>x.qty>0))
  const getQty=(id:string)=> cart.find(c=>c.id===id)?.qty||0
  
  const order = async()=>{
    if(!cart.length) return
    setSending(true)
    try{
      const res=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({restaurantSlug:slug,tableNumber,items:cart.map((c:any)=>({...c, note: orderNote})),orderNote,paymentMethod,tipPercent, note: orderNote})})
      const data=await res.json()
      if(!res.ok) throw new Error(data.error||'Greška')
      if(data.order){
        if(paymentMethod==='CARD_ONLINE'){
          try{
            const payRes = await fetch('/api/payments/create-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:data.order.id, restaurantSlug:slug})})
            const payData = await payRes.json()
            if(payData.url){
              window.location.href = payData.url
              return
            }
          }catch{}
        }
        window.location.href = `/order/${data.order.id}/success?method=${paymentMethod}`
      } else throw new Error('Greška')
    }catch(e:any){ alert(e.message) } finally{ setSending(false) }
  }
  if(!currentMain){
    return <div className="min-h-screen bg-[#fdf8f3] flex items-center justify-center p-10 text-center"><div><h1 className="text-2xl font-black">Menu je prazan</h1><p className="text-zinc-500 mt-2">Admin treba dodati kategorije</p></div></div>
  }
  const payCashEnabled = restaurant?.paymentCashEnabled?? true
  const payTerminalEnabled = restaurant?.paymentCardTerminalEnabled?? true
  const payOnlineEnabled = restaurant?.paymentCardOnlineEnabled?? false
  return (
    <div className="min-h-screen bg-[#fdf8f3] text-zinc-900 selection:bg-black selection:text-white">
      <div className="sticky top-0 z-30 backdrop-blur-2xl bg-white/80 border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 h- flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white grid place-items-center font-black text-">{restaurant?.name?.[0]?.toUpperCase()||"T"}</div>
            <div className="leading-tight">
              <div className="font-black text- tracking-tight">{restaurant?.name}</div>
              <div className="text- text-zinc-500 font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> Stol {tableNumber} • QR Menu</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            
                ))}
            </div>
            <div className="p-4 border-t bg-zinc-50 space-y-3 shrink-0">
              <div>
                <div className="text- font-black uppercase tracking-wider opacity-60 mb-2 flex justify-between">
                  <span>💝 Napojnica za osoblje</span>
                  {tipPercent>0 && <span className="text-black">+{tipAmount.toFixed(2)}€</span>}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0,10,20,30].map(pct=>(
                    <button key={pct} onClick={()=>setTipPercent(pct)} className={`h-10 rounded-full font-bold text- border-2 transition ${tipPercent===pct? 'bg-black text-white border-black' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
                      {pct===0? 'Bez tipa' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>
              {restaurant?.serviceMode==='BAR'? (
                <div className="bg-amber-300 border-2 border-black rounded-2xl p-3 flex gap-2.5 items-start shadow-sm">
                  <div className="w-9 h-9 bg-black text-white rounded-full grid place-items-center shrink-0 text-">🛎</div>
                  <div>
                    <div className="font-black text- leading-tight uppercase">{lang==='en'? 'Pickup at the bar' : lang==='de'? 'Abholung an der Theke' : 'Preuzimanje na šanku'}</div>
                    <div className="text- leading-[1.35] mt-0.5 font-medium">{lang==='en'? 'Order and pay here, then pick up your food/drinks at the bar when ready. You will get a notification.' : lang==='de'? 'Hier bestellen und bezahlen, dann Essen/Getränke an der Theke abholen, wenn es fertig ist. Sie erhalten eine Benachrichtigung.' : 'Ovdje naručite i platite, a piće/hranu preuzmite na šanku kad bude spremno. Dobićete obavijest.'}</div>
                    <div className="text- font-bold mt-2 leading-[1.35]">{lang==='en'? 'Stay on this page to get notified!' : lang==='de'? 'Bleiben Sie auf dieser Seite, um benachrichtigt zu werden!' : 'Ostanite na ovoj stranici da biste dobili obavijest!'}</div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-zinc-200 rounded-2xl p-2.5 flex gap-2 items-center">
                  <div className="text-">🍽</div>
                  <div className="text- font-medium">{lang==='en'? `Waiter service - delivery to table ${tableNumber||''}` : lang==='de'? `Bedienung - Lieferung an Tisch ${tableNumber||''}` : `Poslužuje konobar - dostava na stol ${tableNumber}`}</div>
                </div>
              )}
              <div className="text- font-black uppercase tracking-wider opacity-60">Način plaćanja</div>
              <div className="grid grid-cols-3 gap-2">
                {payCashEnabled && (
                  <button onClick={()=>setPaymentMethod('CASH')} className={`p-3 rounded-2xl border-2 text-left transition ${paymentMethod==='CASH'?'border-black bg-black text-white':'border-zinc-200 bg-white'}`}>
                    <div className="text-">💵</div><div className="font-bold text- mt-1">Gotovina</div><div className="text- opacity-70 leading-tight mt-0.5">Plati konobaru</div>
                  </button>
                )}
                {payTerminalEnabled && (
                  <button onClick={()=>setPaymentMethod('CARD_TERMINAL')} className={`p-3 rounded-2xl border-2 text-left transition ${paymentMethod==='CARD_TERMINAL'?'border-black bg-black text-white':'border-zinc-200 bg-white'}`}>
                    <div className="text-">💳</div><div className="font-bold text- mt-1">POS</div><div className="text- opacity-70 leading-tight mt-0.5">Kartica na stolu</div>
                  </button>
                )}
                {payOnlineEnabled? (
                  <button onClick={()=>setPaymentMethod('CARD_ONLINE')} className={`p-3 rounded-2xl border-2 text-left transition ${paymentMethod==='CARD_ONLINE'?'border-black bg-black text-white':'border-zinc-200 bg-white'}`}>
                    <div className="text-">🌐</div><div className="font-bold text- mt-1">Online</div><div className="text- opacity-70 leading-tight mt-0.5">Apple/Google Pay</div>
                  </button>
                ) : (
                  <button disabled className="p-3 rounded-2xl border-2 border-zinc-100 bg-zinc-100 opacity-50 text-left">
                    <div className="text-">🌐</div><div className="font-bold text- mt-1">Online</div><div className="text- mt-0.5">Uskoro</div>
                  </button>
                )}
              </div>
              <div className="bg-white border rounded-2xl p-3 space-y-1 text-">
                <div className="flex justify-between"><span className="text-zinc-500">{T.subtotal}</span><span className="font-bold">{subtotal.toFixed(2)}€</span></div>
                {tipPercent>0 && <div className="flex justify-between"><span className="text-zinc-500">{T.tip} {tipPercent}%</span><span className="font-bold">+{tipAmount.toFixed(2)}€</span></div>}
                <div className="flex justify-between font-black text- pt-1 border-t mt-1"><span>{T.total}</span><span>{total.toFixed(2)}€</span></div>
              </div>
              {upsells.length>0 && (
                <div className="bg-white border-2 border-dashed border-amber-200 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text- font-black uppercase tracking-widest">✨ Preporučujemo uz narudžbu</span>
                    {loadingUpsell && <span className="text- text-zinc-400">učitavam...</span>}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                    {upsells.map((u:any)=>(
                      <div key={u.id} className="min-w- bg-amber-50 border border-amber-200 rounded-2xl p-2.5 flex gap-2 shrink-0 snap-start">
                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0"><img src={u.imageUrl||"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"} className="w-full h-full object-cover"/></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text- leading-tight line-clamp-1">{t(u.name,u.nameEn,u.nameDe)}</div>
                          <div className="text- text-zinc-600">{u.price.toFixed(2)}€ {u.isBoosted && `🔥${u.boostLevel}`}</div>
                          <button onClick={()=>add(u.id)} className="mt-1 bg-black text-white text- font-bold px-3 py-1 rounded-full">+ {T.add}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button disabled={sending || cart.length===0} onClick={order} className="w-full bg-black text-white py-4 rounded-full font-black text- shadow-lg shadow-black/20 disabled:opacity-50 active:scale-[0.98] transition">
                {sending? T.sending : paymentMethod==='CASH'? `${T.orderCash} • ${total.toFixed(2)}€` : paymentMethod==='CARD_TERMINAL'? `${T.orderPos} • ${total.toFixed(2)}€` : `${T.payOnline} • ${total.toFixed(2)}€`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
