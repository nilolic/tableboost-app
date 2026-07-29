"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  async function submit(e: any) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Greska'); setLoading(false); return }
    if (data.role === 'SUPER_ADMIN') router.push('/superadmin')
    else router.push('/admin')
  }
  return (
    <form onSubmit={submit} className="bg-zinc-900/60 border border-zinc-800 rounded- p-8 space-y-5 w-full">
      <h1 className="text- font-bold text-white">Dobrodosao nazad</h1>
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-3 rounded-xl">{error}</div>}
      <div><label className="text- uppercase text-zinc-400">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3.5 text-white" required /></div>
      <div><label className="text- uppercase text-zinc-400">Lozinka</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3.5 text-white" required /></div>
      <button disabled={loading} className="w-full bg-white text-black font-bold py-3.5 rounded-xl">{loading? 'Prijavljivanje...' : 'Prijavi se'}</button>
    </form>
  )
}
