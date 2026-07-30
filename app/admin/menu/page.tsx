"use client"
import { useEffect, useState } from 'react'
type Category = { id: string; name: string; nameEn?: string | null; nameDe?: string | null; order: number; items: Item[] }
type Item = { id: string; name: string; nameEn?: string | null; nameDe?: string | null; description?: string | null; descriptionEn?: string | null; descriptionDe?: string | null; price: number; categoryId: string; available: boolean; isBoosted: boolean; boostLevel: number; order: number }
export default function AdminMenuPage() {
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [showCatModal, setShowCatModal] = useState(false)
  const [catForm, setCatForm] = useState({ id: '', name: '', nameEn: '', nameDe: '' })
  const [itemForm, setItemForm] = useState<Partial<Item> & { id?: string }>({ name: '', price: 0, description: '', categoryId: '' })
  const [showItemModal, setShowItemModal] = useState(false)
  const [translating, setTranslating] = useState<string | null>(null)
  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/menu')
    const data = await res.json()
    if (data.categories) setCats(data.categories)
    if (data.categories?.length &&!activeCat) setActiveCat(data.categories[0].id)
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  async function translateField(text: string, target: 'EN' | 'DE', fieldSetter: (v: string) => void, id: string) {
    if (!text) return alert('Nema teksta')
    setTranslating(id)
    try {
      const res = await fetch('/api/admin/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, targetLang: target, sourceLang: 'HR' }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      fieldSetter(d.translated)
    } catch (e: any) { alert('Greška: ' + e.message) } finally { setTranslating(null) }
  }
  async function saveCategory() {
    const action = catForm.id? 'updateCategory' : 'createCategory'
    const res = await fetch('/api/admin/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action,...catForm }) })
    if (!res.ok) { const d = await res.json(); return alert(d.error) }
    setShowCatModal(false); setCatForm({ id: '', name: '', nameEn: '', nameDe: '' }); load()
  }
  async function saveItem() {
    const action = itemForm.id? 'updateItem' : 'createItem'
    const res = await fetch('/api/admin/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action,...itemForm }) })
    if (!res.ok) { const d = await res.json(); return alert(d.error) }
    setShowItemModal(false); setItemForm({ name: '', price: 0, description: '', categoryId: '' }); load()
  }
  async function deleteCat(id: string) { if (!confirm('Obrisati kategoriju i sva jela?')) return; await fetch('/api/admin/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deleteCategory', id }) }); load() }
  async function deleteItem(id: string) { if (!confirm('Obrisati jelo?')) return; await fetch('/api/admin/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deleteItem', id }) }); load() }
  if (loading) return <div className="p-10">Učitavam...</div>
  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">Meni <span className="text-sm font-normal text-neutral-500 ml-2">HR / EN / DE • DeepL</span></h1>
        <div className="flex gap-2"><a href="/admin" className="border px-4 py-2 rounded-full text-sm">Dashboard</a><button onClick={() => { setCatForm({ id: '', name: '', nameEn: '', nameDe: '' }); setShowCatModal(true) }} className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold">+ Kategorija</button></div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">{cats.map(c => (<div key={c.id} className={`p-4 rounded-2xl border cursor-pointer flex justify-between items-center ${activeCat === c.id? 'bg-black text-white border-black' : 'bg-white hover:bg-zinc-50'}`} onClick={() => setActiveCat(c.id)}><div><div className="font-bold">{c.name}</div><div className="text-xs opacity-60">{c.nameEn || 'no EN'} / {c.nameDe || 'no DE'} • {c.items.length}</div></div><button onClick={e => { e.stopPropagation(); setCatForm({ id: c.id, name: c.name, nameEn: c.nameEn || '', nameDe: c.nameDe || '' }); setShowCatModal(true) }} className="text-xs underline p-2">Edit</button></div>))}</div>
        <div className="lg:col-span-2">{!activeCat? <div className="p-10 border border-dashed rounded-2xl text-center text-neutral-500">Odaberi kategoriju</div> : (() => { const cat = cats.find(c => c.id === activeCat)!; return (<div className="bg-white border rounded-2xl p-5"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{cat.name}</h2><div className="flex gap-2"><button onClick={() => deleteCat(cat.id)} className="text-xs text-red-600 border border-red-200 px-3 py-1 rounded-full">Obriši</button><button onClick={() => { setItemForm({ name: '', description: '', price: 0, categoryId: cat.id, available: true, isBoosted: false, boostLevel: 0 } as any); setShowItemModal(true) }} className="bg-black text-white px-4 py-2 rounded-full text-sm">+ Jelo</button></div></div><div className="space-y-3">{cat.items.map(item => (<div key={item.id} className="flex justify-between gap-4 p-3 border rounded-xl hover:bg-zinc-50"><div className="flex-1"><div className="font-semibold flex gap-2 items-center">{item.name} {item.isBoosted && <span className="bg-yellow-400 text-black text- px-2 py-0.5 rounded-full">BOOST {item.boostLevel}</span>} {!item.available && <span className="bg-red-100 text-red-700 text- px-2 py-0.5 rounded-full">OFF</span>}</div><div className="text-xs text-neutral-500">{item.description}</div><div className="text- text-neutral-400 mt-1">EN: {item.nameEn || '—'} | DE: {item.nameDe || '—'}</div></div><div className="text-right flex flex-col gap-2 items-end"><div className="font-bold">{item.price} €</div><div className="flex gap-1"><button onClick={() => { setItemForm(item); setShowItemModal(true) }} className="text-xs border px-3 py-1 rounded-full">Edit</button><button onClick={() => deleteItem(item.id)} className="text-xs border px-2 py-1 rounded-full">🗑</button></div></div></div>))}{cat.items.length === 0 && <div className="text-sm text-neutral-400 py-10 text-center">Nema jela</div>}</div></div>) })()}</div>
      </div>
      {showCatModal && (<div className="fixed inset-0 bg-black/60 backdrop-blur z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-lg"><h3 className="font-bold text-lg mb-4">{catForm.id? 'Uredi' : 'Nova'} kategorija</h3><div className="space-y-3"><div><label className="text-xs font-bold">HR</label><input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value })} className="w-full border rounded-xl px-4 py-3" /></div><div><label className="text-xs font-bold flex justify-between">EN <button onClick={() => translateField(catForm.name, 'EN', v => setCatForm(f => ({...f, nameEn: v })), 'cat-en')} className="text- underline">{translating === 'cat-en'? '...' : '🔁 DeepL'}</button></label><input value={catForm.nameEn} onChange={e => setCatForm({...catForm, nameEn: e.target.value })} className="w-full border rounded-xl px-4 py-3" /></div><div><label className="text-xs font-bold flex justify-between">DE <button onClick={() => translateField(catForm.name, 'DE', v => setCatForm(f => ({...f, nameDe: v })), 'cat-de')} className="text- underline">{translating === 'cat-de'? '...' : '🔁 DeepL'}</button></label><input value={catForm.nameDe} onChange={e => setCatForm({...catForm, nameDe: e.target.value })} className="w-full border rounded-xl px-4 py-3" /></div></div><div className="flex gap-2 mt-6"><button onClick={() => setShowCatModal(false)} className="flex-1 border py-3 rounded-xl">Odustani</button><button onClick={saveCategory} className="flex-1 bg-black text-white py-3 rounded-xl font-bold">Spremi</button></div></div></div>)}
      {showItemModal && (<div className="fixed inset-0 bg-black/60 backdrop-blur z-50 flex items-center justify-center p-4 overflow-y-auto"><div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-10"><h3 className="font-bold text-lg mb-4">{itemForm.id? 'Uredi' : 'Novo'} jelo</h3><div className="grid md:grid-cols-2 gap-4"><div className="md:col-span-2"><label className="text-xs font-bold">Naziv HR</label><input value={itemForm.name || ''} onChange={e => setItemForm({...itemForm, name: e.target.value })} className="w-full border rounded-xl px-4 py-3" /></div><div><label className="text-xs font-bold flex justify-between">EN <button type="button" onClick={() => translateField(itemForm.name || '', 'EN', v => setItemForm(f => ({...f, nameEn: v })), 'n-en')} className="text- underline">🔁</button></label><input value={itemForm.nameEn || ''} onChange={e => setItemForm({...itemForm, nameEn: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm" /></div><div><label className="text-xs font-bold flex justify-between">DE <button type="button" onClick={() => translateField(itemForm.name || '', 'DE', v => setItemForm(f => ({...f, nameDe: v })), 'n-de')} className="text- underline">🔁</button></label><input value={itemForm.nameDe || ''} onChange={e => setItemForm({...itemForm, nameDe: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm" /></div><div className="md:col-span-2"><label className="text-xs font-bold">Opis HR</label><textarea value={itemForm.description || ''} onChange={e => setItemForm({...itemForm, description: e.target.value })} className="w-full border rounded-xl px-4 py-3" rows={2} /></div><div><label className="text-xs font-bold flex justify-between">Opis EN <button type="button" onClick={() => translateField(itemForm.description || '', 'EN', v => setItemForm(f => ({...f, descriptionEn: v })), 'd-en')} className="text- underline">🔁</button></label><textarea value={itemForm.descriptionEn || ''} onChange={e => setItemForm({...itemForm, descriptionEn: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm" rows={2} /></div><div><label className="text-xs font-bold flex justify-between">Opis DE <button type="button" onClick={() => translateField(itemForm.description || '', 'DE', v => setItemForm(f => ({...f, descriptionDe: v })), 'd-de')} className="text- underline">🔁</button></label><textarea value={itemForm.descriptionDe || ''} onChange={e => setItemForm({...itemForm, descriptionDe: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm" rows={2} /></div><div><label className="text-xs font-bold">Cijena €</label><input type="number" step="0.01" value={itemForm.price || 0} onChange={e => setItemForm({...itemForm, price: parseFloat(e.target.value) })} className="w-full border rounded-xl px-4 py-3" /></div><div><label className="text-xs font-bold">Boost</label><div className="flex gap-2"><label className="flex items-center gap-2 text-sm border rounded-xl px-3 py-2 flex-1"><input type="checkbox" checked={!!itemForm.isBoosted} onChange={e => setItemForm({...itemForm, isBoosted: e.target.checked })} /> Boosted</label><input type="number" value={itemForm.boostLevel || 0} onChange={e => setItemForm({...itemForm, boostLevel: parseInt(e.target.value) })} className="border rounded-xl px-3 py-2 w-20" /></div></div><div className="md:col-span-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={itemForm.available?? true} onChange={e => setItemForm({...itemForm, available: e.target.checked })} /> Dostupno</label></div></div><div className="flex gap-2 mt-6"><button onClick={() => setShowItemModal(false)} className="flex-1 border py-3 rounded-xl">Odustani</button><button onClick={saveItem} className="flex-1 bg-black text-white py-3 rounded-xl font-bold">Spremi</button></div></div></div>)}
    </main>
  )
}
