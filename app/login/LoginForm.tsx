"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm(){
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [remember,setRemember]=useState(false)
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)
  const router = useRouter()

  useEffect(()=>{
    try{
      const saved = localStorage.getItem('tb_remember')
      if(saved){
        const data = JSON.parse(saved)
        if(data?.e) setEmail(atob(data.e))
        if(data?.p) setPass(atob(data.p))
        setRemember(true)
      }
    }catch{}
  },[])

  async function submit(e:any){
    e.preventDefault()
    setErr(''); setLoading(true)
    try{
      if(remember){
        localStorage.setItem('tb_remember', JSON.stringify({ e: btoa(email), p: btoa(pass) }))
      } else {
        localStorage.removeItem('tb_remember')
      }
    }catch{}
    const res = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pass})})
    const data = await res.json().catch(()=>({}))
    setLoading(false)
    if(!res.ok){ setErr(data.error||'Greška'); return }
    if(data.role==='SUPER_ADMIN') router.push('/superadmin')
    else if(data.role==='WAITER' || data.role==='KITCHEN') router.push('/admin/orders')
    else router.push('/admin')
  }

  return (
    <div className="bg-white border border-zinc-200 rounded- p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
      <div className="mb-6">
        <h1 className="text- font-[650] tracking-[-0.02em] text-zinc-900">Prijava</h1>
        <p className="text- text-zinc-500 mt-1">Dobrodošao natrag u TableBoost</p>
      </div>
      <form onSubmit={submit} className="space-y-3.5">
        <div className="space-y-1.5">
          <label className="text- font-medium tracking-wide text-zinc-500 uppercase">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="vas@email.com" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text- text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition"/>
        </div>
        <div className="space-y-1.5">
          <label className="text- font-medium tracking-wide text-zinc-500 uppercase">Lozinka</label>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text- text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition"/>
        </div>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
            <span className="text- text-zinc-600 group-hover:text-zinc-900 transition">Zapamti me</span>
          </label>
          <span className="text- text-zinc-400">🔒 lokalno</span>
        </div>
        {err&&<div className="text- text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">{err}</div>}
        <button disabled={loading} className="w-full bg-zinc-900 text-white font-[600] text- py-3 rounded-xl hover:bg-black transition disabled:opacity-50 mt-2">{loading?'Prijavljujem...':'Prijavi se'}</button>
      </form>
    </div>
  )
}
