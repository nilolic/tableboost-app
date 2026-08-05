import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";"use client";
import { useEffect, useState, useRef } from "react";

type Cat = { id:string; name:string; parentId?:string|null; order?:number };
type Item = { 
  id:string; name:string; nameEn?:string|null; nameDe?:string|null;
  description?:string|null; descriptionEn?:string|null; descriptionDe?:string|null;
  price:number; categoryId:string; category?:{name:string; id?:string}; 
  imageUrl?:string|null; available:boolean; isBoosted:boolean; boostLevel:number; order?:number;
  allergens?:string|null; allergensNote?:string|null; allergensNoteEn?:string|null; allergensNoteDe?:string|null;
};

const ALLERGENS = [
  {id:"1", label:"1. Gluten", desc:"pšenica, raž, ječam..."},
  {id:"2", label:"2. Rakovi", desc:"rakovi, škampi..."},
  {id:"3", label:"3. Jaja", desc:""},
  {id:"4", label:"4. Riba", desc:""},
  {id:"5", label:"5. Kikiriki", desc:""},
  {id:"6", label:"6. Soja", desc:""},
  {id:"7", label:"7. Mlijeko", desc:"laktoza"},
  {id:"8", label:"8. Orašasti", desc:"badem, lješnjak..."},
  {id:"9", label:"9. Celer", desc:""},
  {id:"10", label:"10. Gorušica", desc:""},
  {id:"11", label:"11. Sezam", desc:""},
  {id:"12", label:"12. Sulfiti", desc:"SO2"},
  {id:"13", label:"13. Lupine", desc:""},
  {id:"14", label:"14. Mekušci", desc:"školjke..."},
];

export default function ItemsPage(){const searchParams = useSearchParams();
  const [cats,setCats]=useState<Cat[]>([]); 
  const [items,setItems]=useState<Item[]>([]); 
  const [filter,setFilter]=useState(""); 
  const [catFilter,setCatFilter]=useState("all"); 
  const [saving,setSaving]=useState<string|null>(null);
  const [translatingId,setTranslatingId]=useState<string|null>(null);
  const [bulkTranslating,setBulkTranslating]=useState(false);
  const [uploading,setUploading]=useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newItem,setNewItem]=useState<any>({ 
    name:"", nameEn:"", nameDe:"", price:"", categoryId:"", 
    description:"", descriptionEn:"", descriptionDe:"", 
    imageUrl:"", isBoosted:false, boostLevel:0, available:true,
    allergens:"", allergensNote:"", allergensNoteEn:"", allergensNoteDe:""
  });
  const [showAllergensNew,setShowAllergensNew]=useState(false);
  const [editingAllergens,setEditingAllergens]=useState<string|null>(null);

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
      const sub = categories.find((c:any)=>c.parentId) || categories[0];
      setNewItem((p:any)=>({...p, categoryId:sub.id })); 
    } 
  }; 
  useEffect(()=>{ load(); },[]);
  useEffect(()=>{
    const cat = searchParams.get("cat");
    if(cat) setCatFilter(cat);
  }, [searchParams]);
  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "menu");
    const res = await fetch("/api/admin/upload", {method:"POST", body: fd});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||"Upload greška");
    return data.url;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: "new" | string)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    setUploading(true);
    try{
      const url = await uploadImage(file);
      if(target==="new"){
        setNewItem((p:any)=>({...p, imageUrl: url}));
      } else {
        setItems(p=>p.map(x=> x.id===target ? {...x, imageUrl: url} : x));
      }
    }catch(err:any){ alert(err.message); }
    setUploading(false);
    if(fileRef.current) fileRef.current.value="";
  }

  const toggleAllergen = (current:string, id:string): string => {
    const arr = current ? current.split(",").filter(Boolean) : [];
    if(arr.includes(id)) return arr.filter(x=>x!==id).join(",");
    else return [...arr, id].sort((a,b)=>Number(a)-Number(b)).join(",");
  }

  const translateBatch = async (texts:string[], target:"EN"|"DE")=>{
    const res = await fetch("/api/admin/translate", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({texts, targetLang: target})});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||"Greška prijevoda");
    return data.translations as string[];
  }

  const handleAutoTranslateNew = async()=>{
    if(!newItem.name.trim()){ alert("Prvo upiši naziv na HR"); return; }
    setTranslatingId("new");
    try{
      const toTranslate = [newItem.name];
      if(newItem.description?.trim()) toTranslate.push(newItem.description);
      if(newItem.allergensNote?.trim()) toTranslate.push(newItem.allergensNote);
      const [enArr, deArr] = await Promise.all([
        translateBatch(toTranslate, "EN"),
        translateBatch(toTranslate, "DE")
      ]);
      setNewItem((p:any)=>({
        ...p,
        nameEn: enArr[0]||"",
        nameDe: deArr[0]||"",
        descriptionEn: toTranslate.length>1 && newItem.description ? enArr[1]||"" : p.descriptionEn,
        descriptionDe: toTranslate.length>1 && newItem.description ? deArr[1]||"" : p.descriptionDe,
        allergensNoteEn: newItem.allergensNote ? (newItem.description ? enArr[2]||"" : enArr[1]||"") : p.allergensNoteEn,
        allergensNoteDe: newItem.allergensNote ? (newItem.description ? deArr[2]||"" : deArr[1]||"") : p.allergensNoteDe,
      }));
    }catch(e:any){ alert(e.message); }
    setTranslatingId(null);
  }

  const handleTranslateItem = async (it:Item)=>{
    if(!it.name.trim()){ alert("Nema naziva na HR"); return; }
    setTranslatingId(it.id);
    try{
      const toTranslate = [it.name];
      if(it.description?.trim()) toTranslate.push(it.description!);
      if(it.allergensNote?.trim()) toTranslate.push(it.allergensNote!);
      const [enArr, deArr] = await Promise.all([
        translateBatch(toTranslate, "EN"),
        translateBatch(toTranslate, "DE")
      ]);
      const update:any = {
        nameEn: enArr[0]||"",
        nameDe: deArr[0]||"",
      };
      if(it.description) {
        update.descriptionEn = enArr[1]||"";
        update.descriptionDe = deArr[1]||"";
        if(it.allergensNote){
          update.allergensNoteEn = enArr[2]||"";
          update.allergensNoteDe = deArr[2]||"";
        }
      } else if(it.allergensNote){
        update.allergensNoteEn = enArr[1]||"";
        update.allergensNoteDe = deArr[1]||"";
      }
      setItems(p=>p.map(x=> x.id===it.id ? {...x, ...update} : x));
      await fetch(`/api/admin/menu/${it.id}`,{method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(update)});
    }catch(e:any){ alert(e.message); }
    setTranslatingId(null);
  }

  const create=async()=>{
    const priceNum = parsePrice(newItem.price)
    if(!newItem.name || isNaN(priceNum) ||!newItem.categoryId){ alert("Ime, cijena (npr 13.50 ili 13,50), kategorija obavezni"); return; }
    setSaving("new");
    const r=await fetch("/api/admin/menu",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...newItem, price: priceNum }) });
    const j=await r.json();
    if(!r.ok){ alert(j.error||"Greška"); } else { await load(); setNewItem({ name:"", nameEn:"", nameDe:"", price:"", categoryId:cats[0]?.id||"", description:"", descriptionEn:"", descriptionDe:"", imageUrl:"", isBoosted:false, boostLevel:0, available:true, allergens:"", allergensNote:"", allergensNoteEn:"", allergensNoteDe:"" }); setShowAllergensNew(false); }
    setSaving(null);
  };
  const save=async(it:Item)=>{ setSaving(it.id); const priceNum = parsePrice((it as any).price); if(isNaN(priceNum)){ alert("Neispravna cijena"); setSaving(null); return } await fetch(`/api/admin/menu/${it.id}`,{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...it, price: priceNum}) }); setSaving(null); };
  const del=async(id:string)=>{ if(!confirm("Obrisati artikal?")) return; await fetch(`/api/admin/menu/${id}`,{method:"DELETE"}); setItems((p)=>p.filter(x=>x.id!==id)); };
  const filtered=items.filter((i)=>{ const matchName=i.name.toLowerCase().includes(filter.toLowerCase()); const matchCat=catFilter==="all" || i.categoryId===catFilter; return matchName && matchCat; });

  return (<div className="p-4 max-w-7xl mx-auto">
    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e)=> {
      const target = (e.target as any)._target as string;
      handleFileChange(e as any, target||"new");
    }} />
    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
      <div><h1 className="text-lg font-bold leading-tight">Artikli</h1><p className="text-xs text-neutral-500">{filtered.length} artikala • podržava slike, alergene, prijevode i podkategorije</p></div>
      <div className="flex gap-2">
        <input placeholder="Traži..." value={filter} onChange={e=>setFilter(e.target.value)} className="border rounded-full px-3 h-8 text-xs w-32"/>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="border rounded-full px-3 h-8 text-xs max-w-[160px]">
          <option value="all">Sve kategorije</option>
          {sortedCatsForSelect.map(c=><option key={c.id} value={c.id}>{getCatDisplay(c)}</option>)}
        </select>
      </div>
    </div>

    <div className="bg-zinc-50 border rounded-xl p-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-bold uppercase tracking-wider">+ Novi artikal</div>
        <button onClick={handleAutoTranslateNew} disabled={translatingId==="new"} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-1 rounded-full text-[11px] font-bold">
          {translatingId==="new" ? "⏳ Prevodi..." : "🌐 Auto prevedi"}
        </button>
      </div>
      <div className="grid grid-cols-12 gap-2">
        <input placeholder="Naziv HR *" value={newItem.name} onChange={e=>setNewItem({...newItem, name:e.target.value })} className="col-span-6 md:col-span-3 border rounded-lg px-2 h-9 text-xs font-medium"/>
        <input placeholder="Name EN" value={newItem.nameEn} onChange={e=>setNewItem({...newItem, nameEn:e.target.value })} className="col-span-3 md:col-span-2 border rounded-lg px-2 h-9 text-xs bg-blue-50/50"/>
        <input placeholder="Name DE" value={newItem.nameDe} onChange={e=>setNewItem({...newItem, nameDe:e.target.value })} className="col-span-3 md:col-span-2 border rounded-lg px-2 h-9 text-xs bg-yellow-50/50"/>
        <input placeholder="€ 13.50 *" inputMode="decimal" value={newItem.price} onChange={e=>setNewItem({...newItem, price:e.target.value })} className="col-span-4 md:col-span-1 border rounded-lg px-2 h-9 text-xs"/>
        <select value={newItem.categoryId} onChange={e=>setNewItem({...newItem, categoryId:e.target.value })} className="col-span-8 md:col-span-3 border rounded-lg px-2 h-9 text-xs">
          {sortedCatsForSelect.map(c=><option key={c.id} value={c.id}>{getCatDisplay(c)}</option>)}
        </select>
        <button onClick={create} disabled={saving==="new"} className="col-span-12 md:col-span-1 bg-black text-white h-9 rounded-full text-xs font-bold">{saving==="new"?"...":"Dodaj"}</button>
        
        <div className="col-span-12 grid grid-cols-12 gap-2">
          <div className="col-span-12 md:col-span-6 flex gap-2">
            <input placeholder="Opis HR" value={newItem.description} onChange={e=>setNewItem({...newItem, description:e.target.value })} className="flex-1 border rounded-lg px-2 h-9 text-xs"/>
            {newItem.imageUrl ? (
              <div className="flex items-center gap-1 border rounded-lg px-2 h-9 bg-white">
                <img src={newItem.imageUrl} className="w-6 h-6 object-cover rounded" />
                <button onClick={()=>setNewItem({...newItem, imageUrl:""})} className="text-[10px] text-red-600">X</button>
              </div>
            ): null}
            <button onClick={()=>{
              const inp = document.createElement("input"); inp.type="file"; inp.accept="image/*";
              inp.onchange = async (ev:any)=>{
                const file = ev.target.files[0]; if(!file) return;
                setUploading(true);
                try{ const url = await uploadImage(file); setNewItem((p:any)=>({...p, imageUrl:url})); }catch(e:any){alert(e.message)} setUploading(false);
              }; inp.click();
            }} className="border bg-white px-3 h-9 rounded-lg text-xs whitespace-nowrap">{uploading?"...":"📷 Slika"}</button>
          </div>
          <input placeholder="Description EN" value={newItem.descriptionEn} onChange={e=>setNewItem({...newItem, descriptionEn:e.target.value })} className="col-span-6 md:col-span-3 border rounded-lg px-2 h-9 text-xs bg-blue-50/30"/>
          <input placeholder="Beschreibung DE" value={newItem.descriptionDe} onChange={e=>setNewItem({...newItem, descriptionDe:e.target.value })} className="col-span-6 md:col-span-3 border rounded-lg px-2 h-9 text-xs bg-yellow-50/30"/>
        </div>

        <div className="col-span-12">
          <button onClick={()=>setShowAllergensNew(!showAllergensNew)} className="text-[11px] text-neutral-600 underline">{showAllergensNew ? "Sakrij alergene ▲" : "▼ Alergeni i napomene"}</button>
          {showAllergensNew && (
            <div className="mt-2 border rounded-xl bg-white p-3">
              <div className="text-[11px] font-bold mb-2">EU Alergeni (14) - označi prisutne:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                {ALLERGENS.map(a=>{
                  const active = (newItem.allergens||"").split(",").includes(a.id);
                  return (
                    <label key={a.id} className={`flex items-center gap-1.5 border rounded-lg px-2 py-1.5 cursor-pointer text-[11px] ${active?"bg-orange-50 border-orange-300":"bg-white"}`}>
                      <input type="checkbox" checked={active} onChange={e=> setNewItem((p:any)=>({...p, allergens: toggleAllergen(p.allergens||"", a.id)}))} className="w-3 h-3" />
                      <span className="font-medium">{a.label}</span>
                    </label>
                  )
                })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                <input placeholder="Napomena HR npr. Sadrži gluten u tragovima" value={newItem.allergensNote} onChange={e=>setNewItem({...newItem, allergensNote:e.target.value})} className="border rounded-lg px-2 h-8 text-xs"/>
                <input placeholder="Note EN" value={newItem.allergensNoteEn} onChange={e=>setNewItem({...newItem, allergensNoteEn:e.target.value})} className="border rounded-lg px-2 h-8 text-xs bg-blue-50/30"/>
                <input placeholder="Notiz DE" value={newItem.allergensNoteDe} onChange={e=>setNewItem({...newItem, allergensNoteDe:e.target.value})} className="border rounded-lg px-2 h-8 text-xs bg-yellow-50/30"/>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b">
        <div className="col-span-4">Naziv + Slika</div>
        <div className="col-span-2">Cijena / Kategorija</div>
        <div className="col-span-3">Opis / Alergeni</div>
        <div className="col-span-3 text-right">Akcija</div>
      </div>
      <div className="divide-y divide-black/[0.04] max-h-[70vh] overflow-auto">
        {filtered.map((it)=>{
          const allergensArr = (it.allergens||"").split(",").filter(Boolean);
          return (
          <div key={it.id} className={`grid grid-cols-12 gap-2 px-3 py-2.5 items-start hover:bg-zinc-50 ${!it.available?"opacity-50":""}`}>
            <div className="col-span-4 space-y-1">
              <div className="flex gap-2 items-start">
                {it.imageUrl ? <img src={it.imageUrl} className="w-10 h-10 object-cover rounded-lg border flex-shrink-0" /> : <div className="w-10 h-10 bg-zinc-100 rounded-lg border flex items-center justify-center text-[10px]">no img</div>}
                <div className="flex-1 space-y-1">
                  <input value={it.name} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,name:e.target.value}:x))} placeholder="HR" className="w-full border rounded-lg px-2 h-6 text-[11px] font-medium"/>
                  <div className="flex gap-1">
                    <input value={it.nameEn||""} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,nameEn:e.target.value}:x))} placeholder="EN" className="w-1/2 border rounded px-1.5 h-5 text-[10px] bg-blue-50/50"/>
                    <input value={it.nameDe||""} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,nameDe:e.target.value}:x))} placeholder="DE" className="w-1/2 border rounded px-1.5 h-5 text-[10px] bg-yellow-50/50"/>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-2 space-y-1">
              <div className="flex items-center gap-1"><span className="text-[10px] text-neutral-400">€</span><input inputMode="decimal" value={(it as any).price} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,price:e.target.value as any}:x))} className="w-20 border rounded-lg px-1 h-6 text-xs"/></div>
              <select value={it.categoryId} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,categoryId:e.target.value}:x))} className="w-full border rounded-lg px-1 h-6 text-[10px]">{sortedCatsForSelect.map((c:any)=><option key={c.id} value={c.id}>{getCatDisplay(c)}</option>)}</select>
              <div className="flex gap-1">
                <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked={it.available} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,available:e.target.checked}:x))} className="w-3 h-3"/>Dost.</label>
                <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked={it.isBoosted} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,isBoosted:e.target.checked}:x))} className="w-3 h-3"/>🔥</label>
              </div>
            </div>
            <div className="col-span-3 space-y-1">
              <input value={it.description||""} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,description:e.target.value}:x))} placeholder="Opis HR" className="w-full border rounded px-1.5 h-5 text-[10px]"/>
              <div className="flex gap-1">
                <button onClick={()=>setEditingAllergens(editingAllergens===it.id?null:it.id)} className="text-[10px] border rounded-full px-2 h-5 bg-white">
                  {allergensArr.length>0 ? `⚠️ ${allergensArr.join(",")}` : "+ alergeni"}
                </button>
                <span className="text-[10px] text-neutral-400 truncate">{it.allergensNote||""}</span>
              </div>
              {editingAllergens===it.id && (
                <div className="border rounded-lg bg-zinc-50 p-2 space-y-2">
                  <div className="grid grid-cols-2 gap-1">
                    {ALLERGENS.map(a=>{
                      const active = allergensArr.includes(a.id);
                      return (
                        <label key={a.id} className={`flex gap-1 items-center text-[10px] px-1 py-0.5 rounded ${active?"bg-orange-100":""}`}>
                          <input type="checkbox" checked={active} onChange={()=> setItems(p=>p.map(x=> x.id===it.id ? {...x, allergens: toggleAllergen(x.allergens||"", a.id)} : x))} className="w-3 h-3" />
                          {a.label}
                        </label>
                      )
                    })}
                  </div>
                  <input value={it.allergensNote||""} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,allergensNote:e.target.value}:x))} placeholder="Napomena HR" className="w-full border rounded px-1.5 h-6 text-[10px]"/>
                </div>
              )}
            </div>
            <div className="col-span-3 flex gap-1 justify-end flex-wrap">
              <button onClick={()=>{
                const inp = document.createElement("input"); inp.type="file"; inp.accept="image/*";
                inp.onchange = async (ev:any)=>{
                  const file = ev.target.files[0]; if(!file) return;
                  setUploading(true);
                  try{ 
                    const fd = new FormData(); fd.append("file", file); fd.append("type","menu");
                    const res = await fetch("/api/admin/upload",{method:"POST", body:fd});
                    const data = await res.json();
                    if(!res.ok) throw new Error(data.error);
                    setItems(p=>p.map(x=> x.id===it.id ? {...x, imageUrl:data.url}:x));
                    await fetch(`/api/admin/menu/${it.id}`,{method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({imageUrl:data.url})});
                  }catch(e:any){alert(e.message)} setUploading(false);
                }; inp.click();
              }} className="border bg-white px-2 h-6 rounded-full text-[10px]">{it.imageUrl?"🖼️":"📷"}</button>
              <button onClick={()=>handleTranslateItem(it)} disabled={translatingId===it.id} className="bg-purple-600 text-white px-2 h-6 rounded-full text-[10px] font-bold disabled:opacity-50">{translatingId===it.id?"...":"🌐"}</button>
              <button onClick={()=>save(it)} disabled={saving===it.id} className="bg-black text-white px-2.5 h-6 rounded-full text-[10px]">{saving===it.id?"...":"Spremi"}</button>
              <button onClick={()=>del(it.id)} className="border px-2 h-6 rounded-full text-[10px] text-red-600">X</button>
            </div>
          </div>
        )})}
      </div>
    </div>
  </div>);
}
