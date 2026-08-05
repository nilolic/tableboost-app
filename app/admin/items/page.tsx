"use client";
import { useEffect, useState } from "react";

type Cat = { id:string; name:string; parentId?:string|null; order?:number };
type Item = { 
  id:string; name:string; nameEn?:string|null; nameDe?:string|null;
  description?:string|null; descriptionEn?:string|null; descriptionDe?:string|null;
  price:number; categoryId:string; category?:{name:string; id?:string}; 
  imageUrl?:string|null; available:boolean; isBoosted:boolean; boostLevel:number; order?:number;
};

export default function ItemsPage(){
  const [cats,setCats]=useState<Cat[]>([]); 
  const [items,setItems]=useState<Item[]>([]); 
  const [filter,setFilter]=useState(""); 
  const [catFilter,setCatFilter]=useState("all"); 
  const [saving,setSaving]=useState<string|null>(null);
  const [translatingId,setTranslatingId]=useState<string|null>(null);
  const [bulkTranslating,setBulkTranslating]=useState(false);
  const [newItem,setNewItem]=useState<any>({ name:"", nameEn:"", nameDe:"", price:"", categoryId:"", description:"", descriptionEn:"", descriptionDe:"", imageUrl:"", isBoosted:false, boostLevel:0, available:true });

  const parsePrice = (v:any)=>{ if(v===null||v===undefined||v==="") return NaN; const s = String(v).replace(",",".").trim(); return parseFloat(s) }

  const catMap = new Map(cats.map(c=>[c.id, c]));
  const getCatDisplay = (c:Cat)=>{
    if(c.parentId){
      const parent = catMap.get(c.parentId);
      return parent ? `${parent.name} > ${c.name}` : c.name;
    }
    return c.name;
  }
  const sortedCatsForSelect = [...cats].sort((a,b)=>{
    const aParent = a.parentId ? catMap.get(a.parentId)?.name || "" : "";
    const bParent = b.parentId ? catMap.get(b.parentId)?.name || "" : "";
    if(aParent!==bParent) return aParent.localeCompare(bParent);
    if(a.parentId && !b.parentId) return 1;
    if(!a.parentId && b.parentId) return -1;
    return (a.order||0)-(b.order||0) || a.name.localeCompare(b.name);
  });

  const load=async()=>{ 
    const [cRes,mRes] = await Promise.all([fetch("/api/admin/categories"), fetch("/api/admin/menu")]); 
    const cData=await cRes.json(); 
    const mData=await mRes.json(); 
    const categories = cData.all || cData.categories || mData.categories || []; 
    setCats(categories); 
    const allItems = mData.items || categories.flatMap((c:any) => (c.items||[]).map((it:any) => ({...it, category: { name: c.name, id: c.id } }))); 
    setItems(allItems); 
    if(categories.length>0 && !newItem.categoryId){ 
      // prefer subcategory if exists
      const sub = categories.find((c:any)=>c.parentId) || categories[0];
      setNewItem((p:any)=>({...p, categoryId:sub.id })); 
    } 
  }; 
  useEffect(()=>{ load(); },[]);

  const translateBatch = async (texts:string[], target:"EN"|"DE")=>{
    const res = await fetch("/api/admin/translate", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({texts, targetLang: target})});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||"Greška prijevoda");
    return data.translations as string[];
  }
  const translateOne = async (text:string, target:"EN"|"DE")=>{
    const res = await fetch("/api/admin/translate", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({text, targetLang: target})});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||"Greška prijevoda");
    return data.translated || data.translation;
  }

  const handleAutoTranslateNew = async()=>{
    if(!newItem.name.trim()){ alert("Prvo upiši naziv na HR"); return; }
    setTranslatingId("new");
    try{
      const toTranslate = [newItem.name];
      if(newItem.description?.trim()) toTranslate.push(newItem.description);
      const [enArr, deArr] = await Promise.all([
        translateBatch(toTranslate, "EN"),
        translateBatch(toTranslate, "DE")
      ]);
      setNewItem((p:any)=>({
        ...p,
        nameEn: enArr[0]||"",
        nameDe: deArr[0]||"",
        descriptionEn: toTranslate.length>1 ? enArr[1]||"" : p.descriptionEn,
        descriptionDe: toTranslate.length>1 ? deArr[1]||"" : p.descriptionDe,
      }));
    }catch(e:any){ alert(e.message); }
    setTranslatingId(null);
  }

  const handleTranslateItem = async (it:Item)=>{
    if(!it.name.trim()){ alert("Nema naziva na HR"); return; }
    setTranslatingId(it.id);
    try{
      const toTranslate = [it.name];
      const hasDesc = !!it.description?.trim();
      if(hasDesc) toTranslate.push(it.description!);
      const [enArr, deArr] = await Promise.all([
        translateBatch(toTranslate, "EN"),
        translateBatch(toTranslate, "DE")
      ]);
      setItems(p=>p.map(x=> x.id===it.id ? {
        ...x,
        nameEn: enArr[0]||"",
        nameDe: deArr[0]||"",
        descriptionEn: hasDesc ? enArr[1]||"" : x.descriptionEn,
        descriptionDe: hasDesc ? deArr[1]||"" : x.descriptionDe,
      } : x));
      // auto save
      await fetch(`/api/admin/menu/${it.id}`,{
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          nameEn: enArr[0]||"",
          nameDe: deArr[0]||"",
          ...(hasDesc ? {descriptionEn: enArr[1]||"", descriptionDe: deArr[1]||""} : {})
        })
      });
    }catch(e:any){ alert(e.message); }
    setTranslatingId(null);
  }

  const handleBulkTranslate = async()=>{
    const missing = items.filter(i=> !i.nameEn || !i.nameDe);
    if(missing.length===0){ alert("Svi artikli već imaju prijevode!"); return; }
    if(!confirm(`Prevesti ${missing.length} artikala koji nemaju prijevod?`)) return;
    setBulkTranslating(true);
    let done=0;
    for(const it of missing){
      try{
        const toTranslate = [it.name];
        if(it.description?.trim()) toTranslate.push(it.description!);
        const [enArr, deArr] = await Promise.all([
          translateBatch(toTranslate, "EN"),
          translateBatch(toTranslate, "DE")
        ]);
        await fetch(`/api/admin/menu/${it.id}`,{
          method:"PATCH", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            nameEn: enArr[0],
            nameDe: deArr[0],
            ...(toTranslate.length>1 ? {descriptionEn: enArr[1], descriptionDe: deArr[1]} : {})
          })
        });
        done++;
      }catch(e){ console.error(e); }
    }
    setBulkTranslating(false);
    alert(`Prevedeno ${done} artikala`);
    load();
  }

  const create=async()=>{
    const priceNum = parsePrice(newItem.price)
    if(!newItem.name || isNaN(priceNum) ||!newItem.categoryId){ alert("Ime, cijena (npr 13.50 ili 13,50), kategorija obavezni"); return; }
    setSaving("new");
    const r=await fetch("/api/admin/menu",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...newItem, price: priceNum }) });
    const j=await r.json();
    if(!r.ok){ alert(j.error||"Greška"); } else { await load(); setNewItem({ name:"", nameEn:"", nameDe:"", price:"", categoryId:cats[0]?.id||"", description:"", descriptionEn:"", descriptionDe:"", imageUrl:"", isBoosted:false, boostLevel:0, available:true }); }
    setSaving(null);
  };
  const save=async(it:Item)=>{ setSaving(it.id); const priceNum = parsePrice((it as any).price); if(isNaN(priceNum)){ alert("Neispravna cijena"); setSaving(null); return } await fetch(`/api/admin/menu/${it.id}`,{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...it, price: priceNum}) }); setSaving(null); };
  const del=async(id:string)=>{ if(!confirm("Obrisati artikal?")) return; await fetch(`/api/admin/menu/${id}`,{method:"DELETE"}); setItems((p)=>p.filter(x=>x.id!==id)); };
  const filtered=items.filter((i)=>{ const matchName=i.name.toLowerCase().includes(filter.toLowerCase()); const matchCat=catFilter==="all" || i.categoryId===catFilter; return matchName && matchCat; });

  const grouped = catFilter==="all" ? (()=>{ const g:Record<string, Item[]> = {}; filtered.forEach(it=>{ const key = getCatDisplay(catMap.get(it.categoryId) || {id:it.categoryId, name:it.category?.name||"Nepoznato"} as any); if(!g[key]) g[key]=[]; g[key].push(it); }); return g; })() : null;

  return (<div className="p-4 max-w-7xl mx-auto">
    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
      <div><h1 className="text-lg font-bold leading-tight">Artikli</h1><p className="text-xs text-neutral-500">{filtered.length} artikala • upiši 13.50 ili 13,50 • sada podržava podkategorije</p></div>
      <div className="flex gap-2">
        <input placeholder="Traži..." value={filter} onChange={e=>setFilter(e.target.value)} className="border rounded-full px-3 h-8 text-xs w-40"/>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="border rounded-full px-3 h-8 text-xs max-w-[180px]">
          <option value="all">Sve kategorije</option>
          {sortedCatsForSelect.map(c=><option key={c.id} value={c.id}>{getCatDisplay(c)}</option>)}
        </select>
        <button onClick={handleBulkTranslate} disabled={bulkTranslating} className="bg-purple-600 hover:bg-purple-700 text-white px-3 h-8 rounded-full text-xs font-bold">
          {bulkTranslating ? "..." : "🌐 Prevedi sve"}
        </button>
      </div>
    </div>

    <div className="bg-zinc-50 border rounded-xl p-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-bold uppercase tracking-wider">+ Novi artikal</div>
        <button onClick={handleAutoTranslateNew} disabled={translatingId==="new"} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-1 rounded-full text-[11px] font-bold">
          {translatingId==="new" ? "⏳ Prevodi..." : "🌐 Auto prevedi HR → EN + DE"}
        </button>
      </div>
      <div className="grid grid-cols-12 gap-2">
        <input placeholder="Naziv HR *" value={newItem.name} onChange={e=>setNewItem({...newItem, name:e.target.value })} className="col-span-6 md:col-span-3 border rounded-lg px-2 h-8 text-xs"/>
        <input placeholder="Name EN" value={newItem.nameEn} onChange={e=>setNewItem({...newItem, nameEn:e.target.value })} className="col-span-3 md:col-span-2 border rounded-lg px-2 h-8 text-xs bg-blue-50/50"/>
        <input placeholder="Name DE" value={newItem.nameDe} onChange={e=>setNewItem({...newItem, nameDe:e.target.value })} className="col-span-3 md:col-span-2 border rounded-lg px-2 h-8 text-xs bg-yellow-50/50"/>
        <input placeholder="€ npr 13.50 *" inputMode="decimal" value={newItem.price} onChange={e=>setNewItem({...newItem, price:e.target.value })} className="col-span-4 md:col-span-2 border rounded-lg px-2 h-8 text-xs"/>
        <select value={newItem.categoryId} onChange={e=>setNewItem({...newItem, categoryId:e.target.value })} className="col-span-6 md:col-span-3 border rounded-lg px-2 h-8 text-xs">
          {sortedCatsForSelect.map(c=><option key={c.id} value={c.id}>{getCatDisplay(c)}</option>)}
        </select>
        <button onClick={create} disabled={saving==="new"} className="col-span-2 bg-black text-white h-8 rounded-full text-xs">{saving==="new"?"...":"Dodaj"}</button>
        <input placeholder="Opis HR" value={newItem.description} onChange={e=>setNewItem({...newItem, description:e.target.value })} className="col-span-12 md:col-span-4 border rounded-lg px-2 h-8 text-xs"/>
        <input placeholder="Description EN" value={newItem.descriptionEn} onChange={e=>setNewItem({...newItem, descriptionEn:e.target.value })} className="col-span-6 md:col-span-4 border rounded-lg px-2 h-8 text-xs bg-blue-50/30"/>
        <input placeholder="Beschreibung DE" value={newItem.descriptionDe} onChange={e=>setNewItem({...newItem, descriptionDe:e.target.value })} className="col-span-6 md:col-span-4 border rounded-lg px-2 h-8 text-xs bg-yellow-50/30"/>
      </div>
    </div>

    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b">
        <div className="col-span-3">Naziv (HR / EN / DE)</div>
        <div className="col-span-1">Cijena</div>
        <div className="col-span-3">Kategorija / Opis</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3 text-right">Akcija</div>
      </div>
      <div className="divide-y divide-black/[0.04] max-h-[70vh] overflow-auto">
        {catFilter==="all" && grouped ? Object.entries(grouped).map(([catName, catItems])=>(
          <div key={catName}>
            <div className="px-3 py-1.5 bg-zinc-100 text-[11px] font-bold sticky top-0">{catName} ({catItems.length})</div>
            {catItems.map((it)=>(
              <ItemRow key={it.id} it={it} cats={sortedCatsForSelect} getCatDisplay={getCatDisplay} saving={saving} translatingId={translatingId} setItems={setItems} save={save} del={del} handleTranslate={handleTranslateItem} />
            ))}
          </div>
        )) : filtered.map((it)=>(
          <ItemRow key={it.id} it={it} cats={sortedCatsForSelect} getCatDisplay={getCatDisplay} saving={saving} translatingId={translatingId} setItems={setItems} save={save} del={del} handleTranslate={handleTranslateItem} />
        ))}
      </div>
    </div>
  </div>);
}

function ItemRow({it, cats, getCatDisplay, saving, translatingId, setItems, save, del, handleTranslate}: any){
  const hasTranslation = it.nameEn && it.nameDe;
  return (
    <div className={`grid grid-cols-12 gap-2 px-3 py-2 items-center hover:bg-zinc-50 ${!it.available?"opacity-50":""}`}>
      <div className="col-span-3 space-y-1">
        <input value={it.name} onChange={e=>setItems((p:any)=>p.map((x:any)=>x.id===it.id?{...x,name:e.target.value}:x))} placeholder="HR" className="w-full border rounded-lg px-2 h-6 text-[11px] font-medium"/>
        <div className="flex gap-1">
          <input value={it.nameEn||""} onChange={e=>setItems((p:any)=>p.map((x:any)=>x.id===it.id?{...x,nameEn:e.target.value}:x))} placeholder="EN" className="w-1/2 border rounded px-1.5 h-5 text-[10px] bg-blue-50/50"/>
          <input value={it.nameDe||""} onChange={e=>setItems((p:any)=>p.map((x:any)=>x.id===it.id?{...x,nameDe:e.target.value}:x))} placeholder="DE" className="w-1/2 border rounded px-1.5 h-5 text-[10px] bg-yellow-50/50"/>
        </div>
      </div>
      <div className="col-span-1 flex items-center gap-1"><span className="text-[10px] text-neutral-400">€</span><input inputMode="decimal" value={(it as any).price} onChange={e=>setItems((p:any)=>p.map((x:any)=>x.id===it.id?{...x,price:e.target.value as any}:x))} className="w-full border rounded-lg px-1 h-6 text-xs"/></div>
      <div className="col-span-3 space-y-1">
        <select value={it.categoryId} onChange={e=>setItems((p:any)=>p.map((x:any)=>x.id===it.id?{...x,categoryId:e.target.value}:x))} className="w-full border rounded-lg px-1 h-5 text-[10px]">{cats.map((c:any)=><option key={c.id} value={c.id}>{getCatDisplay(c)}</option>)}</select>
        <input value={it.description||""} onChange={e=>setItems((p:any)=>p.map((x:any)=>x.id===it.id?{...x,description:e.target.value}:x))} placeholder="Opis HR" className="w-full border rounded px-1.5 h-5 text-[10px]"/>
      </div>
      <div className="col-span-2 flex gap-2 items-center flex-wrap">
        <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked={it.available} onChange={e=>setItems((p:any)=>p.map((x:any)=>x.id===it.id?{...x,available:e.target.checked}:x))} className="w-3 h-3"/>Dost.</label>
        <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked={it.isBoosted} onChange={e=>setItems((p:any)=>p.map((x:any)=>x.id===it.id?{...x,isBoosted:e.target.checked}:x))} className="w-3 h-3"/>🔥</label>
        {!hasTranslation && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 rounded-full">bez prijevoda</span>}
      </div>
      <div className="col-span-3 flex gap-1 justify-end">
        <button onClick={()=>handleTranslate(it)} disabled={translatingId===it.id} className="bg-purple-600 text-white px-2 h-6 rounded-full text-[10px] font-bold disabled:opacity-50">{translatingId===it.id?"...":"🌐"}</button>
        <button onClick={()=>save(it)} disabled={saving===it.id} className="bg-black text-white px-2.5 h-6 rounded-full text-[10px]">{saving===it.id?"...":"Spremi"}</button>
        <button onClick={()=>del(it.id)} className="border px-2 h-6 rounded-full text-[10px] text-red-600">X</button>
      </div>
    </div>
  )
}
