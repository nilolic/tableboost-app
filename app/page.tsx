"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  QrCode,
  ChefHat,
  Smartphone,
  Euro,
  Sparkles,
  Check,
  Clock3,
  ShieldCheck,
  Heart,
  Menu,
  X,
  Timer,
  UtensilsCrossed,
  LayoutGrid,
  BarChart3,
  Zap,
  Users,
  Flame,
  Crown,
  Soup,
} from "lucide-react";

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("kako-radi");

  useEffect(() => {
    const sections = ["kako-radi", "zarada", "funkcionalnosti", "uloge"];
    const onScroll = () => {
      const y = window.scrollY + 140;
      let current = sections[0];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { id: "kako-radi", label: "Kako radi" },
    { id: "zarada", label: "Zarada" },
    { id: "funkcionalnosti", label: "Funkcionalnosti" },
    { id: "uloge", label: "Uloge" },
  ];

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    setActive(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      try { history.replaceState(null, "", `#${id}`); } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-zinc-900 selection:bg-emerald-200/60 antialiased overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-[#FFFEFB]/80 backdrop-blur- w-full max-w- overflow-hidden">
        <div className="mx-auto flex h- max-w- items-center justify-between px-5 lg:px-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_6px_18px_rgba(16,185,129,0.35)] grid place-items-center">
              <div className="h- w- rounded-full bg-white shadow-inner" />
            </div>
            <span className="text- font-extrabold tracking-[-0.02em]">TableBoost<span className="font-medium text-zinc-400">.app</span></span>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className={`text- font-medium tracking-tight transition-colors hover:text-zinc-900 ${active === n.id? "text-zinc-900" : "text-zinc-500"}`}>
                <span className="relative">
                  {n.label}
                  {active === n.id && <span className="absolute -bottom- left-0 h- w-full rounded-full bg-zinc-900" />}
                </span>
              </button>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            <a href="/login" className="h-10 rounded-full bg-zinc-900 px-5 text- font-semibold text-white hover:bg-black transition flex items-center">Prijava</a>
            <a href="/login" className="group h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 px-5 text- font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] flex items-center gap-1.5">Pokreni besplatno <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></a>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden grid h-10 w-10 place-items-center rounded-full bg-zinc-900 text-white"><{mobileOpen? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />} /></button>
        </div>
        {mobileOpen && (
          <div className="lg:hidden border-t border-zinc-200 bg-[#FFFEFB] px-5 pb-6 pt-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-1">
              {navItems.map((n) => (
                <button key={n.id} onClick={() => scrollTo(n.id)} className={`flex h-12 items-center rounded-2xl px-4 text- font-medium text-left ${active === n.id? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}>{n.label}</button>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <a href="/login" className="h-12 grid place-items-center rounded-full bg-zinc-900 text-sm font-semibold text-white">Prijava</a>
                <a href="/login" className="h-12 grid place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow">Pokreni besplatno</a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h- w- rounded-full bg-emerald-200/40 blur-" />
          <div className="absolute -top-10 right-[-80px] h- w- rounded-full bg-amber-200/50 blur-" />
          <div className="absolute top- left-[40%] h- w- rounded-full bg-violet-200/40 blur-" />
        </div>
        <div className="relative mx-auto max-w- px-5 lg:px-6 pt-14 lg:pt-24 pb-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm text- font-semibold"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />Novo • KDS v2 LIVE sinkronizacija</div>
            <h1 className="mt-6 text- lg:text- font-[900] leading-[0.95] tracking-tight">Restoran koji<br />radi <span className="bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">brže.</span></h1>
            <p className="mt-5 text- lg:text- leading-7 text-zinc-600 max-w-2xl mx-auto">QR jelovnik + KDS kuhinja + konobar app. Gosti naručuju sami, kuhinja vidi sve LIVE, konobar ne trči bezveze. Postavka za 15 minuta.</p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/login" className="px-7 py-3.5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text- shadow-[0_12px_28px_rgba(16,185,129,0.35)] inline-flex items-center justify-center gap-2">Pokreni besplatno <ArrowRight size={18} /></a>
              <a href="#zarada" className="px-7 py-3.5 rounded-full bg-white border border-zinc-200 font-semibold text- hover:bg-zinc-50 transition">Kako zarađuješ više?</a>
            </div>
            <p className="mt-3 text- text-zinc-500">Bez kartice • 14 dana free • Otkazuješ kad hoćeš</p>
          </div>

          <div className="mt-14 lg:mt-20 grid lg:grid-cols-[280px_1fr_300px] gap-6 max-w-5xl mx-auto items-end">
            <div className="rounded- bg-gradient-to-br from-amber-400 to-orange-400 p- shadow-[0_20px_50px_rgba(251,146,60,0.25)]">
              <div className="rounded- bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                <div className="flex items-center justify-between"><div className="h-2 w-8 rounded-full bg-amber-300" /><div className="h-6 w-6 rounded-full bg-zinc-900 text-white grid place-items-center text- font-bold">5</div></div>
                <div className="mt-6 mx-auto h- w- rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 grid place-items-center shadow-inner">
                  <div className="grid h- w- grid-cols-5 gap-">{Array.from({length:25}).map((_,i)=><div key={i} className={`rounded- ${[0,1,3,4,5,9,10,14,15,19,20,21,23,24].includes(i)?"bg-white":i%3===0?"bg-amber-300":"bg-white/90"}`} />)}</div>
                </div>
                <div className="mt-4"><div className="h-3 w-3/4 rounded-full bg-zinc-900" /><div className="mt-2 h-2.5 w-1/2 rounded-full bg-zinc-300" /></div>
                <div className="mt-4 h-9 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 grid place-items-center text- font-bold text-white">Skeniraj & naruči</div>
              </div>
            </div>
            <div className="rounded- bg-[#0f1214] border border-zinc-800 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between rounded- bg-white/[0.06] px-4 py-2.5">
                <div className="flex items-center gap-2.5"><div className="h-7 w-7 rounded-full bg-emerald-500 grid place-items-center"><UtensilsCrossed size={14} className="text-white" /></div><span className="text- font-semibold tracking-wide text-white">KUHINJA • LIVE</span><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /></div>
                <div className="flex gap-1"><div className="h-2 w-2 rounded-full bg-white/20" /><div className="h-2 w-2 rounded-full bg-white/20" /><div className="h-2 w-2 rounded-full bg-emerald-400" /></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded- border-[1.5px] border-amber-400/80 bg-[#1a1e22] p-3"><div className="flex justify-between"><span className="rounded-full bg-amber-400 px-2 py-0.5 text- font-bold">STOL 12</span><span className="text- text-amber-300">02:14</span></div><div className="mt-2.5 text- text-zinc-200"><span className="font-bold">2x</span> Ćevapi</div><div className="mt-3 h-7 rounded-full bg-amber-400 grid place-items-center text- font-bold text-zinc-900">U PRIPREMI</div></div>
                <div className="rounded- border border-emerald-500/30 bg-[#17201c] p-3"><div className="flex justify-between"><span className="rounded-full bg-emerald-500 px-2 py-0.5 text- font-bold text-white">STOL 5</span><span className="text- text-emerald-300">00:32</span></div><div className="mt-2.5 text- text-white"><span className="font-bold">1x</span> Pizza Margherita</div><div className="mt-3 h-7 rounded-full bg-white grid place-items-center text- font-bold">Gotovo</div></div>
              </div>
            </div>
            <div className="rounded- border- border-zinc-900 bg-zinc-900 p-2 shadow-[0_24px_64px_rgba(124,58,237,0.22)]">
              <div className="overflow-hidden rounded- bg-white">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-4 pb-3 pt-4 text-white"><div className="flex justify-between"><span className="text- font-semibold opacity-80">KONOBAR • MARKO</span><div className="h-6 w-6 rounded-full bg-white/20" /></div><div className="mt-3 text- font-bold leading-tight">Pozdrav, Marko 👋<br /><span className="text- font-medium opacity-80">3 aktivna stola</span></div></div>
                <div className="space-y-2.5 p-3">{[{s:"STOL 5",d:"Pizza + 2 pića",c:"amber"},{s:"STOL 12",d:"Ćevapi u pripremi",c:"emerald"},{s:"STOL 3",d:"Spremno za račun",c:"violet"}].map(i=><div key={i.s} className={`flex items-center gap-3 rounded-2xl border p-2.5 ${i.c==="amber"?"border-amber-200 bg-amber-50":i.c==="emerald"?"border-emerald-200 bg-emerald-50":"border-violet-200 bg-violet-50"}`}><div className={`h-9 w-9 rounded-full grid place-items-center text- font-bold text-white ${i.c==="amber"?"bg-amber-500":i.c==="emerald"?"bg-emerald-500":"bg-violet-500"}`}>{i.s.split(" ")[1]}</div><div className="flex-1"><div className="text- font-semibold">{i.s} • {i.d}</div><div className="text- text-zinc-500">{i.c}</div></div></div>)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KAKO RADI */}
      <section id="kako-radi" className="bg-white">
        <div className="mx-auto max-w- px-5 lg:px-6 py-20 lg:py-28">
          <div className="mx-auto max-w- text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text- font-bold tracking-widest text-white">KAKO RADI</div>
            <h2 className="text- font-extrabold tracking-tight sm:text-">Od QR-a do kuhinje u 3 koraka</h2>
            <p className="mt-3 text- leading-6 text-zinc-500">Bez učenja. Gost skenira, kuhinja vidi, konobar zna.</p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <div className="rounded- border border-amber-200/60 bg-gradient-to-b from-amber-50 to-white p-7"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white"><QrCode size={22}/></div><h3 className="mt-6 text- font-bold">Gost skenira</h3><p className="mt-2 text- text-zinc-600">QR na stolu otvara jelovnik na jeziku gosta. Narudžba ide direktno u sustav.</p></div>
            <div className="rounded- border border-emerald-200/60 bg-gradient-to-b from-emerald-50 to-white p-7"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white"><ChefHat size={22}/></div><h3 className="mt-6 text- font-bold">Kuhinja kuha</h3><p className="mt-2 text- text-zinc-600">KDS ekran pokazuje sve u realnom vremenu. Boje za prioritete, timer za svako jelo.</p></div>
            <div className="rounded- border border-violet-200/60 bg-gradient-to-b from-violet-50 to-white p-7"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white"><Smartphone size={22}/></div><h3 className="mt-6 text- font-bold">Konobar poslužuje</h3><p className="mt-2 text- text-zinc-600">Push notifikacija čim je jelo gotovo. Račun na jedan tap.</p></div>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-violet-600"><div className="mx-auto grid max-w- grid-cols-3 divide-x divide-white/10 px-5 lg:px-6 py-6"><div className="text-center text-white"><div className="text- font-black">3s</div><div className="text- tracking-widest opacity-80">SINKRONIZACIJA</div></div><div className="text-center text-white"><div className="text- font-black">0%</div><div className="text- tracking-widest opacity-70">GREŠAKA</div></div><div className="text-center text-white"><div className="text- font-black">∞</div><div className="text- tracking-widest opacity-70">STOLOVA</div></div></div></div>

      {/* ZARADA */}
      <section id="zarada" className="bg-[#FFFBF7] border-y border-zinc-100"><div className="mx-auto max-w- px-5 lg:px-6 py-16 lg:py-24">
        <div className="max-w-3xl"><div className="inline-flex gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text- font-bold border"><Euro size={14}/> NE SAMO BRŽE, NEGO I PROFITABILNIJE</div><h2 className="mt-4 text- lg:text- font-extrabold leading-[1.05]">Kako ti dižemo promet bez dodatnog osoblja</h2></div>
        <div className="mt-10 grid lg:grid-cols-3 gap-5 max-w-5xl">
          <div className="rounded- bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white"><div className="text- font-black">+27%</div><div className="text- text-emerald-50">QR predlaže dodatke, deserte i pića u pravom trenutku.</div></div>
          <div className="rounded- bg-zinc-900 p-6 text-white"><div className="text- font-black">-80%</div><div className="text- text-zinc-400">Manje krivo zapisanih narudžbi. Sve ide direkt u KDS.</div></div>
          <div className="rounded- bg-white border p-6"><div className="text- font-black">2x</div><div className="text- text-zinc-600">Brži obrt jer gosti naručuju dok čekaju, naplata na tap.</div></div>
        </div>
        <div className="mt-12 grid lg:grid-cols-3 gap-6 max-w-6xl">
          <div className="rounded- bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6"><div className="font-bold text-">Pametni prijedlozi koji prodaju</div><div className="mt-2 text-">Kad gost odabere burger, QR pita:<br/><span className="inline-flex mt-2 bg-white border rounded-full px-3 py-1 text- font-semibold">Dodaj pomfrit? +2,50€</span><br/><span className="inline-flex mt-1.5 bg-white border rounded-full px-3 py-1 text-">Desert uz kavu? +1,90€</span></div><div className="mt-4 text- bg-white/70 border border-amber-200 rounded-xl p-3">Konobar ponekad zaboravi. QR nikad. To je +18-30% na svaki račun.</div></div>
          <div className="rounded- bg-emerald-50 border border-emerald-200 p-6"><div className="font-bold text-">Manje praznog hoda</div><div className="mt-2 text- leading-6">• Ne trči 30x do kuhinje<br/>• Timer smanjuje čekanje<br/>• Dok čeka glavno, naruči piće preko QR-a<br/>• Naplata na tap</div></div>
          <div className="rounded- bg-violet-50 border border-violet-200 p-6"><div className="font-bold text-">Zadovoljan gost se vraća</div><div className="mt-2 text- leading-6">• Točna narudžba<br/>• Brza usluga<br/>• Lako plaćanje<br/>• Recenzija dok je za stolom</div></div>
        </div>
      </div></section>

      {/* FUNKCIONALNOSTI */}
      <section id="funkcionalnosti" className="mx-auto max-w- px-5 lg:px-6 py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row justify-between gap-6"><div><div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-zinc-200"><Sparkles size={14} className="text-amber-500"/><span className="text- font-bold tracking-widest">FUNKCIJE</span></div><h2 className="mt-4 max-w- text- font-extrabold leading-[0.95] sm:text-">Sve što ti treba, ništa što ne treba.</h2></div><p className="max-w- text- text-zinc-600">Napravljeno za stvarne restorane. Svaka funkcija rješava problem koji imaš svaki dan.</p></div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded- border bg-white p-6 shadow-sm"><div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center text-white"><QrCode size={20}/></div><h3 className="mt-5 font-bold">QR jelovnik</h3><p className="text- text-zinc-600">Jelovnik na 5 jezika, fotke, alergeni, cijene koje mijenjaš u sekundi.</p></div>
          <div className="rounded- border bg-white p-6 shadow-sm"><div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 grid place-items-center text-white"><ChefHat size={20}/></div><h3 className="mt-5 font-bold">KDS kuhinja</h3><p className="text- text-zinc-600">Tamni KDS ekran s bojama, timerima i zvukom. Radi i na tabletu.</p></div>
          <div className="rounded- border bg-white p-6 shadow-sm"><div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 grid place-items-center text-white"><Smartphone size={20}/></div><h3 className="mt-5 font-bold">Konobar app</h3><p className="text- text-zinc-600">Push kad je jelo gotovo, upravljanje stolovima, naplata.</p></div>
          <div className="rounded- border bg-white p-6 shadow-sm"><div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 grid place-items-center text-white"><LayoutGrid size={20}/></div><h3 className="mt-5 font-bold">Upravljanje stolovima</h3><p className="text- text-zinc-600">Povuci i spusti raspored, rezervacije, spajanje stolova.</p></div>
          <div className="rounded- border bg-white p-6 shadow-sm"><div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 grid place-items-center text-white"><BarChart3 size={20}/></div><h3 className="mt-5 font-bold">Izvještaji</h3><p className="text- text-zinc-600">Promet po satu, najprodavanija jela, prosječni račun.</p></div>
          <div className="rounded- border bg-white p-6 shadow-sm"><div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 grid place-items-center text-white"><Zap size={20}/></div><h3 className="mt-5 font-bold">Postavka 15 min</h3><p className="text- text-zinc-600">Uneseš jelovnik, isprintaš QR kodove, spojiš tablet. Gotovo.</p></div>
        </div>
      </section>

      {/* ULOGE */}
      <section id="uloge" className="bg-white"><div className="mx-auto max-w- px-5 lg:px-6 py-20 lg:py-28">
        <div className="mx-auto max-w- text-center"><h2 className="text- font-extrabold sm:text-">Svatko vidi ono što mu treba</h2><p className="mt-3 text-zinc-500">Tri uloge, tri pogleda. Bez kaosa.</p></div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded- border bg-white shadow-sm"><div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white"><span className="rounded-full bg-white/20 px-3 py-1 text- font-bold">ADMIN</span><div className="mt-6 text- font-bold">Vlasnik ima<br/>kontrolu</div></div><div className="p-6 space-y-3"><div className="flex gap-3 text-"><span className="h-6 w-6 rounded-full bg-emerald-100 grid place-items-center"><Check size={14} className="text-emerald-700"/></span>Uredi jelovnik za 10 sekundi</div><div className="flex gap-3 text-"><span className="h-6 w-6 rounded-full bg-emerald-100 grid place-items-center"><Check size={14} className="text-emerald-700"/></span>Vidi promet uživo</div><div className="flex gap-3 text-"><span className="h-6 w-6 rounded-full bg-emerald-100 grid place-items-center"><Check size={14} className="text-emerald-700"/></span>Upravljaj konobarima</div></div></div>
          <div className="overflow-hidden rounded- border bg-white shadow-sm"><div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white"><span className="rounded-full bg-white/20 px-3 py-1 text- font-bold">KONOBAR</span><div className="mt-6 text- font-bold">Konobar zna<br/>što i kad</div></div><div className="p-6 space-y-3"><div className="flex gap-3 text-"><span className="h-6 w-6 rounded-full bg-amber-100 grid place-items-center"><Check size={14} className="text-amber-700"/></span>Push kad je jelo gotovo</div><div className="flex gap-3 text-"><span className="h-6 w-6 rounded-full bg-amber-100 grid place-items-center"><Check size={14} className="text-amber-700"/></span>Jedan tap za račun</div><div className="flex gap-3 text-"><span className="h-6 w-6 rounded-full bg-amber-100 grid place-items-center"><Check size={14} className="text-amber-700"/></span>Pregled svih stolova</div></div></div>
          <div className="overflow-hidden rounded- border bg-white shadow-sm"><div className="bg-gradient-to-br from-violet-600 to-blue-500 p-6 text-white"><span className="rounded-full bg-white/20 px-3 py-1 text- font-bold">KUHINJA</span><div className="mt-6 text- font-bold">Kuhinja radi<br/>u miru</div></div><div className="p-6 space-y-3"><div className="flex gap-3 text-"><span className="h-6 w-6 rounded-full bg-violet-100 grid place-items-center"><Check size={14} className="text-violet-700"/></span>Timer za svako jelo</div><div className="flex gap-3 text-"><span className="h-6 w-6 rounded-full bg-violet-100 grid place-items-center"><Check size={14} className="text-violet-700"/></span>Boje za prioritete</div><div className="flex gap-3 text-"><span className="h-6 w-6 rounded-full bg-violet-100 grid place-items-center"><Check size={14} className="text-violet-700"/></span>Zvuk za novu narudžbu</div></div></div>
        </div>
      </div></section>

      <section className="relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-violet-600" /><div className="relative mx-auto max-w- px-5 lg:px-6 py-20 lg:py-28"><div className="mx-auto max-w- text-center"><h2 className="text- font-extrabold leading-[0.95] text-white sm:text-">Spreman? Idemo<br/>postaviti tvoj restoran.</h2><p className="mx-auto mt-4 max-w- text- text-emerald-50/90">Bez ugovora. Bez skrivenih troškova. Prvih 14 dana besplatno, pa odluči.</p><div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><a href="/login" className="inline-flex h- items-center justify-center gap-2 rounded-full bg-white px-8 text- font-bold text-emerald-700 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">Idi na login <ArrowRight size={18}/></a></div></div></div></section>

      <footer className="border-t border-zinc-200 bg-[#FFFEFB]"><div className="mx-auto flex max-w- flex-col lg:flex-row items-center justify-between gap-3 px-5 lg:px-6 py-6"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600" /><span className="text- font-bold">TableBoost.app</span><span className="text- text-zinc-500">© {new Date().getFullYear()}</span></div><div className="flex items-center gap-5 text- text-zinc-500"><span>Made in HR ❤️</span><a href="/login" className="font-semibold text-zinc-700">Prijava</a></div></div></footer>
    </div>
  );
}
