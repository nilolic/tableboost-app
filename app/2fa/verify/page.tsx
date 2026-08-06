"use client"
import { useState, useEffect } from 'react'

export default function Verify2FA(){
  const [code, setCode] = useState('')
  const [tempId, setTempId] = useState('')

  useEffect(()=>{
    const p = new URLSearchParams(window.location.search)
    setTempId(p.get('tempId')||'')
  },[])

  async function submit(){
    if(code.length!==6) return alert('6 znamenki')
    const res = await fetch('/api/2fa/login-verify', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({code, tempId})})
    const d = await res.json()
    if(!res.ok) return alert(d.error||'Pogrešan kod')
    window.location.href = d.redirect || '/admin'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm text-center">
        <h1 className="text-xl font-black mb-1">2FA Provjera</h1>
        <p className="text-zinc-400 text-sm mb-4">Unesi kod iz Authenticator aplikacije</p>
        <input value={code} onChange={e=>setCode(e.target.value)} placeholder="123456" maxLength={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.3em] mb-4"/>
        <button onClick={submit} className="w-full bg-white text-black font-bold py-3 rounded-full">Potvrdi</button>
      </div>
    </div>
  )
}
