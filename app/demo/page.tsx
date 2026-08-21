"use client";
import { useState } from "react";
import { ShoppingCart, Plus, Minus, X, ChefHat, Flame, Clock, Check, UtensilsCrossed, QrCode, Smartphone, ArrowRight, Timer, Sparkles } from "lucide-react";
import Link from "next/link";

type Item = { id:string; name:string; desc:string; price:number; cat:string; popular?:boolean; time?:string; img:string; };
type CartItem = Item & { qty:number };

const CATS = ["Sve", "Predjela", "Glavna jela", "Deserti", "Pića"];

const ITEMS: Item[] = [
  { id:"1", name:"Bruschetta Burrata", desc:"Prženi kruh, burrata, cherry rajčica, bosiljak, maslinovo ulje", price:8.5, cat:"Predjela", popular:true, time:"8 min", img:"🍅" },
  { id:"2", name:"Tartar Biftek", desc:"Juneći biftek, kapare, senf, žumanjak, tost", price:16.9, cat:"Predjela", time:"12 min", img:"🥩" },
  { id:"3", name:"Crispy Chicken Burger", desc:"Pohani zabatak, coleslaw, cheddar, spicy mayo, krumpirići", price:13.5, cat:"Glavna jela", popular:true, time:"15 min", img:"🍔" },
  { id:"4", name:"Pasta Tartufo", desc:"Domaća tjestenina, vrganji, tartuf, parmezan", price:18.5, cat:"Glavna jela", time:"14 min", img:"🍝" },
  { id:"5", name:"Sea Bass File", desc:"File brancina, blitva na dalmatinski, limun", price:22.0, cat:"Glavna jela", popular:true, time:"18 min", img:"🐟" },
  { id:"6", name:"Margherita Pizza", desc:"San Marzano rajčica, mozzarella di bufala, bosiljak", price:11.9, cat:"Glavna jela", time:"12 min", img:"🍕" },
  { id:"7", name:"Cheesecake Pistachio", desc:"Pistacija, bijela čokolada, malina coulis", price:6.9, cat:"Deserti", popular:true, time:"3 min", img:"🍰" },
  { id:"8", name:"Tiramisu Classico", desc:"Espresso, mascarpone, kakao", price:5.9, cat:"Deserti", time:"2 min", img:"☕" },
  { id:"9", name:"Craft Limunada", desc:"Domaća limunada, đumbir, med, menta", price:4.5, cat:"Pića", time:"2 min", img:"🍋" },
  { id:"10", name:"Aperol Spritz", desc:"Aperol, prosecco, soda, naranča", price:7.5, cat:"Pića", popular:true, time:"3 min", img:"🍹" },
];

export default function DemoPage(){
  const [activeCat, setActiveCat] = useState("Sve");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [table] = useState("12");

  const filtered = activeCat === "Sve" ? ITEMS : ITEMS.filter(i=>i.cat===activeCat);
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const count = cart.reduce((s,i)=>s+i.qty,0);

  const add = (item:Item) => {
    setCart(c=>{
      const ex=c.find(x=>x.id===item.id);
      if(ex) return c.map(x=>x.id===item.id?{...x,qty:x.qty+1}:x);
      return [...c,{...item,qty:1}];
    });
    setShowCart(true);
  };
  const dec = (id:string) => {
    setCart(c=> c.map(x=>x.id===id?{...x,qty:x.qty-1}:x).filter(x=>x.qty>0));
  };

  const placeOrder = () => {
    setOrdered(true);
    setTimeout(()=>{ setOrdered(false); setCart([]); setShowCart(false); }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-zinc-900 antialiased">
      <style>{` *{font-family:Inter,sans-serif}`}</style>

      <div className="sticky top-0 z-[60] bg-zinc-900 text-white text-[13px] font-medium">
        <div className="mx-auto max-w-[1240px] px-5 h-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DEMO MODE • Ovo je interaktivni demo - narudžbe ne idu u kuhinju</span>
          </div>
          <Link href="/" className="hidden md:flex items-center gap-1.5 text-zinc-400 hover:text-white">← Natrag na site</Link>
        </div>
      </div>

      <div className="border-b border-zinc-200/60 bg-white/80 backdrop-blur sticky top-10 z-40">
        <div className="mx-auto max-w-[1240px] px-5 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white font-bold">D</div>
            <div>
              <div className="font-bold leading-none">Demo Bistro</div>
              <div className="text-[12px] text-zinc-500 flex items-center gap-1"><QrCode className="h-3 w-3" /> Stol {table} • Unutra • 2 osobe</div>
            </div>
          </div>
          <button onClick={()=>setShowCart(true)} className="relative h-11 px-5 rounded-full bg-zinc-900 text-white font-semibold flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Košarica
            {count>0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 grid place-items-center text-[11px] font-bold">{count}</span>}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-5 py-6 grid lg:grid-cols-[1fr_340px] gap-6">
        <div>
          <div className="rounded-[24px] bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-6 lg:p-8 relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/20 blur-[60px] rounded-full" />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide"><Sparkles className="h-3 w-3" /> BOOST • Najprodavanije danas</div>
              <h1 className="mt-3 text-[28px] font-extrabold leading-[1.1] tracking-tight">Skeniraj. Naruči.<br/>Uživaj.</h1>
              <p className="mt-2 text-[14px] text-zinc-300 max-w-[380px]">Bez čekanja konobara. Narudžba ide direktno u kuhinju. Plaćanje na kraju ili odmah.</p>
              <div className="mt-4 flex gap-2 text-[12px]">
                <span className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1"><Clock className="h-3 w-3" /> Prosjek 12 min</span>
                <span className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1"><Flame className="h-3 w-3" /> 127 narudžbi danas</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 lg:mx-0 lg:px-0 scrollbar-none">
            {CATS.map(c=>(
              <button key={c} onClick={()=>setActiveCat(c)} className={`shrink-0 h-9 px-4 rounded-full text-[14px] font-semibold transition ${activeCat===c ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>{c}</button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-2">
            {filtered.map(item=>(
              <div key={item.id} className="group relative rounded-[20px] bg-white border border-zinc-200/70 p-4 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all">
                {item.popular && <div className="absolute top-3 left-3 z-10 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-full flex items-center gap-1">👑 BOOST</div>}
                <div className="flex gap-3">
                  <div className="h-[64px] w-[64px] rounded-2xl bg-[#FFFBF7] border border-zinc-100 grid place-items-center text-[32px] shrink-0">{item.img}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[15px] leading-tight">{item.name}</div>
                    <div className="text-[12px] text-zinc-500 leading-[1.4] mt-1 line-clamp-2">{item.desc}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold">€{item.price.toFixed(2)}</span>
                        <span className="text-[11px] bg-zinc-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Timer className="h-3 w-3" />{item.time}</span>
                      </div>
                      <button onClick={()=>add(item)} className="h-8 w-8 rounded-full bg-zinc-900 text-white grid place-items-center group-hover:bg-emerald-600 transition"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-[132px] h-fit">
          <div className="rounded-[20px] bg-white border border-zinc-200 p-4">
            <div className="font-bold flex items-center gap-2"><UtensilsCrossed className="h-4 w-4" /> Tvoja narudžba</div>
            {cart.length===0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-zinc-100 grid place-items-center text-xl">🛒</div>
                <div className="mt-3 text-[13px] text-zinc-500">Košarica je prazna.<br/>Dodaj nešto iz menija.</div>
              </div>
            ) : (
              <>
                <div className="mt-3 space-y-2">
                  {cart.map(ci=>(
                    <div key={ci.id} className="flex items-center justify-between text-[13px]">
                      <div className="flex-1"><span className="font-semibold">{ci.qty}x</span> {ci.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">€{(ci.price*ci.qty).toFixed(2)}</span>
                        <button onClick={()=>dec(ci.id)} className="h-6 w-6 rounded-full bg-zinc-100 grid place-items-center"><Minus className="h-3 w-3" /></button>
                        <button onClick={()=>add(ci)} className="h-6 w-6 rounded-full bg-zinc-900 text-white grid place-items-center"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t pt-3 flex justify-between font-bold">Ukupno <span>€{total.toFixed(2)}</span></div>
                <button onClick={placeOrder} className="mt-3 w-full h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center gap-2">Pošalji u kuhinju <ArrowRight className="h-4 w-4" /></button>
                <div className="mt-2 text-[11px] text-zinc-500 text-center">Demo: narudžba se ne naplaćuje</div>
              </>
            )}
          </div>

          <div className="rounded-[20px] bg-zinc-900 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="font-bold flex items-center gap-2"><ChefHat className="h-4 w-4 text-emerald-400" /> KDS Uživo</div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">LIVE</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="rounded-xl bg-white/10 p-3 text-[12px]">
                <div className="flex justify-between"><span className="font-bold">Stol 12</span><span className="text-emerald-300">NOVO • sad</span></div>
                <div className="mt-1 text-zinc-300">{cart.length>0 ? cart.map(c=>`${c.qty}x ${c.name}`).join(", ") : "2x Burger, 1x Aperol"}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-[12px] opacity-60">
                <div className="flex justify-between"><span className="font-bold">Stol 4</span><span>4 min</span></div>
                <div className="mt-1 text-zinc-400">1x Pasta Tartufo, 1x Limunada</div>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-zinc-400">U pravoj app kuhinja vidi narudžbe odmah, bez papira i vikanja.</div>
          </div>

          <div className="rounded-[20px] bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-900 p-4">
            <div className="font-extrabold text-[13px] flex items-center gap-1">🔥 BOOST Upsell</div>
            <div className="mt-1 text-[13px] font-medium leading-tight">Gosti koji naruče Burger dodaju krumpiriće u 63% slučajeva.</div>
            <div className="mt-1 text-[11px] opacity-80">TableBoost automatski predlaže dodatke i povećava prosječni račun 18-32%.</div>
          </div>
        </div>
      </div>

      {ordered && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm grid place-items-center p-5">
          <div className="w-full max-w-[380px] rounded-[24px] bg-white p-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 grid place-items-center"><Check className="h-8 w-8 text-emerald-600" /></div>
            <div className="mt-4 font-extrabold text-[20px]">Narudžba poslana!</div>
            <div className="mt-1 text-[13px] text-zinc-500">U demo modu ovo je simulacija. U pravom radu narudžba ide direktno na KDS u kuhinji i konobar dobiva notifikaciju.</div>
            <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-[12px] text-left">
              <div className="font-bold">Što se događa u pozadini:</div>
              <div className="mt-1 space-y-1 text-zinc-600">
                <div>✓ Kuhinja vidi narudžbu na ekranu</div>
                <div>✓ Konobar dobiva push notifikaciju</div>
                <div>✓ Stol 12 postaje aktivan</div>
                <div>✓ Račun se ažurira automatski</div>
              </div>
            </div>
            <button onClick={()=>{setOrdered(false); setCart([]);}} className="mt-4 w-full h-11 rounded-full bg-zinc-900 text-white font-bold">Super, kužim!</button>
          </div>
        </div>
      )}

      {showCart && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setShowCart(false)} />
          <div className="absolute bottom-0 inset-x-0 rounded-t-[24px] bg-white p-5 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center"><div className="font-bold">Košarica • Stol {table}</div><button onClick={()=>setShowCart(false)} className="h-8 w-8 rounded-full bg-zinc-100 grid place-items-center"><X className="h-4 w-4" /></button></div>
            <div className="mt-4 space-y-3">
              {cart.map(ci=>(
                <div key={ci.id} className="flex justify-between"><span>{ci.qty}x {ci.name}</span><span className="font-bold">€{(ci.price*ci.qty).toFixed(2)}</span></div>
              ))}
            </div>
            {cart.length>0 && <><div className="mt-4 border-t pt-3 flex justify-between font-bold text-[18px]">Ukupno <span>€{total.toFixed(2)}</span></div><button onClick={placeOrder} className="mt-4 w-full h-12 rounded-full bg-zinc-900 text-white font-bold">Pošalji u kuhinju</button></>}
          </div>
        </div>
      )}
    </div>
  );
}
