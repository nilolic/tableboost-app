'use client'
import { useState, useRef, useMemo, useEffect } from 'react'

const UI_TEXT = {
  hr: { 
    search: "Traži jelo, piće...", cart: "Košarica", items: "artikala", tapOpen: "tapni za otvaranje", tapClose: "tapni za zatvaranje", table: "Stol", cartEmpty: "Košarica je prazna", total: "Ukupno", subtotal: "Međuzbroj", tip: "Napojnica", add: "Dodaj", sending: "Šaljem...", orderCash: "Naruči • Gotovina", orderPos: "Naruči • POS", payOnline: "Plati online", 
    notePlaceholder: "Npr. bez luka, alergija na...", noteLabel: "Napomena za kuhinju / alergije",
    yourOrder: "Vaša narudžba", noTip: "Bez tipa", barPickupTitle: "Preuzimanje na šanku", barPickupDesc: "Ovdje naručite i platite, a piće/hranu preuzmite na šanku kad bude spremno.",
    waiterService: "Poslužuje konobar - dostava na stol", paymentMethod: "Način plaćanja",
    cash: "Gotovina", pos: "POS terminal", online: "Online", tipAmount: "Napojnica", goesToKitchen: "IDE U KUHINJU 🍳", kitchenShort: "KUHINJA", all: "Sve"
  },
  en: { 
    search: "Search dishes, drinks...", cart: "Cart", items: "items", tapOpen: "tap to open", tapClose: "tap to close", table: "Table", cartEmpty: "Cart is empty", total: "Total", subtotal: "Subtotal", tip: "Tip", add: "Add", sending: "Sending...", orderCash: "Order • Cash", orderPos: "Order • POS", payOnline: "Pay online", 
    notePlaceholder: "E.g. no onion, allergy to...", noteLabel: "Kitchen note / allergies",
    yourOrder: "Your order", noTip: "No tip", barPickupTitle: "Pickup at bar", barPickupDesc: "Order and pay here, pick up drinks/food at the bar when ready.",
    waiterService: "Waiter service - delivery to table", paymentMethod: "Payment method",
    cash: "Cash", pos: "POS terminal", online: "Online", tipAmount: "Tip", goesToKitchen: "GOES TO KITCHEN 🍳", kitchenShort: "KITCHEN", all: "All"
  },
  de: { 
    search: "Gericht, Getränk suchen...", cart: "Warenkorb", items: "Artikel", tapOpen: "tippen zum Öffnen", tapClose: "tippen zum Schließen", table: "Tisch", cartEmpty: "Warenkorb ist leer", total: "Gesamt", subtotal: "Zwischensumme", tip: "Trinkgeld", add: "Hinzufügen", sending: "Senden...", orderCash: "Bestellen • Bar", orderPos: "Bestellen • POS", payOnline: "Online bezahlen", 
    notePlaceholder: "Z.B. ohne Zwiebel, Allergie auf...", noteLabel: "Hinweis für Küche / Allergien",
    yourOrder: "Ihre Bestellung", noTip: "Kein Trinkgeld", barPickupTitle: "Abholung an der Bar", barPickupDesc: "Hier bestellen und bezahlen, Getränke/Essen an der Bar abholen wenn fertig.",
    waiterService: "Kellnerservice - Lieferung an Tisch", paymentMethod: "Zahlungsart",
    cash: "Bar", pos: "POS Terminal", online: "Online", tipAmount: "Trinkgeld", goesToKitchen: "GEHT IN DIE KÜCHE 🍳", kitchenShort: "KÜCHE", all: "Alle"
  },
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
 const CATEGORY_DICT: Record<string, {en:string,de:string}> = {
    "Glavna jela": {en:"Main dishes", de:"Hauptgerichte"},
    "Predjela": {en:"Starters", de:"Vorspeisen"},
    "Juhe": {en:"Soups", de:"Suppen"},
    "Salate": {en:"Salads", de:"Salate"},
    "Deserti": {en:"Desserts", de:"Desserts"},
    "Pića": {en:"Drinks", de:"Getränke"},
    "Prilozi": {en:"Sides", de:"Beilagen"},
    "Roštilj": {en:"Grill", de:"Grill"},
    "Tjestenine": {en:"Pasta", de:"Pasta"},
    "Pizze": {en:"Pizzas", de:"Pizzen"},
    "Doručak": {en:"Breakfast", de:"Frühstück"},
  }

  function t(hr?: string | null, en?: string | null, de?: string | null) {
    if (lang === "de" && de) return de
    if (lang === "en" && en) return en
    if (hr && CATEGORY_DICT[hr]) {
      if (lang === "de") return CATEGORY_DICT[hr].de
      if (lang === "en") return CATEGORY_DICT[hr].en
    }
    return hr || ""
  }

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
      const res=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({restaurantSlug:slug,tableNumber,items: cart.map((c:any)=>({...c, note: orderNote})), orderNote, note: orderNote,paymentMethod,tipPercent})})
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
              <div className="text- text-zinc-500 font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> {T.table} {tableNumber} • QR Menu</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={T.search} className="bg-zinc-100 focus:bg-white border border-transparent focus:border-zinc-200 rounded-full pl-9 pr-4 py-2.5 text- w- md:w- focus:w- transition-all outline-none font-medium"/>
              <span className="absolute left-3 top-2.5 text-zinc-400">⌕</span>
            </div>
            <button onClick={()=>setShowCart(true)} className="relative bg-black text-white h-10 px-4 rounded-full font-black text- flex items-center gap-2 shadow-lg shadow-black/20 active:scale-95 transition">
              <span>{T.cart}</span>
              <span className="bg-white text-black min-w-5 h-5 grid place-items-center rounded-full text- px-1">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="relative h- md:h- rounded- overflow-hidden bg-zinc-900">
          <img src={currentMain.imageUrl || MAIN_IMAGES[currentMain.name] || MAIN_IMAGES["Hrana"]} className="w-full h-full object-cover opacity-80"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"/>
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-white font-black text- md:text- leading-none tracking-tight">{t(currentMain.name, currentMain.nameEn, currentMain.nameDe)}</h1>
                {currentMain.sendsToKitchen && <span className="bg-orange-500 text-white text- font-black px-2.5 py-1 rounded-full">{(T as any).goesToKitchen || "IDE U KUHINJU 🍳"}</span>}
              </div>
              <p className="text-white/70 text- max-w- leading-snug">{currentMain.description || ""}</p>
            </div>
          </div>
        </div>
      </div>
      {currentMain.children.length>0 && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-2">
            <button onClick={()=>{setActiveSub("all"); setOpenAccordion(null)}} className={`shrink-0 h- px-5 rounded-full font-bold text- border transition-all flex items-center gap-2 ${activeSub==="all"? "bg-black text-white border-black shadow-lg shadow-black/20" : "bg-white border-zinc-200 hover:border-zinc-300"}`}>
              <span className="text-">✨</span> {(T as any).all || (lang==="de"?"Alle":lang==="en"?"All":"Sve")}
            </button>
            {filteredData.subs.map(sub=>(
              <button key={sub.id} onClick={()=>{setActiveSub(sub.id); setOpenAccordion(sub.id); subRefs.current[sub.id]?.scrollIntoView({behavior:'smooth', block:'start'})}} className={`shrink-0 group flex items-center gap-2.5 h- pl-1.5 pr-4 rounded-full font-bold text- border transition-all ${activeSub===sub.id? "bg-black text-white border-black shadow-lg" : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm"}`}>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100">
                  <img src={sub.imageUrl || SUB_IMAGES[sub.name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} className="w-full h-full object-cover"/>
                </div>
                <span className="whitespace-nowrap">{t(sub.name, sub.nameEn, sub.nameDe)}</span>
                <span className={`text- px-1.5 py-0.5 rounded-full ${activeSub===sub.id? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"}`}>{sub.items.length}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 mt-6 pb-">
        {visibleItems.directItems && visibleItems.directItems.length>0 && (
          <section className="mb-8">
            <div className="grid md:grid-cols-2 gap-3">
              {visibleItems.directItems.map((item:any)=>{
                const qty=getQty(item.id)
                return (
                  <div key={item.id} className={`group bg-white rounded- border p-3 flex gap-3 shadow-sm hover:shadow-md transition-all ${item.isBoosted? 'border-amber-300 bg-amber-50/30' : 'border-zinc-100 hover:border-zinc-200'}`}>
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 relative">
                      <img src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                      {item.isBoosted && <div className="absolute top-1 left-1 bg-amber-400 text-black text- font-black px-1.5 py-0.5 rounded-full">🔥 BOOST {item.boostLevel}</div>}
                      {qty>0 && <div className="absolute top-1.5 right-1.5 bg-black text-white text- font-black w-5 h-5 grid place-items-center rounded-full">{qty}</div>}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-[14.5px] leading-[1.2] tracking-tight line-clamp-2">{t(item.name,item.nameEn,item.nameDe)}</h3>
                        <span className="shrink-0 bg-zinc-900 text-white text-[12.5px] font-black px-2.5 py-1 rounded-full">{item.price.toFixed(2)}€</span>
                      </div>
                      <p className="text- text-zinc-500 leading-[1.35] mt-1 line-clamp-2">{tDesc(item)||"Svježe pripremljeno"}</p>
                      <AllergensBadge item={item} lang={lang} />
                      <div className="mt-auto flex justify-end pt-2">
                        {qty===0? (
                          <button onClick={()=>add(item.id)} className="bg-black text-white h-8 px-4 rounded-full text- font-black hover:bg-zinc-800 active:scale-95 transition">+ {T.add}</button>
                        ) : (
                          <div className="flex items-center gap-1 bg-black text-white rounded-full p-1 shadow">
                            <button onClick={()=>dec(item.id)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-white/15">−</button>
                            <span className="w-6 text-center text- font-black">{qty}</span>
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
        {visibleItems.subs.map(sub=>{
          const isOpen = activeSub!== "all"? true : openAccordion === sub.id
          return (
          <section key={sub.id} ref={el=>{subRefs.current[sub.id]=el}} className="mb-3 scroll-mt- bg-white rounded- border border-zinc-100 overflow-hidden shadow-sm">
            <button
              onClick={()=>{
                if(activeSub!== "all"){
                  setActiveSub("all")
                  setOpenAccordion(null)
                } else {
                  const willOpen = openAccordion!== sub.id
                  setOpenAccordion(willOpen? sub.id : null)
                  if(willOpen) setTimeout(()=>subRefs.current[sub.id]?.scrollIntoView({behavior:'smooth', block:'start'}), 80)
                }
              }}
              className="w-full flex items-center gap-3 p-3 text-left"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 border shrink-0">
                <img src={sub.imageUrl || SUB_IMAGES[sub.name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-black text- tracking-tight leading-none flex items-center gap-2">
                  {t(sub.name,sub.nameEn,sub.nameDe)}
                  {sub.sendsToKitchen && <span className="bg-orange-50 text-orange-600 border border-orange-200 text- px-1.5 py-0.5 rounded-full">{(T as any).kitchenShort || "KUHINJA"}</span>}
                </h2>
                <p className="text- text-zinc-500 mt-1">{sub.items.length} {T.items} • {isOpen? T.tapClose : T.tapOpen}</p>
              </div>
              <div className={`w-9 h-9 rounded-full bg-zinc-900 text-white grid place-items-center text- transition-transform ${isOpen? 'rotate-180' : ''}`}>⌄</div>
            </button>
            {isOpen && (
              <div className="p-3 pt-0">
                <div className="grid md:grid-cols-2 gap-3">
                  {sub.items.map((item:any)=>{
                    const qty=getQty(item.id)
                    return (
                      <div key={item.id} className={`group bg-white rounded- border p-3 flex gap-3 shadow-sm hover:shadow-md transition-all ${item.isBoosted? 'border-amber-300 bg-amber-50/30' : 'border-zinc-100 hover:border-zinc-200'}`}>
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 relative">
                          <img src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                          {item.isBoosted && <div className="absolute top-1 left-1 bg-amber-400 text-black text- font-black px-1.5 py-0.5 rounded-full">🔥 {item.boostLevel}</div>}
                          {qty>0 && <div className="absolute top-1.5 right-1.5 bg-black text-white text- font-black w-5 h-5 grid place-items-center rounded-full">{qty}</div>}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text- leading-[1.2] tracking-tight line-clamp-2">{t(item.name,item.nameEn,item.nameDe)}</h3>
                            <span className="shrink-0 bg-zinc-900 text-white text-[11.5px] font-black px-2 py-1 rounded-full">{item.price.toFixed(2)}€</span>
                          </div>
                          <p className="text- text-zinc-500 leading-[1.35] mt-1 line-clamp-2">{tDesc(item)||""}</p>
                          <AllergensBadge item={item} lang={lang} />
                          <div className="mt-auto flex justify-end pt-2">
                            {qty===0? (
                              <button onClick={()=>add(item.id)} className="bg-black text-white h-7 px-3.5 rounded-full text- font-black hover:bg-zinc-800 active:scale-95 transition">+ {T.add}</button>
                            ) : (
                              <div className="flex items-center gap-1 bg-black text-white rounded-full p-1 shadow">
                                <button onClick={()=>dec(item.id)} className="w-6 h-6 grid place-items-center rounded-full hover:bg-white/15">−</button>
                                <span className="w-5 text-center text- font-black">{qty}</span>
                                <button onClick={()=>add(item.id)} className="w-6 h-6 grid place-items-center rounded-full bg-white text-black">+</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        )})} <div className="h-32" />
      </div>
      <div className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 translate-y-0`}> <div className="max-w-6xl mx-auto p-3">
          <div className="bg-zinc-900/95 backdrop-blur-2xl rounded- p-1.5 flex gap-1.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10">
            {mains.map(m=>{
              const active=m.id===activeMain
              const count = m.items.length + m.children.reduce((s,c)=>s+c.items.length,0)
              return (
                <button key={m.id} onClick={()=>setActiveMain(m.id)} className={`flex-1 relative flex flex-col items-center justify-center gap-1 py-2.5 rounded- transition-all ${active? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
                  <div className={`w-7 h-7 rounded-full overflow-hidden ${active?"bg-zinc-100":"bg-white/10"} grid place-items-center`}>
                    <img src={m.imageUrl || MAIN_IMAGES[m.name] || MAIN_IMAGES["Hrana"]} className="w-full h-full object-cover opacity-80"/>
                  </div>
                  <span className="text- font-black tracking-wide leading-none">{t(m.name,m.nameEn,m.nameDe)}</span>
                  <span className={`text- px-1.5 py-0.5 rounded-full font-bold leading-none ${active? "bg-black text-white" : "bg-white/15 text-white/70"}`}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
                   {showCart && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-t-[28px] md:rounded-[28px] md:my-4 flex flex-col shadow-2xl">
            <div className="p-5 flex justify-between items-center border-b">
              <div><h2 className="font-black tracking-tight">{T.cart} • {T.table} {tableNumber}</h2><p className="text-zinc-500">{cartCount} {T.items}</p></div>
              <button onClick={()=>setShowCart(false)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3">
              {cartDetailed.length===0 && <div className="py-12 text-center text-zinc-400">{T.cartEmpty}</div>}
              {cartDetailed.length>0 && <div className="font-black uppercase tracking-widest text-zinc-500 mb-1">{(T as any).yourOrder || 'Vaša narudžba'}</div>}
              {cartDetailed.map((i:any)=>(
                <div key={i.id} className="flex gap-3 border-2 border-zinc-900 p-3 rounded-2xl bg-white shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                    <img src={i.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"} className="w-full h-full object-cover" alt={t(i.name,i.nameEn,i.nameDe)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2"><span className="font-black">{t(i.name,i.nameEn,i.nameDe)}</span><span className="font-black">{(i.price*i.qty).toFixed(2)}€</span></div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-zinc-500 text-sm">{i.allergens? `⚠ ${i.allergens}` : ''}</span>
                      <div className="flex items-center gap-1 bg-black text-white rounded-full p-0.5"><button onClick={()=>dec(i.id)} className="w-7 h-7 grid place-items-center">−</button><span className="w-6 text-center font-black">{i.qty}</span><button onClick={()=>add(i.id)} className="w-7 h-7 grid place-items-center bg-white text-black rounded-full">+</button></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-zinc-50 space-y-4">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3">
                <div className="font-black uppercase tracking-wider text-amber-700 mb-1">📝 {(T as any).noteLabel || T.noteLabel}</div>
                <textarea value={orderNote} onChange={e=>setOrderNote(e.target.value)} placeholder={T.notePlaceholder} maxLength={200} rows={3} className="w-full bg-white border-2 border-amber-200 focus:border-black rounded-xl px-3 py-2 outline-none font-medium resize-none" />
                <div className="text-amber-700 mt-1 text-right font-bold text-sm">{orderNote.length}/200</div>
              </div>
              <div>
                <div className="font-black uppercase tracking-wider opacity-60 mb-2 flex justify-between"><span>💝 {T.tip}</span>{tipPercent>0 && <span className="text-black">+{tipAmount.toFixed(2)}€</span>}</div>
                <div className="grid grid-cols-4 gap-2">
                  {[0,10,20,30].map(pct=>(
                    <button key={pct} onClick={()=>setTipPercent(pct)} className={`h-10 rounded-full font-bold border-2 transition ${tipPercent===pct? 'bg-black text-white border-black' : 'bg-white border-zinc-200'}`}>{pct===0? (T as any).noTip || 'Bez tipa' : `${pct}%`}</button>
                  ))}
                </div>
              </div>
              {restaurant?.serviceMode==='BAR'? (
                <div className="bg-amber-300 border-2 border-black rounded-2xl p-3 flex gap-2.5 items-start">
                  <div className="w-9 h-9 bg-black text-white rounded-full grid place-items-center shrink-0">🛎</div>
                  <div><div className="font-black uppercase">{(T as any).barPickupTitle || 'Preuzimanje na šanku'}</div><div className="text-sm mt-0.5 font-medium">{(T as any).barPickupDesc || 'Ovdje naručite i platite, a piće/hranu preuzmite na šanku kad bude spremno.'}</div></div>
                </div>
              ) : (
                <div className="bg-white border rounded-2xl p-2.5 flex gap-2 items-center"><div>🍽</div><div className="font-medium text-sm">{(T as any).waiterService || 'Poslužuje konobar - dostava na stol'} {tableNumber}</div></div>
              )}
              <div className="font-black uppercase tracking-wider opacity-60 text-sm">{(T as any).paymentMethod || 'Način plaćanja'}</div>
              <div className="grid grid-cols-3 gap-2">
                {payCashEnabled && <button onClick={()=>setPaymentMethod('CASH')} className={`p-3 rounded-2xl border-2 text-left transition ${paymentMethod==='CASH'?'border-black bg-black text-white':'border-zinc-200 bg-white'}`}><div>💵</div><div className="font-bold mt-1">{(T as any).cash || 'Gotovina'}</div></button>}
                {payTerminalEnabled && <button onClick={()=>setPaymentMethod('CARD_TERMINAL')} className={`p-3 rounded-2xl border-2 text-left transition ${paymentMethod==='CARD_TERMINAL'?'border-black bg-black text-white':'border-zinc-200 bg-white'}`}><div>💳</div><div className="font-bold mt-1">{(T as any).pos || 'POS'}</div></button>}
                {payOnlineEnabled? <button onClick={()=>setPaymentMethod('CARD_ONLINE')} className={`p-3 rounded-2xl border-2 text-left transition ${paymentMethod==='CARD_ONLINE'?'border-black bg-black text-white':'border-zinc-200 bg-white'}`}><div>🌐</div><div className="font-bold mt-1">{(T as any).online || 'Online'}</div></button> : <button disabled className="p-3 rounded-2xl border-2 border-zinc-100 bg-zinc-100 opacity-50 text-left"><div>🌐</div><div className="font-bold mt-1">{(T as any).online || 'Online'}</div></button>}
              </div>
              <div className="bg-white border rounded-2xl p-3 space-y-1">
                <div className="flex justify-between"><span className="text-zinc-500">{T.subtotal}</span><span className="font-bold">{subtotal.toFixed(2)}€</span></div>
                {tipPercent>0 && <div className="flex justify-between"><span className="text-zinc-500">{(T as any).tipAmount || T.tip} {tipPercent}%</span><span className="font-bold">+{tipAmount.toFixed(2)}€</span></div>}
                <div className="flex justify-between font-black pt-1 border-t mt-1"><span>{T.total}</span><span>{total.toFixed(2)}€</span></div>
              </div>
              <button disabled={sending || cart.length===0} onClick={order} className="w-full bg-black text-white py-4 rounded-full font-black shadow-lg disabled:opacity-50 active:scale-[0.98] transition">
                {sending? T.sending : paymentMethod==='CASH'? `${T.orderCash} • ${total.toFixed(2)}€` : paymentMethod==='CARD_TERMINAL'? `${T.orderPos} • ${total.toFixed(2)}€` : `${T.payOnline} • ${total.toFixed(2)}€`}
              </button>
              <div className="h-6" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
