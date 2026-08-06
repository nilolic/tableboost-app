"use client"
import { useState } from 'react'
import { MoreVertical, Plus, Store, Users, Search, Eye, LogIn, Trash2, KeyRound, QrCode, LogOut, X, ShieldCheck, ShieldOff } from 'lucide-react'

export default function SuperAdminClient({ restaurants, users, currentUser }: any) {
  const [tab, setTab] = useState<'restaurants'|'users'|'translations'>('restaurants')
  const [selected, setSelected] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<'r'|'u'|null>(null)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name:'', slug:'', ownerName:'', ownerEmail:'', ownerPass:'' })
  const [resetId, setResetId] = useState<string|null>(null)
  const [newPass, setNewPass] = useState('')
  const [translateStats, setTranslateStats] = useState<any[]>([])
  const [translatingLang, setTranslatingLang] = useState<string|null>(null)
  const [selectedRestaurantForTrans, setSelectedRestaurantForTrans] = useState<string>('')

  const fr = restaurants.filter((r:any)=> r.name.toLowerCase().includes(search.toLowerCase()) || r.slug.toLowerCase().includes(search.toLowerCase()))
  const fu = users.filter((u:any)=> u.email.toLowerCase().includes(search.toLowerCase()) || (u.name||'').toLowerCase().includes(search.toLowerCase()))

  async function createRestaurant(){
    if(!form.name ||!form.slug ||!form.ownerEmail ||!form.ownerPass) return alert('Popuni sva polja')
    const res = await fetch('/api/superadmin/restaurants',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const d = await res.json()
    if(!res.ok) return alert(d.error || 'Greška')
    alert('Objekt kreiran!')
    location.reload()
  }
  async function deleteRestaurant(id:string){
    if(!confirm('OBRISATI objekt + sve podatke?')) return
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
  async function toggle2FA(userId:string, enabled:boolean){
    if(!confirm(enabled? 'Upaliti 2FA? Korisnik će morati na /2fa/setup skenirati QR' : 'Ugasiti 2FA?')) return
    const res = await fetch('/api/admin/2fa/toggle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId, enabled})})
    const d = await res.json()
    if(!res.ok) return alert(d.error || 'Greška')
    location.reload()
  }
  async function reset2FA(userId:string){
    if(!confirm('Resetirati 2FA?')) return
    const res = await fetch('/api/admin/2fa/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId})})
    const d = await res.json()
    if(!res.ok) return alert(d.error)
    location.reload()
  }
  async function impersonate(rid:string){
    await fetch('/api/superadmin/impersonate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({restaurantId:rid})})
    window.location.href='/admin'
  }
  async function loadTranslateStats(){ const res = await fetch('/api/superadmin/translate'); const d = await res.json(); if(d.stats) setTranslateStats(d.stats) }
  async function bulkTranslate(lang:'EN'|'DE'){ if(!confirm(`Prevesti sve što fali na ${lang}?`)) return; setTranslatingLang(lang); const res = await fetch('/api/superadmin/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ targetLang: lang, restaurantId: selectedRestaurantForTrans || undefined })}); const d = await res.json(); alert(`Prevedeno: ${d.translated}`); setTranslatingLang(null); loadTranslateStats() }
  async function logout(){ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login' }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6 relative z-10">
          <div><h1 className="text-3xl font-black">Super Admin</h1><p className="text-zinc-400 text-sm mt-1">{currentUser.email} • {restaurants.length} objekata • {users.length} korisnika • 2FA ON: {users.filter((u:any)=>u.totp_enabled).length}</p></div>
          <div className="flex gap-2 relative z-20">
            <button type="button" onClick={(e)=>{e.preventDefault(); e.stopPropagation(); setShowCreate(true)}} className="bg-white text-black px-6 py-3 rounded-full font-black flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-200 active:scale-95 transition-all pointer-events-auto relative z-30">
              <Plus size={18}/> Novi objekt
            </button>
            <button type="button" onClick={logout} className="bg-zinc-800 border border-zinc-700 px-5 py-3 rounded-full font-bold flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-700 pointer-events-auto">
              <LogOut size={16}/> Odjava
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={()=>setTab('restaurants')} className={`px-5 py-2.5 rounded-full flex gap-2 text-sm cursor-pointer ${tab==='restaurants'?'bg-white text-black':'bg-zinc-900 border border-zinc-800'}`}><Store size={16}/> Objekti ({restaurants.length})</button>
          <button onClick={()=>{setTab('translations'); loadTranslateStats()}} className={`px-5 py-2.5 rounded-full flex gap-2 text-sm cursor-pointer ${tab==='translations'?'bg-white text-black':'bg-zinc-900 border border-zinc-800'}`}><span>🌐</span> Prijevodi</button>
          <button onClick={()=>setTab('users')} className={`px-5 py-2.5 rounded-full flex gap-2 text-sm cursor-pointer ${tab==='users'?'bg-white text-black':'bg-zinc-900 border border-zinc-800'}`}><Users size={16}/> Korisnici ({users.length})</button>
        </div>

        <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-3 text-zinc-500" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Traži..." className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-sm"/></div>

        {tab==='restaurants'? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm"><thead className="bg-zinc-900 text-zinc-400 text-xs uppercase"><tr><th className="text-left p-4">Objekt</th><th className="text-left p-4">Vlasnik / 2FA</th><th className="text-left p-4">Osoblje</th><th className="text-right p-4">Akcije</th></tr></thead>
              <tbody>{fr.map((r:any)=>{const admin=r.users.find((u:any)=>u.role==='RESTAURANT_ADMIN');return(<tr key={r.id} className="border-t border-zinc-800"><td className="p-4"><div className="font-bold">{r.name}</div><div className="text-xs text-zinc-500">{r.slug}</div></td><td className="p-4 text-xs"><div className="flex items-center gap-2">{admin?.email||<span className="text-red-400">nema</span>} {admin?.totp_enabled? <span className="bg-green-900 text-green-200 px-2 py-0.5 rounded-full flex items-center gap-1"><ShieldCheck size={10}/>ON</span> : <span className="bg-zinc-800 px-2 py-0.5 rounded-full">OFF</span>}</div>{admin && <button onClick={()=>toggle2FA(admin.id,!admin.totp_enabled)} className={`mt-2 text-xs px-3 py-1 rounded-full font-bold cursor-pointer ${admin.totp_enabled?'bg-red-900/50 text-red-300 border border-red-800':'bg-green-900/50 text-green-300 border border-green-800'}`}>{admin.totp_enabled?'Ugasi 2FA':'Upali 2FA'}</button>}</td><td className="p-4 text-xs"><span className="bg-zinc-800 px-2 py-1 rounded-full mr-1">A:{r.users.filter((u:any)=>u.role==='RESTAURANT_ADMIN').length} (2FA:{r.users.filter((u:any)=>u.totp_enabled).length})</span></td><td className="p-4 text-right"><button onClick={()=>{setSelected(r); setSelectedType('r')}} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-full cursor-pointer"><MoreVertical size={18}/></button></td></tr>)})}</tbody></table>
          </div>
        ): tab==='users'? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-"><thead className="bg-zinc-900 text-zinc-400 text-xs uppercase"><tr><th className="text-left p-4">Korisnik</th><th className="text-left p-4">Rola</th><th className="text-left p-4">2FA</th><th className="text-left p-4">Akcija</th><th className="text-right p-4">...</th></tr></thead>
              <tbody>{fu.map((u:any)=>(<tr key={u.id} className="border-t border-zinc-800"><td className="p-4"><div className="font-medium">{u.name||'—'}</div><div className="text-xs text-zinc-400">{u.email}</div></td><td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role==='SUPER_ADMIN'?'bg-purple-900 text-purple-200':'bg-blue-900 text-blue-200'}`}>{u.role}</span></td><td className="p-4">{u.totp_enabled? <span className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><ShieldCheck size={12}/>ON</span> : <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs">OFF</span>}</td><td className="p-4">{!u.totp_enabled? <button onClick={()=>toggle2FA(u.id, true)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer">Upali 2FA</button> : <button onClick={()=>toggle2FA(u.id,false)} className="bg-red-900/80 text-red-200 border border-red-800 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer">Ugasi</button>}</td><td className="p-4 text-right"><button onClick={()=>{setSelected(u); setSelectedType('u')}} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-full cursor-pointer"><MoreVertical size={18}/></button></td></tr>))}</tbody></table>
          </div>
        ): (<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">Prijevodi</div>)}

        {selected && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden" onClick={e=>e.stopPropagation()}>
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center"><div><div className="font-bold">{selectedType==='r'?selected.name:selected.email}</div></div><button onClick={()=>setSelected(null)} className="p-2 hover:bg-zinc-800 rounded-full cursor-pointer"><X size={18}/></button></div>
              <div className="p-2">
                {selectedType==='r'? (
                  <>
                    <button onClick={()=>impersonate(selected.id)} className="w-full text-left px-4 py-3 hover:bg-zinc-800 rounded-xl flex gap-3 font-bold cursor-pointer"><LogIn size={18}/> Uđi kao vlasnik</button>
                    <button onClick={()=>{setSelected(null); deleteRestaurant(selected.id)}} className="w-full text-left px-4 py-3 hover:bg-red-900/30 text-red-400 rounded-xl flex gap-3 cursor-pointer"><Trash2 size={18}/> Obriši objekt</button>
                  </>
                ):(
                  <>
                    <button onClick={()=>{setResetId(selected.id); setSelected(null)}} className="w-full text-left px-4 py-3 hover:bg-zinc-800 rounded-xl flex gap-3 cursor-pointer"><KeyRound size={18}/> Reset lozinke</button>
                    <button onClick={()=>{const id=selected.id; setSelected(null); toggle2FA(id,true)}} className="w-full text-left px-4 py-3 hover:bg-green-900/30 text-green-400 rounded-xl flex gap-3 font-bold cursor-pointer"><ShieldCheck size={18}/> Upali 2FA</button>
                    <button onClick={()=>{setSelected(null); deleteUser(selected.id)}} className="w-full text-left px-4 py-3 hover:bg-red-900/30 text-red-400 rounded-xl flex gap-3 cursor-pointer"><Trash2 size={18}/> Obriši korisnika</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {showCreate&&(
          <div className="fixed inset-0 bg-black/90 backdrop-blur z-[100] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg relative z-[101]">
              <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Novi objekt + vlasnik</h2><button onClick={()=>setShowCreate(false)} className="p-2 hover:bg-zinc-800 rounded-full cursor-pointer"><X size={18}/></button></div>
              <div className="space-y-3">
                <input placeholder="Ime objekta" value={form.name} onChange={e=>{const v=e.target.value; setForm({...form,name:v,slug:v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')})}} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/>
                <input placeholder="Slug" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm"/>
                <input placeholder="Ime vlasnika" value={form.ownerName} onChange={e=>setForm({...form,ownerName:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/>
                <input placeholder="Email vlasnika" value={form.ownerEmail} onChange={e=>setForm({...form,ownerEmail:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/>
                <input placeholder="Lozinka vlasnika" type="password" value={form.ownerPass} onChange={e=>setForm({...form,ownerPass:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={()=>setShowCreate(false)} className="flex-1 bg-zinc-800 py-3 rounded-xl cursor-pointer">Odustani</button>
                <button type="button" onClick={createRestaurant} className="flex-1 bg-white text-black font-bold py-3 rounded-xl cursor-pointer hover:bg-zinc-200">Kreiraj</button>
              </div>
            </div>
          </div>
        )}
        {resetId&&(<div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4"><div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm"><h2 className="font-bold mb-4">Nova lozinka</h2><input placeholder="Nova lozinka" value={newPass} onChange={e=>setNewPass(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-4"/><div className="flex gap-2"><button onClick={()=>setResetId(null)} className="flex-1 bg-zinc-800 py-3 rounded-xl cursor-pointer">Odustani</button><button onClick={resetPass} className="flex-1 bg-white text-black font-bold py-3 rounded-xl cursor-pointer">Spremi</button></div></div></div>)}
      </div>
    </div>
  )
}
