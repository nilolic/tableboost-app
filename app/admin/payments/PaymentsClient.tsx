'use client'
import { useState, useEffect } from 'react'
import { CreditCard, Banknote, Smartphone, TestTube, Check, AlertCircle } from 'lucide-react'

export default function PaymentsClient({ initial }: { initial: any }) {
  const [form, setForm] = useState({
    paymentCashEnabled: initial.paymentCashEnabled?? true,
    paymentCardTerminalEnabled: initial.paymentCardTerminalEnabled?? true,
    paymentCardOnlineEnabled: initial.paymentCardOnlineEnabled?? false,
    paymentProvider: initial.paymentProvider || 'stripe',
    paymentTestMode: initial.paymentTestMode?? true,
    stripePublicKey: initial.stripePublicKey || '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [hasSecret, setHasSecret] = useState(initial.hasSecret)

  const save = async () => {
    setSaving(true); setMsg('')
    const res = await fetch('/api/admin/payments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await res.json()
    setSaving(false)
    if (res.ok) { setMsg('✅ Spremljeno!'); if (form.stripeSecretKey) { setHasSecret(true); setForm(f=>({...f, stripeSecretKey:''})) } }
    else setMsg('❌ '+(d.error||'Greška'))
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard/> Plaćanja</h1>
        <p className="text-sm opacity-60 mt-1">Pripremi sve sad, Stripe ključ dodaš kasnije</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-sm">
        <TestTube className="text-amber-600 shrink-0" size={18}/>
        <div><b>Test mode je aktivan.</b> Dok ne dodaš pravi Stripe ključ, koristi se mock provider koji simulira plaćanje. Gosti neće biti naplaćeni.</div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-5 space-y-4">
        <h2 className="font-bold">Načini plaćanja na checkoutu</h2>
        <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer">
          <span className="flex items-center gap-2"><Banknote size={18}/> Gotovina</span>
          <input type="checkbox" checked={form.paymentCashEnabled} onChange={e=>setForm({...form, paymentCashEnabled:e.target.checked})} className="w-5 h-5"/>
        </label>
        <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer">
          <span className="flex items-center gap-2"><Smartphone size={18}/> Kartica na terminalu (konobar donosi)</span>
          <input type="checkbox" checked={form.paymentCardTerminalEnabled} onChange={e=>setForm({...form, paymentCardTerminalEnabled:e.target.checked})} className="w-5 h-5"/>
        </label>
        <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer ${!form.paymentCardOnlineEnabled?'opacity-60':''}`}>
          <span className="flex items-center gap-2"><CreditCard size={18}/> Plati karticom online <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full ml-2">USKORO</span></span>
          <input type="checkbox" checked={form.paymentCardOnlineEnabled} onChange={e=>setForm({...form, paymentCardOnlineEnabled:e.target.checked})} className="w-5 h-5"/>
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-5 space-y-4">
        <h2 className="font-bold">Online provider</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={()=>setForm({...form, paymentProvider:'stripe'})} className={`p-4 border-2 rounded-xl text-left ${form.paymentProvider==='stripe'?'border-black bg-black text-white':'border-black/10'}`}>
            <div className="font-bold">Stripe</div><div className="text-xs mt-1 opacity-70">Najbrži start, Apple Pay, Google Pay</div>
          </button>
          <button onClick={()=>setForm({...form, paymentProvider:'monri'})} className={`p-4 border-2 rounded-xl text-left ${form.paymentProvider==='monri'?'border-black bg-black text-white':'border-black/10'}`}>
            <div className="font-bold">Monri / WSPay</div><div className="text-xs mt-1 opacity-70">Za HR, niže provizije, treba ugovor</div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-5 space-y-4">
        <h2 className="font-bold flex items-center gap-2">Stripe ključevi {hasSecret && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1"><Check size={12}/> Secret spremljen</span>}</h2>
        <p className="text-xs opacity-60">Nađi na https://dashboard.stripe.com/apikeys - ostavi prazno dok ne dobiješ ključ</p>
        <div>
          <label className="text-xs font-semibold uppercase opacity-70">Publishable key (pk_...)</label>
          <input value={form.stripePublicKey} onChange={e=>setForm({...form, stripePublicKey:e.target.value})} placeholder="pk_test_..." className="mt-1 w-full border rounded-xl px-3.5 py-2.5 text-sm"/>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase opacity-70">Secret key (sk_...) - {hasSecret?'ostavi prazno da ne mijenjaš':''}</label>
          <input value={form.stripeSecretKey} onChange={e=>setForm({...form, stripeSecretKey:e.target.value})} placeholder={hasSecret?"••••••••••••":"sk_test_..."} className="mt-1 w-full border rounded-xl px-3.5 py-2.5 text-sm"/>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase opacity-70">Webhook secret (whsec_...)</label>
          <input value={form.stripeWebhookSecret} onChange={e=>setForm({...form, stripeWebhookSecret:e.target.value})} placeholder="whsec_..." className="mt-1 w-full border rounded-xl px-3.5 py-2.5 text-sm"/>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" checked={form.paymentTestMode} onChange={e=>setForm({...form, paymentTestMode:e.target.checked})}/>
          <span className="text-sm">Test mode (koristi test kartice 4242 4242 4242 4242)</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold disabled:opacity-50">{saving?"Spremam...":"Spremi"}</button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>

      <div className="bg-slate-50 border rounded-2xl p-4 text-xs opacity-70">
        <b>Što je spremno sad bez ključa?</b><br/>
        • Baza ima paymentMethod, paymentStatus<br/>
        • Checkout će prikazivati metode koje upališ<br/>
        • Mock provider simulira plaćanje<br/>
        • Kad dodaš Stripe ključ, samo zamijenimo MockProvider sa StripeProvider u lib/payments/index.ts - 5 linija koda
      </div>
    </div>
  )
}
