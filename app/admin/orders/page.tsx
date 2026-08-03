"use client"
import { useEffect, useState } from 'react'

export default function OrdersPage(){
  const [orders,setOrders]=useState<any[]>([])
  const [from,setFrom]=useState('')
  const [to,setTo]=useState('')
  const [loading,setLoading]=useState(true)

  async function load(f?:string,t?:string){
    setLoading(true)
    const p = new URLSearchParams()
    if(f) p.set('from', f)
    if(t) p.set('to', t)
    if(f||t) p.set('all','1')
    const res = await fetch('/api/admin/orders?'+p.toString())
    const d = await res.json()
    setOrders(d.orders||[])
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  const toNum = (v:any)=> Number(v||0)
  const total = orders.reduce((s,o)=> s+toNum(o.total),0)
  const tips = orders.reduce((s,o)=> s+toNum(o.tipAmount),0)
  const withTip = orders.filter(o=> toNum(o.tipAmount)>0).length

  function exportCSV(){
    const header = ['Datum','Stol','Ukupno','Napojnica','%','Artikli']
    const rows = orders.map((o:any)=>{
      const date = new Date(o.createdAt).toLocaleString('hr-HR')
      const items = o.items?.map((i:any)=> `${i.menuItem?.name||'Artikal'} x${i.quantity}`).join(' | ')
      return [date, o.table?.number||'', toNum(o.total).toFixed(2), toNum(o.tipAmount).toFixed(2), o.tipPercent||0, `"${items}"`].join(',')
    })
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download=`narudzbe_${from||'pocetak'}_${to||'danas'}.csv`; a.click()
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-black mb-6">Narudžbe & Napojnice</h1>
      
      <div className="bg-white border rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-end">
        <div><div className="text-xs text-neutral-500 mb-1">Od datuma</div><input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="border rounded-xl px-4 py-2"/></div>
        <div><div className="text-xs text-neutral-500 mb-1">Do datuma</div><input type="date" value={to} onChange={e=>setTo(e.target.value)} className="border rounded-xl px-4 py-2"/></div>
        <button onClick={()=>load(from,to)} className="bg-black text-white px-5 py-2.5 rounded-full text-sm">Filtriraj</button>
        <button onClick={()=>{setFrom('');setTo('');load()}} className="border border-black px-5 py-2.5 rounded-full text-sm">Reset (zadnjih 500)</button>
        <button onClick={exportCSV} className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm ml-auto">⬇️ Export Excel (CSV)</button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-2xl p-5"><div className="text-xs text-neutral-500">Broj narudžbi</div><div className="text-2xl font-bold">{orders.length}</div></div>
        <div className="bg-white border rounded-2xl p-5"><div className="text-xs text-neutral-500">Ukupan promet</div><div className="text-2xl font-bold">€{total.toFixed(2)}</div></div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5"><div className="text-xs text-amber-800 font-bold">Ukupno napojnice</div><div className="text-2xl font-bold text-amber-900">€{tips.toFixed(2)}</div></div>
        <div className="bg-white border rounded-2xl p-5"><div className="text-xs text-neutral-500">S napojnicom</div><div className="text-2xl font-bold">{withTip} ({orders.length?((withTip/orders.length)*100).toFixed(0):0}%)</div></div>
      </div>

      {loading ? <div className="p-10 text-center">Učitavam...</div> : (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs text-neutral-500"><tr><th className="p-3">Datum</th><th className="p-3">Stol</th><th className="p-3">Iznos</th><th className="p-3">Napojnica</th><th className="p-3">%</th><th className="p-3">Artikli</th></tr></thead>
              <tbody>
                {orders.map((o:any)=>(
                  <tr key={o.id} className="border-t border-black/5">
                    <td className="p-3 whitespace-nowrap">{new Date(o.createdAt).toLocaleString('hr-HR')}</td>
                    <td className="p-3">{o.table?.number}</td>
                    <td className="p-3 font-bold">€{toNum(o.total).toFixed(2)}</td>
                    <td className="p-3">{toNum(o.tipAmount)>0 ? <span className="bg-amber-100 text-amber-900 px-2 py-1 rounded-full font-bold text-xs">€{toNum(o.tipAmount).toFixed(2)}</span> : <span className="text-neutral-400">-</span>}</td>
                    <td className="p-3">{o.tipPercent||0}%</td>
                    <td className="p-3 text-xs text-neutral-600 max-w- truncate">{o.items?.map((i:any)=> `${i.menuItem?.name} x${i.quantity}`).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
