"use client"
import { useEffect, useState } from 'react'

export default function AdminPage(){
  const [data,setData]=useState<any>(null)
  const [orders,setOrders]=useState<any[]>([])
  const [stats,setStats]=useState({ today:0, todayTip:0, weekTip:0, monthTip:0, totalTip:0, todayOrders:0, totalWithTip:0 })
  
  useEffect(()=>{ 
    fetch('/api/admin/me').then(r=>r.json()).then(setData)
    fetch('/api/admin/orders').then(r=>r.json()).then(d=>{
      const ords = d.orders||[]
      setOrders(ords)
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate()-6); startOfWeek.setHours(0,0,0,0)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const todayOrders = ords.filter((o:any)=> new Date(o.createdAt) >= startOfDay)
      const weekOrders = ords.filter((o:any)=> new Date(o.createdAt) >= startOfWeek)
      const monthOrders = ords.filter((o:any)=> new Date(o.createdAt) >= startOfMonth)
      
      const toNum = (v:any)=> Number(v||0)
      const todayTip = todayOrders.reduce((s:any,o:any)=> s + toNum(o.tipAmount), 0)
      const weekTip = weekOrders.reduce((s:any,o:any)=> s + toNum(o.tipAmount), 0)
      const monthTip = monthOrders.reduce((s:any,o:any)=> s + toNum(o.tipAmount), 0)
      const totalTip = ords.reduce((s:any,o:any)=> s + toNum(o.tipAmount), 0)
      const todayTotal = todayOrders.reduce((s:any,o:any)=> s + toNum(o.total), 0)
      const totalWithTip = ords.filter((o:any)=> toNum(o.tipAmount)>0).length
      
      setStats({ today: todayTotal, todayTip, weekTip, monthTip, totalTip, todayOrders: todayOrders.length, totalWithTip })
    })
  },[])
  
  async function logout(){ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login' }
  if(!data) return <div className="p-10">Učitavam...</div>
  if(data.error) return <div className="p-10">{data.error} <button onClick={logout} className="underline">Odjava</button></div>
  if(!data.restaurant) return <div className="p-10">Nema restorana. Ti si {data.role} - idi na <a href="/superadmin" className="underline">/superadmin</a> <button onClick={logout} className="ml-4 border px-3 py-1 rounded-full">Odjava</button></div>
  const r = data.restaurant
  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-start mb-6">
        <div>{data.impersonate&&<div className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm mb-4 inline-block">Super Admin mod - gledaš kao {r.name} <a href="/api/superadmin/impersonate?clear=1" className="underline ml-2 font-bold">Izađi</a></div>}<h1 className="text-4xl font-black mb-2">{r.name}</h1><p className="text-neutral-600">Slug: {r.slug} • Stolova: {r.tables?.length || 0} • Korisnika: {r.users?.length || 0}</p></div>
        <button onClick={logout} className="border border-black px-5 py-2.5 rounded-full text-sm">Odjava</button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Narudžbe danas</div><div className="text-3xl font-bold mt-2">{stats.todayOrders}</div><div className="text-xs text-neutral-400 mt-1">Ukupno danas</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Promet danas</div><div className="text-3xl font-bold mt-2">€{stats.today.toFixed(2)}</div><div className="text-xs text-neutral-400 mt-1">S napojnicama</div></div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6"><div className="text-sm text-amber-800 font-bold">💰 Napojnice danas</div><div className="text-3xl font-bold mt-2 text-amber-900">€{stats.todayTip.toFixed(2)}</div><div className="text-xs text-amber-700 mt-1">{stats.todayTip===0 ? `Ukupno zadnjih 100: €${stats.totalTip.toFixed(2)}` : 'Za podijeliti radnicima'}</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Artikala</div><div className="text-3xl font-bold mt-2">{r._count?.items || 0}</div></div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 text-white rounded-2xl p-6"><div className="text-sm text-zinc-400">Tjedan napojnice</div><div className="text-2xl font-bold mt-2">€{stats.weekTip.toFixed(2)}</div></div>
        <div className="bg-zinc-900 text-white rounded-2xl p-6"><div className="text-sm text-zinc-400">Mjesec napojnice</div><div className="text-2xl font-bold mt-2">€{stats.monthTip.toFixed(2)}</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Ukupno (100 zadnjih)</div><div className="text-2xl font-bold mt-2">€{stats.totalTip.toFixed(2)}</div><div className="text-xs text-neutral-400 mt-1">{stats.totalWithTip} narudžbi s napojnicom</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">% ostavlja napojnicu</div><div className="text-2xl font-bold mt-2">{orders.length>0 ? ((stats.totalWithTip / orders.length)*100).toFixed(0) : 0}%</div><div className="text-xs text-neutral-400 mt-1">od zadnjih {orders.length}</div></div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <a href={`/menu/${r.slug}`} target="_blank" className="bg-black text-white px-6 py-3 rounded-full">Vidi meni</a>
        <a href="/admin/orders" className="bg-black text-white px-6 py-3 rounded-full">Narudžbe sa napojnicama</a>
        <a href="/admin/menu" className="border border-black px-6 py-3 rounded-full">Meni (HR/EN/DE)</a>
        <a href="/admin/qr" className="border border-black px-6 py-3 rounded-full">QR kodovi</a>
      </div>
    </main>
  )
}
