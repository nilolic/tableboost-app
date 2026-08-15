'use client'
import { useEffect, useState } from 'react'
export default function Page(){
  const [f,setF]=useState({naziv_obrta:'CoreCode',oib:'',broj_obrta:'',adresa:'',grad:'',email:'info@tableboost.app',web:'https://tableboost.app',iban:'',legal_visible:false})
  const [msg,setMsg]=useState('')
  const [loading,setLoading]=useState(true)
  useEffect(()=>{fetch('/api/superadmin/company').then(r=>r.json()).then(d=>{setF({naziv_obrta:d.naziv_obrta||'CoreCode',oib:d.oib||'',broj_obrta:d.broj_obrta||'',adresa:d.adresa||'',grad:d.grad||'',email:d.email||'info@tableboost.app',web:d.web||'https://tableboost.app',iban:d.iban||'',legal_visible:!!d.legal_visible});setLoading(false)})},[])
  const save=async()=>{
    if(!f.oib||!f.broj_obrta){alert('OIB i broj obrta obavezni');return}
    const r=await fetch('/api/superadmin/company',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)})
    if(r.ok) setMsg('✅ Spremljeno - legal linkovi će se pokazati na landingu')
    else setMsg('❌ Greška')
  }
  if(loading) return <div className="p-8">Učitavanje...</div>
  const input=(k:string,l:string)=><div><label className="text- font-bold uppercase opacity-60">{l}</label><input value={(f as any)[k]} onChange={e=>setF({...f,[k]:e.target.value})} className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
  return <div className="max-w-2xl mx-auto p-6 space-y-6">
    <h1 className="text-2xl font-black">CoreCode - postavke platforme</h1>
    <p className="text-sm opacity-60">Isto kao HACCP-PRO: dok ne upišeš OIB/MBO i ne uključiš toggle, footer na tableboost.app ne pokazuje ništa. Ne razjebava dizajn.</p>
    <div className="bg-white border rounded-2xl p-5 grid md:grid-cols-2 gap-4">
      {input('naziv_obrta','Naziv obrta')}{input('oib','OIB')}{input('broj_obrta','Broj obrta / MBO')}{input('adresa','Adresa')}{input('grad','Grad')}{input('email','Email')}{input('web','Web')}{input('iban','IBAN')}
      <div className="md:col-span-2 flex items-center gap-3 pt-2">
        <input type="checkbox" checked={f.legal_visible} onChange={e=>setF({...f,legal_visible:e.target.checked})} className="h-5 w-5"/>
        <span className="text-sm font-bold">Prikaži legal linkove (legal_visible)</span>
      </div>
    </div>
    <button onClick={save} className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm">Spremi</button>
    {msg && <div className="text-sm">{msg}</div>}
  </div>
}
