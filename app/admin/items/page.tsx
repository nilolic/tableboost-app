"use client";
import { useEffect, useState } from "react";
type Cat = { id:string; name:string; order?:number };
type Item = { id:string; name:string; description?:string|null; price:number; categoryId:string; category:{name:string; id?:string}; imageUrl?:string|null; available:boolean; isBoosted:boolean; boostLevel:number; order?:number; };

export default function ItemsPage(){
  const [cats,setCats]=useState<Cat[]>([]);
  const [items,setItems]=useState<Item[]>([]);
  const [filter,setFilter]=useState("");
  const [catFilter,setCatFilter]=useState("all");
  const [saving,setSaving]=useState<string|null>(null);
  const [newItem,setNewItem]=useState<any>({ name:"", price:"", categoryId:"", description:"", imageUrl:"", isBoosted:false, boostLevel:0, available:true });

  const load=async()=>{
    const [cRes,mRes] = await Promise.all([fetch("/api/admin/categories"), fetch("/api/admin/menu")]);
    const cData=await cRes.json();
    const mData=await mRes.json();
    const categories = cData.categories || mData.categories || [];
    setCats(categories);
    const allItems = mData.items || categories.flatMap((c:any) => (c.items||[]).map((it:any) => ({...it, category: { name: c.name, id: c.id } })));
    setItems(allItems);
    if(categories[0] &&!newItem.categoryId){
      setNewItem((p:any)=>({...p, categoryId:categories[0].id }));
    }
  };
  useEffect(()=>{ load(); },[]);

  const create=async()=>{
    if(!newItem.name ||!newItem.price ||!newItem.categoryId){ alert("Ime, cijena, kategorija obavezni"); return; }
    setSaving("new");
    const r=await fetch("/api/admin/menu",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...newItem, price:Number(newItem.price) }) });
    const j=await r.json();
    if(!r.ok){ alert(j.error); } else { await load(); setNewItem({ name:"", price:"", categoryId:cats[0]?.id||"", description:"", imageUrl:"", isBoosted:false, boostLevel:0, available:true }); }
    setSaving(null);
  };
  const save=async(it:Item)=>{
    setSaving(it.id);
    await fetch(`/api/admin/menu/${it.id}`,{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(it) });
    setSaving(null);
  };
  const del=async(id:string)=>{
    if(!confirm("Obrisati artikal?")) return;
    await fetch(`/api/admin/menu/${id}`,{method:"DELETE"});
    setItems((p)=>p.filter(x=>x.id!==id));
  };
  const filtered=items.filter((i)=>{ const matchName=i.name.toLowerCase().includes(filter.toLowerCase()); const matchCat=catFilter==="all" || i.categoryId===catFilter; return matchName && matchCat; });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Artikli</h1>
      <p className="text-sm text-gray-500 mb-6">Dodaj artikal sa slikom, cijenom i boostom.</p>
      <div className="border rounded-xl p-4 bg-gray-50 mb-6">
        <h3 className="font-bold mb-3">+ Novi artikal</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input placeholder="Naziv HR *" value={newItem.name} onChange={e=>setNewItem({...newItem, name:e.target.value })} className="border rounded px-3 py-2"/>
          <input placeholder="Cijena € *" type="number" step="0.1" value={newItem.price} onChange={e=>setNewItem({...newItem, price:e.target.value })} className="border rounded px-3 py-2"/>
          <select value={newItem.categoryId} onChange={e=>setNewItem({...newItem, categoryId:e.target.value })} className="border rounded px-3 py-2">
            {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="Slika URL" value={newItem.imageUrl} onChange={e=>setNewItem({...newItem, imageUrl:e.target.value })} className="border rounded px-3 py-2"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <textarea placeholder="Opis HR" value={newItem.description} onChange={e=>setNewItem({...newItem, description:e.target.value })} className="border rounded px-3 py-2" rows={2}/>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newItem.isBoosted} onChange={e=>setNewItem({...newItem, isBoosted:e.target.checked })}/> 🔥 Boost</label>
            {newItem.isBoosted && (<input type="number" placeholder="Boost level" value={newItem.boostLevel} onChange={e=>setNewItem({...newItem, boostLevel:Number(e.target.value) })} className="border rounded px-3 py-1 w-40"/>)}
          </div>
        </div>
        <button onClick={create} disabled={saving==="new"} className="mt-3 bg-black text-white px-6 py-2 rounded">{saving==="new"?"...":"Dodaj artikal"}</button>
      </div>
      <div className="flex gap-3 mb-4">
        <input placeholder="Traži..." value={filter} onChange={e=>setFilter(e.target.value)} className="border rounded px-3 py-2 w-64"/>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="border rounded px-3 py-2"><option value="all">Sve kategorije</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
      </div>
      <div className="space-y-2">
        {filtered.map((it)=>(
          <div key={it.id} className={`border rounded-xl p-3 bg-white flex gap-3 ${!it.available?"opacity-50":""}`}>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2">
              <input value={it.name} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,name:e.target.value}:x))} className="border rounded px-2 py-1 font-medium"/>
              <input type="number" step="0.1" value={it.price} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,price:Number(e.target.value)}:x))} className="border rounded px-2 py-1"/>
              <select value={it.categoryId} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,categoryId:e.target.value}:x))} className="border rounded px-2 py-1">{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <input value={it.imageUrl||""} placeholder="img url" onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,imageUrl:e.target.value}:x))} className="border rounded px-2 py-1 text-xs"/>
              <div className="flex gap-2 items-center">
                <label className="text-xs flex gap-1"><input type="checkbox" checked={it.available} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,available:e.target.checked}:x))}/> Dostupno</label>
                <label className="text-xs flex gap-1"><input type="checkbox" checked={it.isBoosted} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,isBoosted:e.target.checked}:x))}/> 🔥</label>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={()=>save(it)} disabled={saving===it.id} className="bg-black text-white px-3 py-1 rounded text-xs">Spremi</button>
              <button onClick={()=>del(it.id)} className="text-red-500 text-xs">Obriši</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
