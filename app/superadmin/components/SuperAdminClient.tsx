"use client"
import { useState } from 'react'
import { MoreVertical, Plus, Store, Users, Search, Eye, LogIn, Trash2, KeyRound, QrCode, LogOut, X } from 'lucide-react'

export default function SuperAdminClient({ restaurants, users, currentUser }: any) {
  const [tab, setTab] = useState<'restaurants'|'users'>('restaurants')
  const [selected, setSelected] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<'r'|'u'|null>(null)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name:'', slug:'', ownerName:'', ownerEmail:'', ownerPass:'' })
  const [resetId, setResetId] = useState<string|null>(null)
  const [newPass, setNewPass] = useState('')

  const fr = restaurants.filter((r:any)=> r.name.toLowerCase().includes(search.toLowerCase()) || r.slug.toLowerCase().includes(search.toLowerCase()))
  const fu = users.filter((u:any)=> u.email.toLowerCase().includes(search.toLowerCase()) || (u.name||'').toLowerCase().includes(search.toLowerCase()))
  const superAdmins = users.filter((u:any)=>u.role==='SUPER_ADMIN')

  async function createRestaurant(){
    const res = await fetch('/api/superadmin/restaurants',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const d = await res.json()
    if(!res.ok) return alert(d.error)
    location.reload()
  }
  async function deleteRestaurant(id:string){
    if(!confirm('OBRISATI restoran + sve podatke?')) return
    const res = await fetch(`/api/superadmin/restaurants/${id}`,{method:'DELETE'})
    if(!res.ok){ const d=await res.json(); return alert(d.error) }
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
    if(id===currentUser.id) return alert('Ne možeš obrisati sam sebe!')
    if(!confirm('Obrisati korisnika?')) return
    const res = await fetch(`/api/superadmin/users/${id}`,{method:'DELETE'})
    if(!res.ok){ const d=await res.json(); return alert(d.error)}
    location.reload()
  }
  async function impersonate(rid:string){
    await fetch('/api/superadmin/impersonate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({restaurantId:rid})})
    window.location.href='/admin'
  }
  function logout(){ window.location.href='/api/auth/logout' }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
          <div><h1 className="text-3xl font-black">Super Admin</h1><p className="text-zinc-400 text-sm mt-1">{currentUser.email} • {restaurants.length} restorana • {users.length} korisnika {superAdmins.length>1? `• ⚠️ ${superAdmins.length} super admina!`:''}</p>{superAdmins.length>1&&<p className="text-xs text-yellow-400 mt-1">Imaš {superAdmins.length} super admina: {superAdmins.map((s:any)=>s.email).join(', ')} - obriši višak u Korisnici tabu</p>}</div>
          <div className="flex gap-2"><button onClick={()=>setShowCreate(true)} className="bg-white text-black px-5 py-3 rounded-full font-bold flex items-center gap-2 text-sm"><Plus size={18}/> Novi restoran</button><button onClick={logout} className="bg-zinc-800 border border-zinc-700 px-5 py-3 rounded-full font-bold flex items-center gap-2 text-sm"><LogOut size={16}/> Odjava</button></div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={()=>setTab('restaurants')} className={`px-5 py-2.5 rounded-full flex gap-2 text-sm ${tab==='restaurants'?'bg-white text-black':'bg-zinc-900 border border-zinc-800'}`}><Store size={16}/> Restorani ({restaurants.length})</button>
          <button onClick={()=>setTab('users')} className={`px-5 py-2.5 rounded-full flex gap-2 text-sm ${tab==='users'?'bg-white text-black':'bg-zinc-900 border border-zinc-800'}`}><Users size={16}/> Korisnici ({users.length}) {superAdmins.length>1?'⚠️':''}</button>
        </div>

        <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-3 text-zinc-500" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Traži..." className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-sm"/></div>

        {tab==='restaurants'? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-"><thead className="bg-zinc-900 text-zinc-400 text- uppercase"><tr><th className="text-left p-4">Restoran</th><th className="text-left p-4">Vlasnik</th><th className="text-left p-4">Osoblje</th><th className="text-right p-4">Akcije</th></tr></thead>
              <tbody>{fr.map((r:any)=>{const admin=r.users.find((u:any)=>u.role==='RESTAURANT_ADMIN');return(<tr key={r.id} className="border-t border-zinc-800"><td className="p-4"><div className="font-bold">{r.name}</div><div className="text-xs text-zinc-500">{r.slug}</div></td><td className="p-4 text-xs">{admin?.email||<span className="text-red-400">nema</span>}</td><td className="p-4 text-xs"><span className="bg-zinc-800 px-2 py-1 rounded-full mr-1">A:{r.users.filter((u:any)=>u.role==='RESTAURANT_ADMIN').length}</span><span className="bg-zinc-800 px-2 py-1 rounded-full mr-1">K:{r.users.filter((u:any)=>u.role==='WAITER').length}</span><span className="bg-zinc-800 px-2 py-1 rounded-full">Ku:{r.users.filter((u:any)=>u.role==='KITCHEN').length}</span></td><td className="p-4 text-right"><button onClick={()=>{setSelected(r); setSelectedType('r')}} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-full"><MoreVertical size={18}/></button></td></tr>)})}</tbody></table>
          </div>
        ):(
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-"><thead className="bg-zinc-900 text-zinc-400 text- uppercase"><tr><th className="text-left p-4">Korisnik</th><th className="text-left p-4">Rola</th><th className="text-left p-4">Restoran</th><th className="text-right p-4">Akcije</th></tr></thead>
              <tbody>{fu.map((u:any)=>(<tr key={u.id} className={`border-t border-zinc-800 ${u.id===currentUser.id?'bg-zinc-800/30':''}`}><td className="p-4"><div className="font-medium flex gap-2 items-center">{u.name||'—'} {u.id===currentUser.id&&<span className="text- bg-white text-black px-1.5 py-0.5 rounded-full">TI</span>}</div><div className="text-xs text-zinc-400">{u.email}</div></td><td className="p-4"><span className={`px-2 py-1 rounded-full text- font-bold ${u.role==='SUPER_ADMIN'?'bg-purple-900 text-purple-200':u.role==='RESTAURANT_ADMIN'?'bg-blue-900 text-blue-200':u.role==='WAITER'?'bg-green-900 text-green-200':'bg-orange-900 text-orange-200'}`}>{u.role}</span></td><td className="p-4 text-xs">{u.restaurant?.name|| (u.role==='SUPER_ADMIN'?'Super Admin':'—')}</td><td className="p-4 text-right"><button onClick={()=>{setSelected(u); setSelectedType('u')}} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-full"><MoreVertical size={18}/></button></td></tr>))}</tbody></table>
          </div>
        )}

        {/* AKCIJE MODAL - NE REŽE SE VIŠE */}
        {selected && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden" onClick={e=>e.stopPropagation()}>
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center"><div><div className="font-bold">{selectedType==='r'?selected.name:selected.email}</div><div className="text-xs text-zinc-500">{selectedType==='r'?selected.slug:selected.role}</div></div><button onClick={()=>setSelected(null)} className="p-2 hover:bg-zinc-800 rounded-full"><X size={18}/></button></div>
              <div className="p-2">
                {selectedType==='r'? (
                  <>
                    <button onClick={()=>{window.open(`/menu/${selected.slug}`,'_blank'); setSelected(null)}} className="w-full text-left px-4 py-3 hover:bg-zinc-800 rounded-xl flex gap-3"><Eye size={18}/> Vidi meni</button>
                    <button onClick={()=>impersonate(selected.id)} className="w-full text-left px-4 py-3 hover:bg-zinc-800 rounded-xl flex gap-3 font-bold"><LogIn size={18}/> Uđi kao vlasnik</button>
                    <button onClick={()=>{setTab('users'); setSearch(selected.slug); setSelected(null)}} className="w-full text-left px-4 py-3 hover:bg-zinc-800 rounded-xl flex gap-3"><Users size={18}/> Vidi osoblje ({selected.users.length})</button>
                    <button onClick={()=>window.open(`/admin/qr`,'_blank')} className="w-full text-left px-4 py-3 hover:bg-zinc-800 rounded-xl flex gap-3"><QrCode size={18}/> QR kodovi</button>
                    <div className="border-t border-zinc-800 my-2"></div>
                    <button onClick={()=>{setSelected(null); deleteRestaurant(selected.id)}} className="w-full text-left px-4 py-3 hover:bg-red-900/30 text-red-400 rounded-xl flex gap-3"><Trash2 size={18}/> Obriši restoran</button>
                  </>
                ):(
                  <>
                    <button onClick={()=>{setResetId(selected.id); setSelected(null)}} className="w-full text-left px-4 py-3 hover:bg-zinc-800 rounded-xl flex gap-3"><KeyRound size={18}/> Reset lozinke</button>
                    {selected.restaurantId&&<button onClick={()=>impersonate(selected.restaurantId)} className="w-full text-left px-4 py-3 hover:bg-zinc-800 rounded-xl flex gap-3"><LogIn size={18}/> Uđi u restoran {selected.restaurant?.name||''}</button>}
                    <div className="border-t border-zinc-800 my-2"></div>
                    <button disabled={selected.id===currentUser.id} onClick={()=>{setSelected(null); deleteUser(selected.id)}} className={`w-full text-left px-4 py-3 rounded-xl flex gap-3 ${selected.id===currentUser.id?'text-zinc-600':'hover:bg-red-900/30 text-red-400'}`}><Trash2 size={18}/> {selected.id===currentUser.id?'Ne možeš obrisati sebe':'Obriši korisnika'}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {showCreate&&(<div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4"><div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg"><h2 className="text-xl font-bold mb-4">Novi restoran + vlasnik</h2><div className="space-y-3"><input placeholder="Ime restorana" value={form.name} onChange={e=>{const v=e.target.value; setForm({...form,name:v,slug:v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')})}} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/><input placeholder="Slug" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm"/><input placeholder="Ime vlasnika" value={form.ownerName} onChange={e=>setForm({...form,ownerName:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/><input placeholder="Email vlasnika" value={form.ownerEmail} onChange={e=>setForm({...form,ownerEmail:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/><input placeholder="Lozinka vlasnika" type="password" value={form.ownerPass} onChange={e=>setForm({...form,ownerPass:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/></div><div className="flex gap-2 mt-6"><button onClick={()=>setShowCreate(false)} className="flex-1 bg-zinc-800 py-3 rounded-xl">Odustani</button><button onClick={createRestaurant} className="flex-1 bg-white text-black font-bold py-3 rounded-xl">Kreiraj</button></div></div></div>)}
        {resetId&&(<div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4"><div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm"><h2 className="font-bold mb-4">Nova lozinka</h2><input placeholder="Nova lozinka" value={newPass} onChange={e=>setNewPass(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-4"/><div className="flex gap-2"><button onClick={()=>setResetId(null)} className="flex-1 bg-zinc-800 py-3 rounded-xl">Odustani</button><button onClick={resetPass} className="flex-1 bg-white text-black font-bold py-3 rounded-xl">Spremi</button></div></div></div>)}
      </div>
    </div>
  )
}
