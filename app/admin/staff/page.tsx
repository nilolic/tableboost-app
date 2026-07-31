"use client"
import { useEffect, useState } from 'react'

type Staff = { id:string; email:string; name:string|null; role:'WAITER'|'KITCHEN'; createdAt:string }

export default function StaffPage(){
  const [staff,setStaff]=useState<Staff[]>([])
  const [loading,setLoading]=useState(true)
  const [showAdd,setShowAdd]=useState(false)
  const [form,setForm]=useState({ email:'', password:'', name:'', role:'WAITER' as 'WAITER'|'KITCHEN' })
  const [err,setErr]=useState('')
  const [resetId,setResetId]=useState<string|null>(null)
  const [newPass,setNewPass]=useState('')

  const load = async()=>{
    setLoading(true)
    const res = await fetch('/api/admin/staff')
    const data = await res.json()
    if(data.staff) setStaff(data.staff)
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  const create = async()=>{
    setErr('')
    const res = await fetch('/api/admin/staff',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)})
    const d = await res.json()
    if(!res.ok){ setErr(d.error||'Greška'); return }
    setShowAdd(false)
    setForm({ email:'', password:'', name:'', role:'WAITER' })
    load()
  }

  const del = async(id:string)=>{
    if(!confirm('Obrisati korisnika?')) return
    await fetch(`/api/admin/staff/${id}`,{method:'DELETE'})
    load()
  }

  const resetPass = async()=>{
    if(!resetId || newPass.length < 6){ alert('Min 6 znakova'); return }
    await fetch(`/api/admin/staff/${resetId}`,{method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({password:newPass})})
    setResetId(null); setNewPass('')
  }

  if(loading) return <div className="p-10 text-sm text-zinc-500">Učitavam osoblje...</div>

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text- font-[700] tracking-[-0.03em]">Osoblje</h1>
          <p className="text- text-zinc-500 mt-1">Konobari i kuhinja - imaju pregled narudžbi, ne mogu mijenjati meni</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin" className="bg-white border border-zinc-200 px-4 py-2 rounded-full text-">← Nazad</a>
          <button onClick={()=>setShowAdd(true)} className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text- font-medium">+ Dodaj osoblje</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-zinc-200 rounded- p-4"><div className="text- uppercase text-zinc-500">Konobari</div><div className="text- font-[700]">{staff.filter(s=>s.role==='WAITER').length}</div><div className="text- text-zinc-400">Pristup: narudžbe + stolovi</div></div>
        <div className="bg-white border border-zinc-200 rounded- p-4"><div className="text- uppercase text-zinc-500">Kuhinja</div><div className="text- font-[700]">{staff.filter(s=>s.role==='KITCHEN').length}</div><div className="text- text-zinc-400">KDS: samo narudžbe</div></div>
        <div className="bg-white border border-zinc-200 rounded- p-4"><div className="text- uppercase text-zinc-500">Login link</div><div className="text- font-mono mt-1">/login?r=slug</div><div className="text- text-zinc-400">Isti link za sve</div></div>
      </div>

      <div className="bg-white border border-zinc-200 rounded- overflow-hidden">
        <table className="w-full text-">
          <thead className="bg-zinc-50 text- uppercase text-zinc-500"><tr><th className="text-left p-3">Ime / Email</th><th className="text-left p-3">Rola</th><th className="text-left p-3">Kreiran</th><th className="text-right p-3">Akcije</th></tr></thead>
          <tbody>
            {staff.map(s=>(
              <tr key={s.id} className="border-t border-zinc-100">
                <td className="p-3"><div className="font-medium">{s.name||'—'}</div><div className="text- text-zinc-500">{s.email}</div></td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text- font-bold ${s.role==='WAITER'?'bg-blue-100 text-blue-700':'bg-orange-100 text-orange-700'}`}>{s.role==='WAITER'?'KONOBAR':'KUHINJA'}</span></td>
                <td className="p-3 text- text-zinc-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right flex gap-1 justify-end">
                  <button onClick={()=>setResetId(s.id)} className="px-3 py-1.5 bg-zinc-100 rounded-full text-">Lozinka</button>
                  <button onClick={()=>del(s.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-">Obriši</button>
                </td>
              </tr>
            ))}
            {staff.length===0 && <tr><td colSpan={4} className="p-10 text-center text-zinc-400">Nema osoblja. Dodaj konobara ili kuhinju.</td></tr>}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded- p-6 w-full max-w-sm">
            <h2 className="font-bold text- mb-4">Novo osoblje</h2>
            <div className="space-y-3">
              <select value={form.role} onChange={e=>setForm({...form, role:e.target.value as any})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-">
                <option value="WAITER">Konobar - vidi narudžbe i stolove</option>
                <option value="KITCHEN">Kuhinja - KDS (samo narudžbe)</option>
              </select>
              <input placeholder="Ime (npr. Marko)" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-"/>
              <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-"/>
              <input placeholder="Lozinka (min 6)" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-"/>
              {err && <div className="text- text-red-600 bg-red-50 p-2 rounded">{err}</div>}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>setShowAdd(false)} className="flex-1 bg-zinc-100 py-3 rounded-xl text-">Odustani</button>
              <button onClick={create} className="flex-1 bg-zinc-900 text-white py-3 rounded-xl text- font-bold">Kreiraj</button>
            </div>
            <p className="text- text-zinc-400 mt-3">Login: isti /login?r=vas-slug sa emailom i lozinkom</p>
          </div>
        </div>
      )}

      {resetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded- p-6 w-full max-w-sm">
            <h2 className="font-bold mb-3">Nova lozinka</h2>
            <input placeholder="Nova lozinka" value={newPass} onChange={e=>setNewPass(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 mb-4 text-"/>
            <div className="flex gap-2">
              <button onClick={()=>setResetId(null)} className="flex-1 bg-zinc-100 py-3 rounded-xl text-">Odustani</button>
              <button onClick={resetPass} className="flex-1 bg-zinc-900 text-white py-3 rounded-xl text- font-bold">Spremi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
