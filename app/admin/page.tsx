"use client"
import { useEffect, useState } from 'react'
export default function AdminPage(){
  const [data,setData]=useState<any>(null)
  const [orders,setOrders]=useState<any[]>([])
  const [stats,setStats]=useState({ today:0, todayTip:0, weekTip:0, monthTip:0, totalTip:0, todayOrders:0, totalWithTip:0 })
  useEffect(()=>{
    fetch('/api/admin/me').then(r=>r.json()).then(d=>{setData(d); if(d?.role === 'WAITER' || d?.role === 'KITCHEN'){ window.location.href='/admin/orders' }})
    fetch('/api/admin/orders').then(r=>r.json()).then(d=>{
      const ords = d.orders||[]; setOrders(ords)
      const now = new Date(); const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate()-6); startOfWeek.setHours(0,0,0,0)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const todayOrders = ords.filter((o:any)=> new Date(o.createdAt) >= startOfDay)
      const weekOrders = ords.filter((o:any)=> new Date(o.createdAt) >= startOfWeek)
      const monthOrders = ords.filter((o:any)=> new Date(o.createdAt) >= startOfMonth)
      const toNum = (v:any)=> Number(v||0)
      setStats({ today: todayOrders.reduce((s:any,o:any)=> s + toNum(o.total),0), todayTip: todayOrders.reduce((s:any,o:any)=> s + toNum(o.tipAmount),0), weekTip: weekOrders.reduce((s:any,o:any)=> s + toNum(o.tipAmount),0), monthTip: monthOrders.reduce((s:any,o:any)=> s + toNum(o.tipAmount),0), totalTip: ords.reduce((s:any,o:any)=> s + toNum(o.tipAmount),0), todayOrders: todayOrders.length, totalWithTip: ords.filter((o:any)=> toNum(o.tipAmount)>0).length })
    })
  },[])
  async function logout(){ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login' }
  if(!data) return <div className="p-4 text-sm">Učitavam...</div>
  if(data.error) return <div className="p-4">{data.error} <button onClick={logout} className="underline">Odjava</button></div>
  if(!data.restaurant) return <div className="p-4">Nema restorana.</div>
  const r = data.restaurant
  return (
    <main className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4"><div><h1 className="text-xl font-bold">{r.name}</h1><p className="text-xs text-neutral-500">Slug: {r.slug} • Stolova: {r.tables?.length || 0}</p></div><button onClick={logout} className="border border-black px-4 h-8 rounded-full text-xs">Odjava</button></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white border rounded-xl p-4"><div className="text- uppercase tracking-wider text-neutral-500">Narudžbe danas</div><div className="text-xl font-bold mt-1">{stats.todayOrders}</div></div>
        <div className="bg-white border rounded-xl p-4"><div className="text- uppercase tracking-wider text-neutral-500">Promet danas</div><div className="text-xl font-bold mt-1">€{stats.today.toFixed(2)}</div></div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><div className="text- uppercase tracking-wider text-amber-800 font-bold">💰 Napojnice danas</div><div className="text-xl font-bold mt-1 text-amber-900">€{stats.todayTip.toFixed(2)}</div></div>
        <div className="bg-white border rounded-xl p-4"><div className="text- uppercase tracking-wider text-neutral-500">Artikala</div><div className="text-xl font-bold mt-1">{r._count?.items || 0}</div></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-zinc-900 text-white rounded-xl p-4"><div className="text- text-zinc-400">Tjedan napojnice</div><div className="text-lg font-bold mt-1">€{stats.weekTip.toFixed(2)}</div></div>
        <div className="bg-zinc-900 text-white rounded-xl p-4"><div className="text- text-zinc-400">Mjesec napojnice</div><div className="text-lg font-bold mt-1">€{stats.monthTip.toFixed(2)}</div></div>
        <div className="bg-white border rounded-xl p-4"><div className="text- text-neutral-500">Ukupno (100 zadnjih)</div><div className="text-lg font-bold mt-1">€{stats.totalTip.toFixed(2)}</div></div>
        <div className="bg-white border rounded-xl p-4"><div className="text- text-neutral-500">% ostavlja napojnicu</div><div className="text-lg font-bold mt-1">{orders.length>0? ((stats.totalWithTip / orders.length)*100).toFixed(0) : 0}%</div></div>
      </div>
      <div className="flex gap-2 flex-wrap"><a href={`/menu/${r.slug}`} target="_blank" className="bg-black text-white px-4 h-8 rounded-full text-xs flex items-center">Vidi meni</a><a href="/admin/orders" className="bg-black text-white px-4 h-8 rounded-full text-xs flex items-center">Narudžbe</a><a href="/admin/items" className="border border-black px-4 h-8 rounded-full text-xs flex items-center">Artikli</a><a href="/admin/qr" className="border border-black px-4 h-8 rounded-full text-xs flex items-center">QR kodovi</a></div>
    </main>
  )
}
