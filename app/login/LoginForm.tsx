"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm(){
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)
  const router = useRouter()
  async function submit(e:any){
    e.preventDefault()
    setErr(''); setLoading(true)
    const res = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pass})})
    const data = await res.json().catch(()=>({}))
    setLoading(false)
    if(!res.ok){ setErr(data.error||'Greška'); return }
    if(data.role==='SUPER_ADMIN') router.push('/superadmin')
    else router.push('/admin')
  }
  return (
    <form onSubmit={submit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-black">Prijava</h1>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/>
      <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Lozinka" type="password" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"/>
      {err&&<div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-xl">{err}</div>}
      <button disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-xl">{loading?'...':'Prijavi se'}</button>
    </form>
  )
}
