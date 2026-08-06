"use client"
import { useEffect, useState } from 'react'

export default function Setup2FA(){
  const [qr, setQr] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  async function load(){
    setLoading(true)
    try{
      const res = await fetch('/api/2fa/setup', {method:'POST'})
      const d = await res.json()
      if(!res.ok) throw new Error(d.error || 'Greška')
      setQr(d.qr)
      setSecret(d.secret)
    }catch(e:any){ setMsg(e.message) }
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  async function verify(){
    if(code.length !== 6) return alert('Unesi 6 znamenki')
    const res = await fetch('/api/2fa/verify', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({code})})
    const d = await res.json()
    if(!res.ok) return alert(d.error || 'Pogrešan kod')
    alert('2FA upaljen! Sljedeći login tražit će kod.')
    window.location.href = '/admin'
  }

  if(loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Učitavanje...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-black mb-2">Uključi 2FA</h1>
        <p className="text-zinc-400 text-sm mb-4">Skeniraj QR u Google Authenticator / Authy</p>
        {msg && <div className="bg-red-900/50 border border-red-800 p-3 rounded-xl text-sm mb-4">{msg}</div>}
        {qr && <img src={qr} alt="QR" className="w-56 h-56 mx-auto bg-white p-2 rounded-xl mb-4"/>}
        {secret && <div className="bg-zinc-800 p-3 rounded-xl text-xs font-mono break-all mb-4">{secret}</div>}
        <input value={code} onChange={e=>setCode(e.target.value)} placeholder="123456" maxLength={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest mb-3"/>
        <button onClick={verify} className="w-full bg-white text-black font-bold py-3 rounded-xl">Potvrdi i upali 2FA</button>
        <button onClick={()=>window.location.href='/admin'} className="w-full mt-2 bg-zinc-800 py-3 rounded-xl text-sm">Kasnije</button>
      </div>
    </div>
  )
}
