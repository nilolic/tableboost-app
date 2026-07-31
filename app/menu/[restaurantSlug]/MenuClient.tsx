'use client'
import { useState, useEffect } from 'react'

type Item = { id:string, name:string, nameEn?:string, nameDe?:string, description?:string, descriptionEn?:string, descriptionDe?:string, price:number, isBoosted:boolean, boostLevel:number, imageUrl?:string }
type Cat = { id:string, name:string, nameEn?:string, nameDe?:string, items: Item[] }

export default function MenuClient({ restaurant, tableNumber, cats, lang, slug }: { restaurant:any, tableNumber:number|null, cats:Cat[], lang:'hr'|'en'|'de', slug:string }) {
  const [cart, setCart] = useState<{id:string, qty:number}[]>([])
  const [upsells, setUpsells] = useState<Item[]>([])
  const [sending, setSending] = useState(false)

  const t = (hr:string, en?:string|null, de?:string|null) => {
    if(lang==='en') return en||hr
    if(lang==='de') return de||hr
    return hr
  }

  const add = (id:string) => {
    setCart(prev => {
      const ex = prev.find(p=>p.id===id)
      if(ex) return prev.map(p=>p.id===id? {...p, qty:p.qty+1}:p)
      return [...prev, {id, qty:1}]
    })
  }
  const dec = (id:string) => {
    setCart(prev => prev.map(p=>p.id===id? {...p, qty:p.qty-1}:p).filter(p=>p.qty>0))
  }

  const cartIds = cart.map(c=>c.id)
  const cartDetailed = cart.map(c=>{
    const item = cats.flatMap(cat=>cat.items).find(i=>i.id===c.id)
    return item? {...item, qty:c.qty} : null
  }).filter(Boolean) as (Item & {qty:number})[]

  const total = cartDetailed.reduce((s,i)=>s + i.price*i.qty, 0)

  useEffect(()=>{
    fetch(`/api/menu/${slug}/upsell`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ cartItemIds: cartIds }) })
     .then(r=>r.json()).then(d=>setUpsells(d.upsells||[]))
  }, [JSON.stringify(cartIds), slug])

  const order = async () => {
    if(!cart.length) return
    setSending(true)
    const res = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ restaurantSlug: slug, tableNumber, items: cart }) })
    const data = await res.json()
    setSending(false)
    if(data.order){ alert(lang==='hr'?'Narudžba poslana!':'Order sent!'); setCart([]) }
    else alert('Greška')
  }

  return (
    <div className="pb-32">
      <div className="p-6 space-y-8">
        {cats.map(cat=>(
          <div key={cat.id}>
            <h2 className="text-xl font-bold mb-3 border-b pb-2 flex justify-between"><span>{t(cat.name, cat.nameEn, cat.nameDe)}</span><span className="text-xs font-normal text-neutral-400">{cat.items.length}</span></h2>
            <div className="space-y-3">
              {cat.items.filter(i=>true).map(item=>(
                <div key={item.id} className={`flex justify-between gap-4 p-3 rounded-xl border ${item.isBoosted?'bg-yellow-50 border-yellow-200': 'border-neutral-100'}`}>
                  <div className="flex-1">
                    <div className="font-semibold flex gap-2 items-center">{t(item.name, item.nameEn, item.nameDe)} {item.isBoosted && <span className="bg-black text-white text- px-2 py-0.5 rounded-full">🔥 BOOST</span>}</div>
                    {(item.description) && <div className="text-sm opacity-60 mt-0.5">{t(item.description||'', item.descriptionEn, item.descriptionDe)}</div>}
                    <div className="font-bold mt-1">{item.price.toFixed(2)} €</div>
                  </div>
                  <button onClick={()=>add(item.id)} className="self-center bg-black text-white px-4 py-2 rounded-full text-sm font-bold active:scale-95">+</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {cart.length>0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl max-w-xl mx-auto">
          <div className="p-4">
            <div className="font-bold mb-2 flex justify-between">Košarica ({cart.length}) <span>{total.toFixed(2)} €</span></div>
            <div className="space-y-1 max-h-32 overflow-auto mb-3">
              {cartDetailed.map(i=>(
                <div key={i.id} className="flex justify-between text-sm"><span>{i.name} x{i.qty}</span><span className="flex gap-2"><button onClick={()=>dec(i.id)} className="px-2 bg-neutral-100 rounded">-</button><button onClick={()=>add(i.id)} className="px-2 bg-neutral-100 rounded">+</button> {(i.price*i.qty).toFixed(2)}€</span></div>
              ))}
            </div>

            {upsells.length>0 && (
              <div className="bg-neutral-50 rounded-xl p-3 mb-3">
                <div className="font-bold text-sm mb-2">🍟 Uz ovo ide odlično</div>
                <div className="flex gap-2 overflow-x-auto">
                  {upsells.map(u=>(
                    <button key={u.id} onClick={()=>add(u.id)} className="min-w- bg-white border rounded-lg p-2 text-left">
                      <div className="font-semibold text-xs truncate">{u.name}</div>
                      <div className="text-xs opacity-60">{u.price.toFixed(2)}€</div>
                      <div className="text- mt-1 bg-black text-white rounded-full px-2 py-0.5 inline-block">+ Dodaj</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button disabled={sending} onClick={order} className="w-full bg-black text-white py-3 rounded-xl font-bold">{sending?'Šaljem...':'Naruči • '+total.toFixed(2)+' €'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
