'use client'
import { useState } from 'react'

export default function SettingsClient({ restaurant }: { restaurant:any }) {
  const [form, setForm] = useState({
    name: restaurant.name||"",
    legalName: restaurant.legalName||"",
    address: restaurant.address||"",
    city: restaurant.city||"",
    postalCode: restaurant.postalCode||"",
    oib: restaurant.oib||"",
    phone: restaurant.phone||"",
    email: restaurant.email||"",
    website: restaurant.website||"",
    iban: restaurant.iban||"",
    vatNumber: restaurant.vatNumber||"",
    description: restaurant.description||"",
    workingHours: restaurant.workingHours||"",
    serviceMode: restaurant.serviceMode||"TABLE",
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  const save = async () => {
    setSaving(true)
    setMsg("")
    const res = await fetch('/api/admin/restaurant', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if(res.ok) setMsg("✅ Spremljeno!")
    else setMsg("❌ "+(data.error||"Greška"))
  }

  const field = (label:string, key:string, placeholder?:string) => (
    <div>
      <label className="text-xs font-semibold opacity-70 uppercase tracking-widest">{label}</label>
      <input value={(form as any)[key]} onChange={e=>setForm({...form, [key]:e.target.value})} placeholder={placeholder} className="mt-1 w-full border border-black/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"/>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Podaci objekta</h1>
        <p className="text-sm opacity-60 mt-1">Ovi podaci se koriste za meni, račune i fiskalizaciju</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-5 space-y-5">
        <h2 className="font-bold text-sm">Način posluživanja</h2>
        <div className="grid gap-3">
          <label className="text-xs font-semibold opacity-70 uppercase tracking-widest">Kako gosti preuzimaju narudžbu?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button type="button" onClick={()=>setForm({...form, serviceMode:'TABLE'})} className={`text-left border rounded-xl p-4 transition ${form.serviceMode==='TABLE'? 'border-black bg-black text-white' : 'border-black/10 bg-white hover:border-black/20'}`}>
              <div className="font-bold text-sm">🍽️ Poslužuje konobar</div>
              <div className={`text-xs mt-1 ${form.serviceMode==='TABLE'? 'opacity-70' : 'opacity-60'}`}>Standardno - gost naručuje za stol</div>
            </button>
            <button type="button" onClick={()=>setForm({...form, serviceMode:'BAR'})} className={`text-left border rounded-xl p-4 transition ${form.serviceMode==='BAR'? 'border-black bg-black text-white' : 'border-black/10 bg-white hover:border-black/20'}`}>
              <div className="font-bold text-sm">🛎️ Preuzimanje na šanku</div>
              <div className={`text-xs mt-1 ${form.serviceMode==='BAR'? 'opacity-70' : 'opacity-60'}`}>Gost preuzima sam na šanku - prikaz iznad plaćanja</div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-5 space-y-5">
        <h2 className="font-bold text-sm">Osnovno</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {field("Naziv na meniju", "name", "Bistro Central")}
          {field("Pravni naziv firme", "legalName", "CENTRAL j.d.o.o.")}
        </div>
        {field("Opis", "description", "Restoran mediteranske kuhinje...")}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold opacity-70 uppercase tracking-widest">Opis - dugačko</label>
            <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} rows={3} className="mt-1 w-full border border-black/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"/>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-5 space-y-5">
        <h2 className="font-bold text-sm">Adresa i kontakt</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {field("Adresa", "address", "Ilica 1")}
          {field("Grad", "city", "Zagreb")}
          {field("Poštanski broj", "postalCode", "10000")}
          {field("Telefon", "phone", "+385 91...")}
          {field("Email", "email", "info@...")}
          {field("Web", "website", "https://...")}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-5 space-y-5">
        <h2 className="font-bold text-sm">Porezni podaci</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {field("OIB", "oib", "12345678901")}
          {field("PDV ID / VAT", "vatNumber", "HR12345678901")}
          {field("IBAN", "iban", "HR12...")}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-5 space-y-5">
        <h2 className="font-bold text-sm">Ostalo</h2>
        {field("Radno vrijeme", "workingHours", "Pon-Ned 08-23h")}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold disabled:opacity-50">
          {saving? "Spremam..." : "Spremi podatke"}
        </button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  )
}
