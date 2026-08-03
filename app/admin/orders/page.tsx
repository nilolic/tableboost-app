"use client"
import { useEffect, useState, useRef } from 'react'
export default function OrdersPage(){
  const [orders,setOrders]=useState<any[]>([])
  const [role,setRole]=useState<string>("")
  const [from,setFrom]=useState(''); const [to,setTo]=useState(''); const [loading,setLoading]=useState(true)
  const [audioUnlocked,setAudioUnlocked]=useState(false)
  const prevReadyRef = useRef<Set<string>>(new Set()); const audioCtxRef = useRef<any>(null)

  const unlockAudio = ()=>{
    try{
      if(typeof window==='undefined') return
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
      if(!AudioCtx) return
      if(!audioCtxRef.current) audioCtxRef.current = new AudioCtx()
      const ctx = audioCtxRef.current
      if(ctx.state==='suspended') ctx.resume().then(()=>setAudioUnlocked(true)).catch(()=>{})
      else setAudioUnlocked(true)
      // probni kratki beep da "otkljuca"
      if(ctx.state!=='suspended'){ const o=ctx.createOscillator(); const g=ctx.createGain(); o.frequency.value=440; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0,ctx.currentTime); o.start(); o.stop(ctx.currentTime+0.01) }
    }catch{}
  }

  const beepLoud = ()=>{
    try{
      if(typeof window==='undefined') return
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
      if(!AudioCtx) return
      if(!audioCtxRef.current) audioCtxRef.current = new AudioCtx()
      const ctx = audioCtxRef.current
      if(ctx.state==='suspended'){ ctx.resume().catch(()=>{}); return } // ako jos zakljucan, preskoci ali pokusaj otkljucati
      // VIBRACIJA - radi na mobitelu
      if((navigator as any).vibrate){ (navigator as any).vibrate([400,100,400,100,800]) }
      // JAKO ZVUK - 3x beep sa 2 oscilatora
      const playTone = (freq:number, start:number, dur:number, vol:number)=>{
        const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator(); const g = ctx.createGain()
        o1.frequency.value = freq; o2.frequency.value = freq*1.5
        o1.type='square'; o2.type='sine'
        o1.connect(g); o2.connect(g); g.connect(ctx.destination)
        g.gain.setValueAtTime(0, ctx.currentTime+start)
        g.gain.linearRampToValueAtTime(vol, ctx.currentTime+start+0.02)
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+start+dur)
        o1.start(ctx.currentTime+start); o2.start(ctx.currentTime+start)
        o1.stop(ctx.currentTime+start+dur); o2.stop(ctx.currentTime+start+dur)
      }
      playTone(1200,0,0.6,1.2)
      playTone(1800,0.3,0.6,1.2)
      playTone(2400,0.6,0.8,1.5)
    }catch{}
  }

  const load = async(f?:string,t?:string, silent=false)=>{
    if(!silent) setLoading(true)
    const p = new URLSearchParams(); if(f) p.set('from', f); if(t) p.set('to', t); if(f||t) p.set('all','1')
    const res = await fetch('/api/admin/orders?'+p.toString()); const d = await res.json(); const ords = d.orders||[]
    if(role === 'WAITER'){
      const readyIds = ords.filter((o:any)=> (o.status||'').toLowerCase()==='ready').map((o:any)=> o.id as string)
      const readyNow = new Set<string>(readyIds)
      readyIds.forEach((id:string)=>{
        if(!prevReadyRef.current.has(id)){
          beepLoud()
          // dodatno nakon 1s jos jednom da sigurno cuje
          setTimeout(()=>beepLoud(),1000)
        }
      })
      prevReadyRef.current = readyNow
    }
    setOrders(ords); if(!silent) setLoading(false)
  }
  useEffect(()=>{
    fetch('/api/admin/me').then(r=>r.json()).then(d=> setRole(d.role||'WAITER'))
    // auto unlock na prvi klik/touch bilo gdje
    const handler = ()=>{ unlockAudio() }
    document.addEventListener('click', handler, {once:false})
    document.addEventListener('touchstart', handler, {once:false})
    document.addEventListener('keydown', handler, {once:false})
    return ()=>{ document.removeEventListener('click', handler); document.removeEventListener('touchstart', handler); document.removeEventListener('keydown', handler) }
  },[])
  useEffect(()=>{ if(!role) return; load(); const interval = setInterval(()=> load(from,to,true), role==='WAITER' || role==='KITCHEN'? 3500 : 15000); return ()=> clearInterval(interval) },[role])
  const toNum = (v:any)=> Number(v||0)
  const updateStatus = async(id:string, status:string)=>{ await fetch(`/api/admin/orders/${id}`,{method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status})}); setOrders(prev=> prev.map(o=> o.id===id? {...o, status} : o)) }
  const payMethodLabel = (m:string)=>{ const s=(m||'').toUpperCase(); if(s.includes('CASH')) return 'Gotovina'; if(s.includes('TERMINAL')||s.includes('POS')) return 'POS'; if(s.includes('ONLINE')||s.includes('STRIPE')||s.includes('CARD')) return 'Online'; return m||'Nepoznato' }
  const exportCSV = ()=>{ const header = ['Datum','Stol','Ukupno','Napojnica','%','Status','Placanje','Artikli']; const rows = orders.map((o:any)=>{ const date = new Date(o.createdAt).toLocaleString('hr-HR'); const items = o.items?.map((i:any)=> `${i.menuItem?.name||'Artikal'} x${i.quantity}`).join(' | '); return [date, o.table?.number||'', toNum(o.total).toFixed(2), toNum(o.tipAmount).toFixed(2), o.tipPercent||0, o.status, payMethodLabel(o.paymentMethod)+' '+o.paymentStatus, `"${items}"`].join(',') }); const csv = [header.join(','),...rows].join('\n'); const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`narudzbe_${from||'pocetak'}_${to||'danas'}.csv`; a.click() }

  if(role==='RESTAURANT_ADMIN' || role==='SUPER_ADMIN'){
    const total = orders.reduce((s,o)=> s+toNum(o.total),0); const tips = orders.reduce((s,o)=> s+toNum(o.tipAmount),0); const withTip = orders.filter(o=> toNum(o.tipAmount)>0).length
    return (<main className="max-w-7xl mx-auto p-4"><h1 className="text-xl font-bold mb-3">Narudžbe & Napojnice</h1><div className="bg-white border rounded-xl p-3 mb-3 flex flex-wrap gap-2 items-end"><div><div className="text- text-neutral-500 mb-1">Od</div><input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="border rounded-lg px-3 h-8 text-sm"/></div><div><div className="text- text-neutral-500 mb-1">Do</div><input type="date" value={to} onChange={e=>setTo(e.target.value)} className="border rounded-lg px-3 h-8 text-sm"/></div><button onClick={()=>load(from,to)} className="bg-black text-white px-4 h-8 rounded-full text-xs">Filtriraj</button><button onClick={()=>{setFrom('');setTo('');load()}} className="border px-4 h-8 rounded-full text-xs">Reset</button><button onClick={exportCSV} className="bg-green-600 text-white px-4 h-8 rounded-full text-xs ml-auto">CSV</button></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3"><div className="bg-white border rounded-xl p-3"><div className="text- text-neutral-500">Narudžbi</div><div className="text-lg font-bold">{orders.length}</div></div><div className="bg-white border rounded-xl p-3"><div className="text- text-neutral-500">Promet</div><div className="text-lg font-bold">€{total.toFixed(2)}</div></div><div className="bg-amber-50 border border-amber-200 rounded-xl p-3"><div className="text- text-amber-800 font-bold">Napojnice</div><div className="text-lg font-bold text-amber-900">€{tips.toFixed(2)}</div></div><div className="bg-white border rounded-xl p-3"><div className="text- text-neutral-500">S napojnicom</div><div className="text-lg font-bold">{withTip} ({orders.length?((withTip/orders.length)*100).toFixed(0):0}%)</div></div></div>{loading? <div className="p-8 text-center text-sm">Učitavam...</div> : (<div className="bg-white border rounded-xl overflow-hidden"><div className="overflow-auto max-h-"><table className="w-full text-xs"><thead className="bg-zinc-50 text-left text- text-neutral-500 sticky top-0"><tr><th className="p-2">Datum</th><th className="p-2">Stol</th><th className="p-2">Status</th><th className="p-2">Plaćanje</th><th className="p-2">Iznos</th><th className="p-2">Napojnica</th><th className="p-2">Artikli</th></tr></thead><tbody>{orders.map((o:any)=>(<tr key={o.id} className="border-t border-black/5"><td className="p-2 whitespace-nowrap">{new Date(o.createdAt).toLocaleTimeString('hr-HR')}</td><td className="p-2 font-bold">#{o.table?.number}</td><td className="p-2"><span className="px-2 py-0.5 rounded-full bg-zinc-100 text-">{o.status}</span></td><td className="p-2"><span className={`px-2 py-0.5 rounded-full text- ${o.paymentStatus==='PAID'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{o.paymentStatus} • {payMethodLabel(o.paymentMethod)}</span></td><td className="p-2 font-bold">€{toNum(o.total).toFixed(2)}</td><td className="p-2">{toNum(o.tipAmount)>0? <span className="bg-amber-100 px-2 py-0.5 rounded-full font-bold text-">€{toNum(o.tipAmount).toFixed(2)}</span> : '-'}</td><td className="p-2 max-w- truncate">{o.items?.map((i:any)=> `${i.menuItem?.name} x${i.quantity}${i.note?' ('+i.note+')':''}`).join(', ')}</td></tr>))}</tbody></table></div></div>)}</main>)
  }
  if(role==='KITCHEN'){
    const pending = orders.filter((o:any)=> ['pending','new'].includes((o.status||'').toLowerCase())); const preparing = orders.filter((o:any)=> ['preparing','in_progress'].includes((o.status||'').toLowerCase())); const ready = orders.filter((o:any)=> ['ready'].includes((o.status||'').toLowerCase()))
    return (<main className="p-3"><div className="flex justify-between items-center mb-3"><h1 className="text-lg font-black">Kuhinja</h1><div className="text-xs text-neutral-500">{new Date().toLocaleTimeString('hr-HR')} • 3.5s</div></div><div className="flex gap-3 overflow-auto pb-4">
      <div className="flex-1 min-w-"><div className="p-2 font-bold text-xs uppercase bg-white rounded-t-xl border">Nove ({pending.length})</div><div className="space-y-2 p-2 bg-zinc-50 rounded-b-xl min-h- border border-t-0">{pending.map((o:any)=>{ const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime())/60000); return (<div key={o.id} className="bg-white border rounded-xl p-3"><div className="flex justify-between mb-2"><div className="text-2xl font-black">Stol {o.table?.number}</div><div className="text-xs px-2 py-1 rounded-full bg-zinc-100">{mins} min</div></div><div className="space-y-1">{o.items?.map((i:any)=>(<div key={i.id} className="text-sm"><span className="font-black">{i.quantity}x </span>{i.menuItem?.name}</div>))}</div><button onClick={()=>updateStatus(o.id,'preparing')} className="mt-3 w-full bg-black text-white h-10 rounded-xl text-sm font-bold">KRENI</button></div>)})}</div></div>
      <div className="flex-1 min-w-"><div className="p-2 font-bold text-xs uppercase bg-orange-50 rounded-t-xl border border-orange-200">U pripremi ({preparing.length})</div><div className="space-y-2 p-2 bg-zinc-50 rounded-b-xl min-h- border border-t-0">{preparing.map((o:any)=>{ const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime())/60000); return (<div key={o.id} className="bg-white border rounded-xl p-3"><div className="flex justify-between mb-2"><div className="text-2xl font-black">Stol {o.table?.number}</div><div className="text-xs px-2 py-1 rounded-full bg-zinc-100">{mins} min</div></div><div className="space-y-1">{o.items?.map((i:any)=>(<div key={i.id} className="text-sm"><span className="font-black">{i.quantity}x </span>{i.menuItem?.name}</div>))}</div><button onClick={()=>updateStatus(o.id,'ready')} className="mt-3 w-full bg-green-600 text-white h-12 rounded-xl text-base font-black">SPREMNO 🔔</button></div>)})}</div></div>
      <div className="flex-1 min-w-"><div className="p-2 font-bold text-xs uppercase bg-green-50 rounded-t-xl border border-green-200">Spremne ({ready.length})</div><div className="space-y-2 p-2 bg-zinc-50 rounded-b-xl min-h- border border-t-0">{ready.map((o:any)=> (<div key={o.id} className="bg-white border rounded-xl p-3 border-green-300"><div className="text-2xl font-black">Stol {o.table?.number}</div><div className="space-y-1 mt-2">{o.items?.map((i:any)=>(<div key={i.id} className="text-sm"><span className="font-black">{i.quantity}x </span>{i.menuItem?.name}</div>))}</div><div className="mt-3 w-full bg-green-50 border border-green-200 text-green-800 h-10 rounded-xl text-xs font-bold flex items-center justify-center">Čeka konobara...</div></div>))}</div></div>
    </div></main>)
  }
  const readyOrders = orders.filter((o:any)=> o.status.toLowerCase()==='ready')
  return (<main className="max-w-6xl mx-auto p-3">
    {!audioUnlocked && <div onClick={unlockAudio} className="bg-red-600 text-white rounded-xl p-3 mb-3 flex items-center justify-between cursor-pointer animate-pulse"><div className="font-black">🔊 KLIKNI ZA ZVUK + VIBRACIJU - obavezno jednom!</div><div className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold">AKTIVIRAJ</div></div>}
    <div className="flex justify-between items-center mb-3"><h1 className="text-lg font-bold">Uzivo narudzbe {audioUnlocked?'🔊':'(bez zvuka)'}</h1><div className="flex items-center gap-2"><span className="text-xs text-neutral-500">Auto 3.5s</span><button onClick={()=>{unlockAudio(); setTimeout(()=>beepLoud(),100)}} className={`px-4 h-8 rounded-full text-xs font-bold ${audioUnlocked?'bg-black text-white':'bg-red-600 text-white'}`}>TEST ZVUK + VIBRACIJA</button></div></div>
    {readyOrders.length>0 && <div className="bg-green-600 text-white rounded-xl p-4 mb-3 flex items-center justify-between animate-pulse"><div className="font-black text-lg">🔔 {readyOrders.length} SPREMNO: {readyOrders.map((o:any)=>'Stol '+o.table?.number).join(', ')}</div><button onClick={()=>beepLoud()} className="bg-white text-green-700 px-3 py-1 rounded-full text-xs font-bold">BEEP</button></div>}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{orders.slice(0,100).map((o:any)=>{ const isReady = o.status.toLowerCase()==='ready'; const isPaid = o.paymentStatus==='PAID'; return (<div key={o.id} className={`bg-white border rounded-xl p-3 ${isReady?'border-green-500 ring-2 ring-green-200 animate-pulse':''}`}><div className="flex justify-between items-start mb-2"><div className="text-xl font-black">Stol {o.table?.number}</div><div className="flex flex-col items-end gap-1"><span className={`text- px-2 py-0.5 rounded-full font-bold uppercase ${o.status==='pending'?'bg-zinc-900 text-white': o.status==='preparing'?'bg-orange-100 text-orange-800': o.status==='ready'?'bg-green-600 text-white':'bg-zinc-100'}`}>{o.status}</span><span className={`text- px-2 py-0.5 rounded-full font-bold ${isPaid?'bg-green-50 text-green-700 border border-green-200':'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>{isPaid?'PLACENO':'NIJE PLACENO'} • {payMethodLabel(o.paymentMethod)}</span></div></div><div className="text-xs text-neutral-500 mb-2">{new Date(o.createdAt).toLocaleTimeString('hr-HR')} • {Math.floor((Date.now()-new Date(o.createdAt).getTime())/60000)} min</div><div className="space-y-1.5 mb-3">{o.items?.map((i:any)=>(<div key={i.id} className="flex justify-between text-sm"><span>{i.quantity}x {i.menuItem?.name}</span>{i.note && <span className="text-xs text-amber-700 bg-amber-50 px-1.5 rounded">! {i.note}</span>}</div>))}</div><div className="flex gap-2">{o.status.toLowerCase()==='ready' && <button onClick={()=>updateStatus(o.id,'served')} className="flex-1 bg-black text-white h-9 rounded-xl text-xs font-bold">POSLUZENO</button>}{o.status.toLowerCase()==='pending' && <button onClick={()=>updateStatus(o.id,'preparing')} className="flex-1 border h-9 rounded-xl text-xs">Kuhinji</button>}<button onClick={()=>{const m=prompt('Nacin: CASH/POS/ONLINE', o.paymentMethod); if(m){ fetch(`/api/admin/orders/${o.id}/pay`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({paymentMethod:m})}).then(()=>load()) } }} className="px-3 h-9 border rounded-xl text-xs">{payMethodLabel(o.paymentMethod)}</button></div></div>)})}</div></main>)
}
