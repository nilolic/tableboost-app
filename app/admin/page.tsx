"use client"
import { useEffect, useState } from 'react'
export default function AdminPage(){
  const [data,setData]=useState<any>(null)
  useEffect(()=>{ fetch('/api/admin/me').then(r=>r.json()).then(setData) },[])
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
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Konobari</div><div className="text-3xl font-bold mt-2">{r.users?.filter((u:any)=>u.role==='WAITER').length || 0}</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Kuhinja</div><div className="text-3xl font-bold mt-2">{r.users?.filter((u:any)=>u.role==='KITCHEN').length || 0}</div></div>
        <div className="bg-white border rounded-2xl p-6"><div className="text-sm text-neutral-500">Artikala</div><div className="text-3xl font-bold mt-2">{r._count?.items || 0}</div></div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <a href={`/menu/${r.slug}`} target="_blank" className="bg-black text-white px-6 py-3 rounded-full">Vidi meni</a>
        <a href="/admin/menu" className="bg-black text-white px-6 py-3 rounded-full">Meni (HR/EN/DE)</a>
        <a href="/admin/qr" className="border border-black px-6 py-3 rounded-full">QR kodovi</a>
      </div>
    </main>
  )
}
