'use client'
import { useState, useEffect, useRef, useMemo } from 'react'

type Item = { id:string, name:string, nameEn?:string|null, nameDe?:string|null, description?:string|null, descriptionEn?:string|null, descriptionDe?:string|null, price:number, isBoosted:boolean, boostLevel:number, imageUrl?:string|null, available?:boolean }
type Cat = { id:string, name:string, nameEn?:string|null, nameDe?:string|null, items: Item[] }
type PayConfig = { paymentCashEnabled:boolean, paymentCardTerminalEnabled:boolean, paymentCardOnlineEnabled:boolean, name?:string }

export default function MenuClient({ restaurant, tableNumber, cats, lang, slug }: { restaurant:any, tableNumber:number|null, cats:Cat[], lang:'hr'|'en'|'de', slug:string }) {
  const [cart, setCart] = useState<{id:string, qty:number}[]>([])
  const [upsells, setUpsells] = useState<Item[]>([])
  const [sending, setSending] = useState(false)
  const [activeCat, setActiveCat] = useState(cats[0]?.id || "")
  const [search, setSearch] = useState("")
  const [payConfig, setPayConfig] = useState<PayConfig>({ paymentCashEnabled:true, paymentCardTerminalEnabled:true, paymentCardOnlineEnabled:false })
  const [paymentMethod, setPaymentMethod] = useState<'CASH'|'CARD_TERMINAL'|'CARD_ONLINE'>('CASH')
  const [tipPercent, setTipPercent] = useState(0)
  const catRefs = useRef<Record<string, HTMLElement|null>>({})

  const t = (hr:string, en?:string|null, de?:string|null) => {
    if(lang==='en') return en||hr
    if(lang==='de') return de||hr
    return hr
  }

  useEffect(()=>{
    fetch(`/api/public/restaurant/${slug}`).then(r=>r.json()).then(d=>{
      if(d.paymentCashEnabled!==undefined) {
        setPayConfig(d)
        if(d.paymentCardOnlineEnabled) setPaymentMethod('CARD_ONLINE')
        else if(d.paymentCardTerminalEnabled) setPaymentMethod('CARD_TERMINAL')
        else setPaymentMethod('CASH')
      }
    }).catch(()=>{})
  },[slug])

  const add = (id:string) => setCart(prev => {
    const ex = prev.find(p=>p.id===id)
    if(ex) return prev.map(p=>p.id===id? {...p, qty:p.qty+1}:p)
    return [...prev, {id, qty:1}]
  })
  const dec = (id:string) => setCart(prev => prev.map(p=>p.id===id? {...p, qty:p.qty-1}:p).filter(p=>p.qty>0))

  const cartDetailed = useMemo(()=> cart.map(c=>{
    const item = cats.flatMap(cat=>cat.items).find(i=>i.id===c.id)
    return item? {...item, qty:c.qty} : null
  }).filter(Boolean) as (Item & {qty:number})[], [cart, cats])

  const subtotal = cartDetailed.reduce((s,i)=>s + i.price*i.qty, 0)
  const tipAmount = subtotal * (tipPercent/100)
  const total = subtotal + tipAmount
  const cartIds = cart.map(c=>c.id)

  const filteredCats = useMemo(()=>{
    const q = search.toLowerCase().trim()
    if(!q) return cats
    return cats.map(c=>({...c, items: c.items.filter(i=>
      t(i.name,i.nameEn,i.nameDe).toLowerCase().includes(q) ||
      (i.description||"").toLowerCase().includes(q)
    )})).filter(c=>c.items.length>0)
  }, [cats, search])

  useEffect(()=>{
    if(!cartIds.length){ setUpsells([]); return }
    fetch(`/api/menu/${slug}/upsell`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ cartItemIds: cartIds }) })
  .then(r=>r.json()).then(d=>setUpsells(d.upsells||[])).catch(()=>{})
  }, [JSON.stringify(cartIds), slug])

  useEffect(()=>{
    const obs = new IntersectionObserver((entries)=>{
      const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]
      if(visible?.target?.id) setActiveCat(visible.target.id)
    }, { rootMargin: "-30% 0px -65% 0px", threshold: [0,0.25,0.5] })
    Object.values(catRefs.current).forEach(el=> el && obs.observe(el))
    return ()=>obs.disconnect()
  }, [filteredCats])

  const order = async () => {
    if(!cart.length) return
    setSending(true)
    try {
      if(paymentMethod === 'CARD_ONLINE') {
        const res = await fetch('/api/public/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ restaurantSlug: slug, tableNumber, items: cart, tipPercent }) })
        const data = await res.json()
        if(data.url) { window.location.href = data.url; return }
        if(data.mock) { alert(lang==='hr'?'Narudžba kreirana (Stripe nije aktivan)':'Order created (Stripe not active)'); setCart([]); return }
        throw new Error(data.error||'Checkout error')
      } else {
        const res = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ restaurantSlug: slug, tableNumber, items: cart, paymentMethod, tipPercent }) })
        const data = await res.json()
        if(data.order){ alert(lang==='hr'?'Narudžba poslana! Konobar dolazi uskoro':'Order sent!'); setCart([]) }
        else throw new Error(data.error||'')
      }
    } catch(e:any) {
      alert('Greška: '+(e.message||''))
    } finally {
      setSending(false)
    }
  }

  const getQty = (id:string) => cart.find(c=>c.id===id)?.qty || 0

  return (
    <div className="min-h-screen bg-orange-50/50 text-zinc-900 pb-96">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Inter:wght@400;500;600&display=swap'); h1,h2,h3{font-family:'Sora',sans-serif}`}</style>

      <div className="sticky top-0 z-30 bg-orange-50/80 backdrop-blur-xl border-b border-black/5">
        <div className="px-4 py-3 max-w-5xl mx-auto">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-2.5 opacity-40">🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={lang==='hr'?'Traži jelo...': lang==='de'?'Gericht suchen...':'Search dish...'} className="w-full bg-white border border-black/10 rounded-full pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"/>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
            {cats.map(c=>(
              <button key={c.id} onClick={()=>{ setActiveCat(c.id); catRefs.current[c.id]?.scrollIntoView({behavior:'smooth', block:'start'}) }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all border ${activeCat===c.id? "bg-black text-white border-black shadow" : "bg-white text-zinc-700 border-black/10 hover:border-black/20"}`}>
                {t(c.name,c.nameEn,c.nameDe)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">
        {filteredCats.map(cat=>(
          <section key={cat.id} id={cat.id} ref={el=>{catRefs.current[cat.id]=el}} className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold tracking-tight">{t(cat.name,cat.nameEn,cat.nameDe)}</h2>
              <div className="h-px flex-1 bg-black/10"/>
              <span className="text-xs bg-white border border-black/10 rounded-full px-2.5 py-1">{cat.items.length}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {cat.items.map(item=>{
                const qty = getQty(item.id)
                const isUnavailable = item.available===false
                return (
                  <div key={item.id} className={`group relative bg-white rounded-2xl border p-3 flex gap-3 transition-all ${item.isBoosted? "border-amber-200 shadow-lg shadow-amber-100/50" : "border-black/5 hover:border-black/15"} ${isUnavailable? "opacity-60" : ""}`}>
                    {item.isBoosted && <div className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">🔥 CHEF</div>}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                      <img src={item.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&q=80`} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2 items-start">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2 pr-1">{t(item.name,item.nameEn,item.nameDe)}</h3>
                        <span className="font-bold text-sm shrink-0">{item.price.toFixed(2)} €</span>
                      </div>
                      {(item.description || item.descriptionEn) && <p className="text-xs leading-snug text-zinc-500 mt-1 line-clamp-2">{t(item.description||"",item.descriptionEn,item.descriptionDe)}</p>}
                      <div className="flex items-center justify-between mt-2">
                        {isUnavailable? <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 border">Nedostupno</span> : <span/>}
                        {qty===0? (
                          <button onClick={()=>add(item.id)} disabled={isUnavailable} className="bg-black text-white w-8 h-8 rounded-full font-bold text-lg leading-none hover:bg-zinc-800 active:scale-90 transition">+</button>
                        ) : (
                          <div className="flex items-center gap-1 bg-black text-white rounded-full p-1">
                            <button onClick={()=>dec(item.id)} className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">-</button>
                            <span className="w-6 text-center text-xs font-bold">{qty}</span>
                            <button onClick={()=>add(item.id)} className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">+</button>
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
      </div>

      {cart.length>0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3">
          <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            {upsells.length>0 && (
              <div className="bg-amber-50 border-b border-amber-100 p-3">
                <div className="text-xs font-bold tracking-widest opacity-60 mb-2">UZ OVO IDE ODLIČNO</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {upsells.map(u=>(
                    <button key={u.id} onClick={()=>add(u.id)} className="shrink-0 bg-white border border-black/10 rounded-xl px-3 py-2 text-left min-w-32 hover:border-black/20">
                      <div className="text-xs font-semibold truncate">{u.name}</div>
                      <div className="text-xs opacity-60">{u.price.toFixed(2)} € • + Dodaj</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm">Košarica • Stol {tableNumber?? '?'}</span>
                <span className="text-xs opacity-60">{subtotal.toFixed(2)}€ + napojnica</span>
              </div>
              <div className="space-y-1 max-h-20 overflow-auto mb-3 pr-1">
                {cartDetailed.map(i=>(
                  <div key={i.id} className="flex justify-between text-xs"><span className="truncate mr-2">{i.name} x{i.qty}</span><span className="shrink-0 opacity-60">{(i.price*i.qty).toFixed(2)}€</span></div>
                ))}
              </div>

              <div className="mb-3">
                <div className="text-xs font-bold tracking-widest opacity-60 mb-2">NAPOJNICA</div>
                <div className="flex gap-2">
                  {[0,10,15].map(p=>(
                    <button key={p} onClick={()=>setTipPercent(p)} className={`flex-1 py-2 rounded-full text-xs font-bold border ${tipPercent===p?'bg-black text-white border-black':'bg-white border-black/10'}`}>{p===0?'Bez':p+'%'}</button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-bold tracking-widest opacity-60 mb-2">NAČIN PLAĆANJA</div>
                <div className="grid grid-cols-1 gap-2">
                  {payConfig.paymentCashEnabled && (
                    <button onClick={()=>setPaymentMethod('CASH')} className={`flex justify-between items-center px-4 py-2.5 rounded-xl border text-xs font-semibold ${paymentMethod==='CASH'?'bg-black text-white border-black':'bg-white border-black/10'}`}>
                      <span>💵 {lang==='hr'?'Gotovina':'Cash'}</span><span>{paymentMethod==='CASH'?'●':''}</span>
                    </button>
                  )}
                  {payConfig.paymentCardTerminalEnabled && (
                    <button onClick={()=>setPaymentMethod('CARD_TERMINAL')} className={`flex justify-between items-center px-4 py-2.5 rounded-xl border text-xs font-semibold ${paymentMethod==='CARD_TERMINAL'?'bg-black text-white border-black':'bg-white border-black/10'}`}>
                      <span>💳 {lang==='hr'?'Kartica konobaru':'Card to waiter'}</span><span>{paymentMethod==='CARD_TERMINAL'?'●':''}</span>
                    </button>
                  )}
                  {payConfig.paymentCardOnlineEnabled && (
                    <button onClick={()=>setPaymentMethod('CARD_ONLINE')} className={`flex justify-between items-center px-4 py-2.5 rounded-xl border text-xs font-semibold ${paymentMethod==='CARD_ONLINE'?'bg-black text-white border-black':'bg-white border-black/10'}`}>
                      <span>🔒 {lang==='hr'?'Plati karticom odmah':'Pay online'}</span><span className="text- bg-green-500 text-white px-2 py-0.5 rounded-full ml-2">STRIPE</span>
                    </button>
                  )}
                </div>
              </div>

              {tipPercent>0 && <div className="flex justify-between text-xs mb-1"><span className="opacity-60">Napojnica {tipPercent}%</span><span>{tipAmount.toFixed(2)}€</span></div>}
              <div className="flex justify-between font-bold mb-3"><span>Ukupno</span><span>{total.toFixed(2)}€</span></div>

              <button disabled={sending} onClick={order} className="w-full bg-black text-white py-3.5 rounded-full font-bold text-sm tracking-wide active:scale-95 transition disabled:opacity-50">
                {sending? 'Šaljem...' : paymentMethod==='CARD_ONLINE'? `Plati karticom • ${total.toFixed(2)} €` : `Naruči • ${total.toFixed(2)} €`}
              </button>
              <div className="text- text-center opacity-40 mt-2">Sigurno plaćanje preko Stripe-a • {payConfig.name||''}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
