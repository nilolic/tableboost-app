"use client"
import { useState } from 'react'
import { MoreVertical, Plus, Store, Users, Search, Eye, LogIn, Trash2, KeyRound, QrCode } from 'lucide-react'

export default function SuperAdminClient({ restaurants, users, currentUser }: any) {
  const [tab, setTab] = useState<'restaurants'|'users'>('restaurants')
  const [open, setOpen] = useState<string|null>(null)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name:'', slug:'', ownerName:'', ownerEmail:'', ownerPass:'' })
  const [resetId, setResetId] = useState<string|null>(null)
  const [newPass, setNewPass] = useState('')

  const fr = restaurants.filter((r:any)=> r.name.toLowerCase().includes(search.toLowerCase()) || r.slug.includes(search.toLowerCase()))
  const fu = users.filter((u:any)=> u.email.toLowerCase().includes(search.toLowerCase()) || (u.name||'').toLowerCase().includes(search.toLowerCase()))

  async function createRestaurant(){
    const res = await fetch('/api/superadmin/restaurants',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const d = await res.json()
    if(!res.ok) return alert(d.error)
    location.reload()
  }
  async function deleteRestaurant(id:string){
    if(!confirm('Obrisati restoran + sve korisnike, stolove i narudzbe?')) return
    const res = await fetch(`/api/superadmin/restaurants/${id}`,{method:'DELETE'})
    const d = await res.json().catch(()=>({}))
    if(!res.ok) return alert(d.error||'greska')
    location.reload()
  }
  async function resetPass(){
    if(!resetId) return
    const res = await fetch(`/api/superadmin/users/${resetId}/reset-password`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({newPassword:newPass})})
    const d = await res.json()
    if(!res.ok) return alert(d.error)
    alert('Lozinka promijenjena'); setResetId(null); setNewPass('')
  }
  async function deleteUser(id:string){
    if(!confirm('Obrisati korisnika?')) return
    const res = await fetch(`/api/superadmin/users/${id}`,{method:'DELETE'})
    if(!res.ok){ const d=await res.json(); return alert(d.error)}
    location.reload()
  }
  async function impersonate(rid:string){
    await fetch('/api/superadmin/impersonate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({restaurantId:rid})})
    window.location.href='/admin'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-black">Super Admin</h1><p className="text-zinc-400 text-sm mt-1">{currentUser.email} • {restaurants.length} restorana • {users.length} korisnika</p></div>
          <button onClick={()=>setShowCreate(true)} className="bg-white text-black px-5 py-2.5 rounded-full font-bold flex gap-2"><Plus size={18}/> Novi restoran + vlasnik</button>
        </div>
        <div className="flex gap-2 mb-6">
          <button onClick={()=>setTab('restaurants')} className={`px-5 py-2.5 rounded-full flex gap-2 ${tab==='restaurants'?'bg-white text-black':'bg-zinc-900 border border-zinc-800'}`}><Store size={16}/> Restorani</button>
          <button onClick={()=>setTab('users')} className={`px-5 py-2.5 rounded-full flex gap-2 ${tab==='users'?'bg-white text-black':'bg-zinc-900 border border-zinc-800'}`}><Users size={16}/> Korisnici</button>
        </div>
        <div className="relative mb-6 max-w-sm"><Search className="absolute left-3 top-3 text-zinc-500" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Traži ime, email, slug..." className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-sm"/></div>

        {tab==='restaurants' ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm"><thead className="bg-zinc-900 text-zinc-400 text-xs uppercase"><tr><th className="text-left p-4">Restoran</th><th className="text-left p-4">Vlasnik</th><th className="text-left p-4">Osoblje</th><th className="text-left p-4">Stolovi</th><th className="text-right p-4">Akcije</th></tr></thead>
              <tbody>{fr.map((r:any)=>{const admin=r.users.find((u:any)=>u.role==='RESTAURANT_ADMIN');return(<tr key={r.id} className="border-t border-zinc-800 hover:bg-zinc-900/50"><td className="p-4"><div className="font-bold">{r.name}</div><div className="text-xs text-zinc-500">{r.slug}</div></td><td className="p-4 text-xs">{admin?admin.email:<span className="text-red-400">nema</span>}</td><td className="p-4 text-xs"><span className="bg-zinc-800 px-2 py-1 rounded-full mr-1">A:{r.users.filter((u:any)=>u.role==='RESTAURANT_ADMIN').length}</span><span className="bg-zinc-800 px-2 py-1 rounded-full mr-1">K:{r.users.filter((u:any)=>u.role==='WAITER').length}</span><span className="bg-zinc-800 px-2 py-1 rounded-full">Ku:{r.users.filter((u:any)=>u.role==='KITCHEN').length}</span></td><td className="p-4">{r.tables.length}</td><td className="p-4"><div className="flex justify-end relative"><button onClick={()=>setOpen(open===r.id?null:r.id)} className="p-2 hover:bg-zinc-800 rounded-full"><MoreVertical size={18}/></button>{open===r.id&&(<div className="absolute right-0 top-10 w-56 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl z-20"><button onClick={()=>window.open(`/menu/${r.slug}`,'_blank')} className="w-full text-left px-4 py-2.5 hover:bg-zinc-700 flex gap-2 text-sm"><Eye size={16}/> Vidi meni</button><button onClick={()=>impersonate(r.id)} className="w-full text-left px-4 py-2.5 hover:bg-zinc-700 flex gap-2 text-sm"><LogIn size={16}/> Uđi kao vlasnik</button><button onClick={()=>{setTab('users');setSearch(r.slug);setOpen(null)}} className="w-full text-left px-4 py-2.5 hover:bg-zinc-700 flex gap-2 text-sm"><Users size={16}/> Osoblje</button><button onClick={()=>window.open(`/admin/qr?r=${r.slug}`,'_blank')} className="w-full text-left px-4 py-2.5 hover:bg-zinc-700 flex gap-2 text-sm"><QrCode size={16}/> QR kodovi</button><div className="border-t border-zinc-700"></div><button onClick={()=>deleteRestaurant(r.id)} className="w-full text-left px-4 py-2.5 hover:bg-red-900/30 text-red-400 flex gap-2 text-sm"><Trash2 size={16}/> Obriši restoran</button></div>)}</div></td></tr>)})}</tbody></table>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm"><thead className="bg-zinc-900 text-zinc-400 text-xs uppercase"><tr><th className="text-left p-4">Korisnik</th><th className="text-left p-4">Rola</th><th className="text-left p-4">Restoran</th><th className="text-right p-4">Akcije</th></tr></thead>
              <tbody>{fu.map((u:any)=>(<tr key={u.id} className="border-t border-zinc-800 hover:bg-zinc-900/50"><td className="p-4"><div className="font-medium">{u.name||'—'}</div><div className="text-xs text-zinc-400">{u.email}</div></td><td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${u.role==='SUPER_ADMIN'?'bg-purple-900 text-purple-200':u.role==='RESTAURANT_ADMIN'?'bg-blue-900 text-blue-200':u.role==='WAITER'?'bg-green-900 text-green-200':'bg-orange-900 text-orange-200'}`}>{u.role}</span></td><td className="p-4 text-xs">{u.restaurant?.name||'—'}</td><td className="p-4"><div className="flex justify-end relative"><button onClick={()=>setOpen(open===u.id?null:u.id)} className="p-2 hover:bg-zinc-800 rounded-full"><MoreVertical size={18}/></button>{open===u.id&&(<div className="absolute right-0 top-10 w-56 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl z-20"><button onClick={()=>{setResetId(u.id);setOpen(null)}} className="w-full text-left px-4 py-2.5 hover:bg-zinc-700 flex gap-2 text-sm"><KeyRound size={16}/> Reset lozinke</button>{u.restaurantId&&<button onClick={()=>impersonate(u.restaurantId)} className="w-full text-left px-4 py-2.5 hover:bg-zinc-700 flex gap-2 text-sm"><LogIn size={16}/> Uđi u restoran</button>}<div className="border-t border-zinc-700"></div><button onClick={()=>deleteUser(u.id)} className="w-full text-left px-4 py-2.5 hover:bg-red-900/30 text-red-400 flex gap-2 text-sm"><Trash2 size={16}/> Obriši</button></div>)}</div></td></tr>))}</tbody></table>
          </div>
        )}

        {showCreate&&(<div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50 p-4"><div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg"><h2 className="text-xl font-bold mb-4">Novi restoran + vlasnik</h2><div className="space-y-3"><input placeholder="Ime restorana" value={form.name} onChange={e=>{const v=e.target.value; setForm({...form,name:v,slug:v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')})}} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/><input placeholder="Slug" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm"/><input placeholder="Ime vlasnika" value={form.ownerName} onChange={e=>setForm({...form,ownerName:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/><input placeholder="Email vlasnika" value={form.ownerEmail} onChange={e=>setForm({...form,ownerEmail:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/><input placeholder="Lozinka vlasnika" type="password" value={form.ownerPass} onChange={e=>setForm({...form,ownerPass:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/></div><div className="flex gap-2 mt-6"><button onClick={()=>setShowCreate(false)} className="flex-1 bg-zinc-800 py-3 rounded-xl">Odustani</button><button onClick={createRestaurant} className="flex-1 bg-white text-black font-bold py-3 rounded-xl">Kreiraj</button></div></div></div>)}
        {resetId&&(<div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50 p-4"><div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm"><h2 className="font-bold mb-4">Nova lozinka</h2><input placeholder="Nova lozinka" value={newPass} onChange={e=>setNewPass(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-4"/><div className="flex gap-2"><button onClick={()=>setResetId(null)} className="flex-1 bg-zinc-800 py-3 rounded-xl">Odustani</button><button onClick={resetPass} className="flex-1 bg-white text-black font-bold py-3 rounded-xl">Spremi</button></div></div></div>)}
      </div>
    </div>
  )
}
