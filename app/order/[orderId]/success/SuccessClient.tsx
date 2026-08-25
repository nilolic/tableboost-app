'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

export default function SuccessClient({ order: initialOrder }: { order:any }) {
  const [order, setOrder] = useState(initialOrder)
  const [isReady, setIsReady] = useState(initialOrder.status === 'ready')
  const [hasNotified, setHasNotified] = useState(false)
  const audioRef = useRef<any>(null)

  useEffect(()=>{
    const unlock = () => {
      try{
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext
        if(AC &&!audioRef.current) audioRef.current = new AC()
        if(audioRef.current?.state==='suspended') audioRef.current.resume()
      }catch{}
    }
    document.addEventListener('click', unlock)
    document.addEventListener('touchstart', unlock)
    return ()=>{ document.removeEventListener('click', unlock); document.removeEventListener('touchstart', unlock) }
  },[])

  const beepLoud = ()=>{
    try{
      if((navigator as any).vibrate) (navigator as any).vibrate([400,100,800,100,400,100,800])
      const ctx = audioRef.current
      if(!ctx) return
      const play = (freq:number, delay:number)=>{
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.frequency.value = freq
        o.type='square'
        o.connect(g); g.connect(ctx.destination)
        g.gain.setValueAtTime(0, ctx.currentTime+delay)
        g.gain.linearRampToValueAtTime(1.2, ctx.currentTime+delay+0.02)
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+delay+0.6)
        o.start(ctx.currentTime+delay); o.stop(ctx.currentTime+delay+0.6)
      }
      play(1200,0); play(1500,0.3); play(1200,0.6)
    }catch{}
  }

  useEffect(()=>{
    if(order.status==='ready' || order.status==='served' || order.status==='cancelled') return
    const iv = setInterval(async()=>{
      try{
        const res = await fetch(`/api/public/order/${order.id}`)
        if(!res.ok) return
        const data = await res.json()
        setOrder((prev:any)=>({...prev, status: data.status}))
        if(data.status==='ready' &&!hasNotified){
          setIsReady(true)
          setHasNotified(true)
          beepLoud()
          setTimeout(beepLoud, 1500)
          if("Notification" in window){
            if(Notification.permission==='granted'){
              new Notification("🔔 Jelo spremno!", { body: `Stol ${order.table?.number} - preuzmite na šanku!` })
            } else if(Notification.permission!=='denied'){
              Notification.requestPermission().then(p=>{ if(p==='granted') new Notification("🔔 Jelo spremno!", { body: `Stol ${order.table?.number} - preuzmite na šanku!` }) })
            }
          }
        }
      }catch{}
    }, 3000)
    return ()=>clearInterval(iv)
  },[order.id, hasNotified])

  const isBar = order.restaurant?.serviceMode==='BAR'

  return (
    <div className="min-h-screen bg-[#fdf8f3] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded- shadow-xl border border-zinc-100 p-8 text-center">
        {isReady? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-500 text-white grid place-items-center text-4xl mx-auto mb-4 animate-bounce">🔔</div>
            <h1 className="text-3xl font-black tracking-tight text-green-600">JELO SPREMNO!</h1>
            <p className="text-sm text-zinc-600 mt-2 font-bold">{isBar? 'Preuzmite na šanku 🛎' : `Stol ${order.table?.number} - konobar dolazi`}</p>
            <div className="mt-4 bg-green-50 border-2 border-green-500 rounded-2xl p-4 text-green-800 font-black animate-pulse text-lg">
              {isBar? 'Vaša narudžba je spremna za preuzimanje na šanku!' : 'Vaša narudžba je spremna!'}
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full grid place-items-center text-2xl mx-auto mb-4 bg-orange-100 text-orange-600 animate-pulse">◷</div>
            <h1 className="text-2xl font-black tracking-tight">Narudžba zaprimljena!</h1>
            <p className="text-sm text-zinc-500 mt-2">{order.restaurant.name} • Stol {order.table.number}</p>
            <div className="mt-4 rounded-2xl p-3 text-sm font-bold bg-amber-100 text-amber-900 border-2 border-black">
              🔔 Ostanite na ovoj stranici<br/><span className="font-medium">Obavijest + zvuk + vibracija kad je jelo gotovo</span>
            </div>
            <p className="text- text-zinc-400 mt-2">Status: <b className="uppercase animate-pulse">{order.status}</b> • provjera svake 3s</p>
          </>
        )}
        <div className="mt-6 bg-zinc-50 rounded-2xl p-4 text-left text-sm space-y-2">
          {order.items.map((i:any)=>(
            <div key={i.id} className="flex justify-between gap-2"><span className="flex-1">{i.menuItem.name} x{i.quantity}</span><span className="font-bold">{(i.price*i.quantity).toFixed(2)}€</span></div>
          ))}
          <div className="border-t pt-2 flex justify-between font-black"><span>Ukupno</span><span>{order.total.toFixed(2)}€</span></div>
          <div className="text- text-zinc-500 pt-1">ID: {order.id.slice(0,8)} • {new Date().toLocaleTimeString('hr-HR')}</div>
        </div>
        <Link href={`/menu/${order.restaurant.slug}?table=${order.table.number}`} className="mt-6 block w-full bg-black text-white py-3.5 rounded-full font-bold text-sm">Nazad na meni</Link>
        <p className="text- text-zinc-400 mt-3">🔔 Ne zatvarajte stranicu - stiže zvuk i vibracija kad je spremno</p>
      </div>
    </div>
  )
}
