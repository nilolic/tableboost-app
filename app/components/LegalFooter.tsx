'use client'
import { useEffect, useState } from 'react'
export default function LegalFooter(){
  const [co,setCo]=useState<any>(null)
  useEffect(()=>{fetch('/api/public/company').then(r=>r.json()).then(setCo).catch(()=>{})},[])
  if(!co ||!co.legal_visible) return null
  return (
    <div className="flex items-center gap-4 text- text-zinc-500">
      <a href="/legal/terms.html" className="hover:text-zinc-900 underline">Uvjeti</a>
      <a href="/legal/privacy.html" className="hover:text-zinc-900 underline">Privatnost</a>
      <a href="/legal/cookies.html" className="hover:text-zinc-900 underline">Kolačići</a>
      <a href="/legal/dpa.html" className="hover:text-zinc-900 underline">DPA</a>
    </div>
  )
}
