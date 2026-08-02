"use client";
import { useEffect, useState, useRef } from "react";
type Order = { id:string; status:string; total:number; createdAt:string; table:{number:number}; items:{quantity:number; note?:string; price:number; menuItem:{name:string}}[]; paymentMethod?: string; paymentStatus?: string; };
const STATUS_COLORS:any={ pending:"border-yellow-400 bg-yellow-50", preparing:"border-blue-400 bg-blue-50", ready:"border-green-500 bg-green-50", done:"border-gray-300 bg-white opacity-60" };
const STATUS_LABEL:any={ pending:"NOVO 🔔", preparing:"U PRIPREMI", ready:"SPREMNO", done:"ZAVRŠENO" };
const PAYMENT_LABEL:any={ CASH:"💵 Gotovina", CARD_TERMINAL:"💳 Terminal", CARD_ONLINE:"🌐 Online" };
const PAYMENT_STATUS_STYLE:any={ PENDING:"bg-amber-100 text-amber-800 border-amber-200", PAID:"bg-green-100 text-green-800 border-green-200", FAILED:"bg-red-100 text-red-800 border-red-200" };
export default function OrdersPage(){
  const [orders,setOrders]=useState<Order[]>([]);
  const [filter,setFilter]=useState("all");
  const [soundOn,setSoundOn]=useState(true);
  const [lastCount,setLastCount]=useState(0);
  const [userInfo,setUserInfo]=useState<any>(null);
  const audioRef=useRef<HTMLAudioElement>(null);
  const load=async()=>{
    const res=await fetch("/api/admin/orders",{cache:"no-store"});
    const data=await res.json();
    const newOrders:Order[]=data.orders||[];
    const pendingNow=newOrders.filter((o:any)=>o.status==="pending").length;
    if(soundOn && pendingNow>lastCount && lastCount!==0){ audioRef.current?.play().catch(()=>{}); }
    setLastCount(pendingNow);
    setOrders(newOrders);
  };
  const loadMe = async()=>{
    const r = await fetch('/api/admin/me').then(x=>x.json()).catch(()=>null)
    if(r?.user) setUserInfo(r.user)
  }
  useEffect(()=>{ load(); loadMe(); const id=setInterval(load,3000); return()=>clearInterval(id); },[lastCount,soundOn]);
  const updateStatus=async(id:string,status:string)=>{ await fetch(`/api/admin/orders/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}); load(); };
  const logout = async()=>{ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login' }
  const filtered=orders.filter(o=>filter==="all"||o.status===filter);
  const timeAgo=(date:string)=>{ const diff=Math.floor((Date.now()-new Date(date).getTime())/1000/60); if(diff<1) return "sada"; if(diff<60) return `${diff} min`; return `${Math.floor(diff/60)}h ${diff%60}m`; };
  const isKitchen = userInfo?.role === 'KITCHEN'
  const isWaiter = userInfo?.role === 'WAITER'
  return(
    <div className="p-4 max-w- mx-auto">
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{isKitchen? "Kuhinja - Narudžbe 👨‍🍳" : isWaiter? "Konobar - Narudžbe 🧑‍💼" : "Narudžbe"}</h1>
          {userInfo && <p className="text-xs text-zinc-500 mt-0.5">{userInfo.name||userInfo.email} • {userInfo.role}</p>}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs text-gray-500 animate-pulse">● LIVE 3s</span>
          <button onClick={()=>setSoundOn(!soundOn)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${soundOn?"bg-black text-white":"bg-gray-200"}`}>{soundOn?"🔔 ON":"🔕 OFF"}</button>
          <button onClick={logout} className="px-4 py-1.5 rounded-full text-xs font-bold bg-zinc-900 text-white">Odjava</button>
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {[{k:"all",label:"Sve"},{k:"pending",label:"Novo"},{k:"preparing",label:"U pripremi"},{k:"ready",label:"Spremno"}].map(f=><button key={f.k} onClick={()=>setFilter(f.k)} className={`px-4 py-2 rounded-full text-sm font-bold ${filter===f.k?"bg-black text-white":"bg-gray-100"}`}>{f.label} {f.k!=="all"&&`(${orders.filter(o=>o.status===f.k).length})`}</button>)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(o=>{
          const payMethod = o.paymentMethod || 'CASH'
          const payStatus = o.paymentStatus || 'PENDING'
          const isPaid = payStatus === 'PAID'
          return (
          <div key={o.id} className={`border-2 rounded-xl p-4 ${STATUS_COLORS[o.status]||"bg-white"} ${isPaid && payMethod==='CARD_ONLINE'? 'ring-2 ring-green-400' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-black text-lg">STOL {o.table?.number}</div>
                <div className="text-xs text-gray-500">{timeAgo(o.createdAt)} • {new Date(o.createdAt).toLocaleTimeString()} {!isKitchen && `• ${o.total.toFixed(2)}€`}</div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-black text-white">{STATUS_LABEL[o.status]}</span>
            </div>
            {!isKitchen && (
              <div className="flex gap-2 mb-2 flex-wrap">
                <span className="text- font-bold px-2.5 py-1 rounded-full border bg-white">{PAYMENT_LABEL[payMethod]||payMethod}</span>
                <span className={`text- font-bold px-2.5 py-1 rounded-full border ${PAYMENT_STATUS_STYLE[payStatus]||'bg-white'}`}>
                  {payStatus==='PAID'? '✅ PLAĆENO' : payStatus==='PENDING' && payMethod==='CARD_ONLINE'? '⏳ Čeka online' : payStatus==='PENDING'? '💰 Za naplatu' : payStatus}
                </span>
              </div>
            )}
            <div className="space-y-1 my-3 bg-white/70 rounded p-2">{o.items.map((it,i)=><div key={i} className="flex justify-between text-sm"><span className="font-bold">{it.quantity}x {it.menuItem?.name}</span><span className="text-xs">{it.note&&`(${it.note})`} {!isKitchen && `• ${it.price?.toFixed(2)}€`}</span></div>)}</div>
            {isWaiter && payMethod==='CARD_TERMINAL' && o.status!=='done' && (<div className="text- bg-violet-50 border border-violet-200 text-violet-800 rounded-lg p-2 mb-2">💳 Treba naplatiti na terminalu - odnesi POS</div>)}
            {isPaid && payMethod==='CARD_ONLINE' && (<div className="text- bg-green-50 border border-green-200 text-green-800 rounded-lg p-2 mb-2">✅ Gost već platio online - ne naplaćuj!</div>)}
            <div className="grid grid-cols-3 gap-1 mt-3">
              {o.status==="pending"&&<button onClick={()=>updateStatus(o.id,"preparing")} className="col-span-3 bg-blue-600 text-white py-2 rounded font-bold text-sm">PREUZMI</button>}
              {o.status==="preparing"&&<button onClick={()=>updateStatus(o.id,"ready")} className="col-span-3 bg-green-600 text-white py-2 rounded font-bold text-sm">✅ SPREMNO</button>}
              {o.status==="ready"&&<button onClick={()=>updateStatus(o.id,"done")} className="col-span-3 bg-gray-800 text-white py-2 rounded font-bold text-sm">ZAVRŠI</button>}
            </div>
          </div>
        )})}
      </div>
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2021/08/04/audio_0625c8d8f1.mp3" preload="auto" />
    </div>
  );
}
