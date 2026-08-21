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
import LegalFooter from "./components/LegalFooter";

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
      // ensure URL hash changes for test visibility
      try { history.replaceState(null, "", `#${id}`); } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-zinc-900 selection:bg-emerald-200/60 antialiased overflow-x-hidden">
      <style>{`
        
        *{font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-[#FFFEFB]/80 backdrop-blur-[18px] w-full max-w-[100vw] overflow-hidden">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_6px_18px_rgba(16,185,129,0.35)] grid place-items-center">
              <div className="h-[14px] w-[14px] rounded-full bg-white shadow-inner" />
            </div>
            <span className="text-[17px] font-extrabold tracking-[-0.02em]">TableBoost<span className="font-medium text-zinc-400">.app</span></span>
          </div>

          {/* Nav centered */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className={`text-[14px] font-medium tracking-tight transition-colors hover:text-zinc-900 ${
                  active === n.id ? "text-zinc-900" : "text-zinc-500"
                }`}
              >
                <span className="relative">
                  {n.label}
                  {active === n.id && (
                    <span className="absolute -bottom-[6px] left-0 h-[2px] w-full rounded-full bg-zinc-900" />
                  )}
                </span>
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/login"
              className="h-10 rounded-full bg-zinc-900 px-5 text-[14px] font-semibold text-white hover:bg-black transition"
            >
              <span className="flex h-full items-center">Prijava</span>
            </a>
            <a
              href="mailto:info@tableboost.app"
              className="group h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 px-5 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_10px_28px_rgba(16,185,129,0.45)] transition-all flex items-center gap-1.5"
            >
              Kontaktirajte nas
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-full bg-zinc-900 text-white"
            aria-label="menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-zinc-200 bg-[#FFFEFB] px-5 pb-6 pt-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-1">
              {navItems.map((n) => (
                <button
                  key={n.id}
                  onClick={() => scrollTo(n.id)}
                  className={`flex h-12 items-center rounded-2xl px-4 text-[15px] font-medium text-left transition ${
                    active === n.id ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {n.label}
                </button>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <a href="/login" className="h-12 grid place-items-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  Prijava
                </a>
                <a href="mailto:info@tableboost.app" className="h-12 grid place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow">
                  Kontaktirajte nas
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-[600px] w-[600px] rounded-full bg-emerald-300/70 blur-[60px]" />
          <div className="absolute -top-20 right-[-80px] h-[520px] w-[520px] rounded-full bg-amber-300/70 blur-[60px]" />
          <div className="absolute top-[280px] left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-violet-300/60 blur-[70px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.02),_transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-[1240px] px-5 lg:px-6 pt-10 lg:pt-16 pb-10 lg:pb-14">
          {/* badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[12px] font-semibold tracking-wide text-zinc-700">Novo • KDS v2 LIVE sinkronizacija</span>
            </div>
          </div>

          <div className="mt-7 text-center">
            <h1 className="mx-auto max-w-[860px] text-[36px] leading-[0.95] tracking-[-0.04em] font-[800] lg:text-[72px]">
              <span className="block text-zinc-900">QR naručivanje za</span>
              <span className="block bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">restorane</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[560px] text-[16px] lg:text-[18px] leading-[1.55] text-zinc-500 font-[400]">
              QR narudžbe, KDS kuhinja i konobar aplikacija u jednom sustavu. Bez papira, bez vikanja, bez grešaka. Postavljeno za 15 minuta.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:info@tableboost.app"
                className="group inline-flex h-[52px] items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 px-7 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(16,185,129,0.35)] hover:shadow-[0_16px_32px_rgba(16,185,129,0.45)] transition-all"
              >
                Kontaktirajte nas
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
              <a
                href="/demo"
                className="inline-flex h-[52px] items-center rounded-full border border-zinc-200 bg-white px-7 text-[15px] font-semibold text-zinc-900 shadow-[0_6px_18px_rgba(0,0,0,0.05)] hover:bg-zinc-50 transition"
              >
                Pogledaj demo
              </a>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-zinc-500">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Bez kartice</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" /> Postavljanje 15 min</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> Podrška na HR</span>
            </div>
          </div>

          {/* Mockups */}
          <div className="mt-10 lg:mt-16 grid gap-6 lg:gap-5 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_300px] items-stretch w-full max-w-full">
            {/* QR stand */}
            <div className="group relative rounded-[28px] p-[1.5px] bg-gradient-to-br from-amber-300 via-amber-200 to-orange-200 shadow-[0_16px_40px_rgba(251,146,60,0.25)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(251,146,60,0.32)] min-w-0">
              <div className="rounded-[26px] bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-bold text-white tracking-wide">STOL 5</div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
                </div>
                <div className="mt-4 rounded-[20px] bg-[#FFFBF7] border border-zinc-100 p-4">
                  <div className="grid grid-cols-5 gap-[5px]">
                    {Array.from({ length: 25 }).map((_, i) => {
                      const amber = [0, 4, 6, 12, 18, 20, 24, 2, 8, 14].includes(i);
                      const dark = [1, 3, 7, 9, 11, 13, 15, 19, 21, 23].includes(i);
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-[4px] ${
                            amber ? "bg-amber-400" : dark ? "bg-zinc-900" : "bg-white border border-zinc-100"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <QrCode className="h-4 w-4 text-zinc-400" />
                    <span className="text-[11px] font-semibold tracking-wide text-zinc-500">TABLEBOOST QR</span>
                  </div>
                </div>
                <button className="mt-4 w-full rounded-full bg-zinc-900 py-3 text-[13px] font-semibold text-white">Skeniraj & naruči</button>
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-zinc-400"><Zap className="h-3.5 w-3.5" /> Trenutno spojeno • 2 gosta</div>
              </div>
            </div>

            {/* KDS */}
            <div className="relative rounded-[28px] bg-[#0f1214] p-4 lg:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden group transition-transform hover:-translate-y-0.5 min-w-0">
              <div className="absolute inset-0 bg-[radial-gradient(600px_at_20%_-10%,rgba(16,185,129,0.12),transparent),radial-gradient(500px_at_90%_10%,rgba(168,85,247,0.12),transparent)]" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 border border-white/10">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-bold tracking-widest text-white">KUHINJA • LIVE</span>
                  </div>
                  <span className="hidden lg:inline-flex text-[11px] text-white/50">2 aktivne • 1 na čekanju</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-7 w-7 rounded-full bg-white/10 grid place-items-center text-white/70"><Timer className="h-4 w-4" /></div>
                  <div className="h-7 w-7 rounded-full bg-white/10 grid place-items-center text-white/70"><Flame className="h-4 w-4" /></div>
                </div>
              </div>

              <div className="relative mt-4 grid gap-3 lg:grid-cols-2 min-w-0">
                {/* Order 1 */}
                <div className="rounded-[20px] border border-amber-400/30 bg-[#171a1d] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2">
                        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-zinc-900">STOL 12</span>
                        <span className="text-[11px] text-amber-200/70 font-medium">• 2 gosta</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 grid place-items-center text-white"> <Soup className="h-4 w-4" /></div>
                        <div>
                          <div className="text-[14px] font-bold text-white leading-none">Ćevapi • veliki</div>
                          <div className="text-[11px] text-white/50 mt-1">x2 + pomfrit + ajvar</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-white/40">VRIJEME</div>
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[13px] font-bold text-amber-300 border border-amber-400/20">
                        <Timer className="h-3.5 w-3.5" /> 02:14
                      </div>
                    </div>
                  </div>
                  <button className="mt-4 w-full rounded-full bg-amber-400 py-2.5 text-[13px] font-bold text-zinc-900">U PRIPREMI</button>
                </div>

                {/* Order 2 */}
                <div className="rounded-[20px] border border-emerald-400/30 bg-[#171a1d] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2">
                        <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[11px] font-extrabold text-zinc-900">STOL 5</span>
                        <span className="text-[11px] text-emerald-200/70 font-medium">• QR narudžba</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 grid place-items-center text-white"><UtensilsCrossed className="h-4 w-4" /></div>
                        <div>
                          <div className="text-[14px] font-bold text-white leading-none">Pizza Miješana</div>
                          <div className="text-[11px] text-white/50 mt-1">bez luka • extra sir</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-white/40">VRIJEME</div>
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[13px] font-bold text-emerald-300 border border-emerald-400/20">
                        <Timer className="h-3.5 w-3.5" /> 00:32
                      </div>
                    </div>
                  </div>
                  <button className="mt-4 w-full rounded-full bg-white py-2.5 text-[13px] font-bold text-zinc-900">Gotovo ✓</button>
                </div>
              </div>

              <div className="relative mt-4 flex items-center justify-between rounded-[14px] bg-white/[0.06] px-3 py-2 border border-white/10">
                <span className="text-[11px] text-white/60 font-medium">Sinkronizacija • KDS v2</span>
                <span className="text-[11px] text-emerald-300 font-bold">● LIVE 12ms</span>
              </div>
            </div>

            {/* Konobar phone */}
            <div className="relative rounded-[28px] bg-white border border-zinc-200 p-[6px] shadow-[0_16px_40px_rgba(0,0,0,0.08)] group transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] min-w-0">
              <div className="rounded-[22px] overflow-hidden border border-zinc-200">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-white/20 grid place-items-center text-white font-bold text-[12px]">M</div>
                    <div>
                      <div className="text-[11px] font-bold tracking-widest text-white/80 leading-none">KONOBAR • MARKO</div>
                      <div className="text-[11px] text-white font-semibold leading-none mt-1">3 aktivna stola</div>
                    </div>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-white/20 grid place-items-center"><div className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" /></div>
                </div>
                <div className="bg-[#FFFBF7] p-3 space-y-3">
                  {[
                    { stol: "STOL 12", ljudi: "2 gosta • 18 min", badge: "KUHA SE", color: "bg-amber-400 text-zinc-900", sub: "Ćevapi x2" },
                    { stol: "STOL 5", ljudi: "QR • 1 min", badge: "NOVO", color: "bg-emerald-500 text-white", sub: "Pizza Miješana" },
                    { stol: "STOL 8", ljudi: "4 gosta • 32 min", badge: "SPREMNO", color: "bg-violet-600 text-white", sub: "Račun zatražen" },
                  ].map((t) => (
                    <div key={t.stol} className="rounded-[16px] bg-white border border-zinc-200 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-900 text-white grid place-items-center text-[11px] font-bold">{t.stol.replace("STOL ","")}</div>
                        <div>
                          <div className="text-[13px] font-bold text-zinc-900 leading-none">{t.stol}</div>
                          <div className="text-[11px] text-zinc-500 mt-1">{t.ljudi}</div>
                          <div className="text-[11px] text-zinc-400">{t.sub}</div>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${t.color}`}>{t.badge}</span>
                    </div>
                  ))}
                  <button className="w-full rounded-full bg-zinc-900 py-2.5 text-[13px] font-semibold text-white">Vidi sve stolove</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KAKO RADI */}
      <section id="kako-radi" className="bg-white border-t border-zinc-100">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-6 py-16 lg:py-24">
          <div className="text-center">
            <div className="inline-flex rounded-full bg-zinc-900 px-3.5 py-1.5 text-[11px] font-bold tracking-widest text-white">KAKO RADI</div>
            <h2 className="mx-auto mt-4 max-w-[600px] text-[30px] lg:text-[46px] font-[800] leading-[1.05] tracking-[-0.03em]">Od QR-a do kuhinje u 3 koraka</h2>
            <p className="mx-auto mt-3 max-w-[520px] text-[15px] lg:text-[16px] text-zinc-500">Bez učenja. Gost skenira, kuhinja vidi, konobar zna.</p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              {
                n: "01",
                title: "Gost skenira",
                desc: "Gost skenira QR na stolu i otvara jelovnik. Bez aplikacije, bez čekanja konobara.",
                color: "from-amber-400 to-orange-400",
                Icon: QrCode,
                check: "Instant • 0s",
              },
              {
                n: "02",
                title: "Kuhinja kuha",
                desc: "Narudžba stiže direktno na KDS ekran u kuhinji. Timer, prioritet, alergeni — sve jasno.",
                color: "from-emerald-400 to-teal-500",
                Icon: ChefHat,
                check: "LIVE KDS v2",
              },
              {
                n: "03",
                title: "Konobar poslužuje",
                desc: "Konobar dobiva push: stol 5 spremno. Nema vikanja, nema zabune. Samo točan servis.",
                color: "from-violet-500 to-indigo-500",
                Icon: Smartphone,
                check: "Push obavijest",
              },
            ].map((c) => (
              <div key={c.n} className="group relative rounded-[24px] border border-zinc-200 bg-[#FFFEFB] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between">
                  <div className="text-[56px] font-[900] leading-none tracking-[-0.05em] text-zinc-100">{c.n}</div>
                  <div className={`h-12 w-12 rounded-[16px] bg-gradient-to-br ${c.color} grid place-items-center text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)]`}>
                    <c.Icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="mt-2 text-[18px] font-bold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-zinc-500">{c.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-bold text-white">
                  <Check className="h-3.5 w-3.5" /> {c.check}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-violet-600">
          <div className="mx-auto max-w-[1240px] grid grid-cols-3 divide-x divide-white/15 px-5 lg:px-6 py-7 lg:py-10">
            <div className="text-center px-2">
              <div className="text-[28px] lg:text-[44px] font-[900] text-white tracking-[-0.04em] leading-none">3s</div>
              <div className="mt-1 text-[11px] lg:text-[12px] font-semibold tracking-widest text-white/80">SINKRONIZACIJA</div>
            </div>
            <div className="text-center px-2">
              <div className="text-[28px] lg:text-[44px] font-[900] text-white tracking-[-0.04em] leading-none">0%</div>
              <div className="mt-1 text-[11px] lg:text-[12px] font-semibold tracking-widest text-white/80">GREŠAKA</div>
            </div>
            <div className="text-center px-2">
              <div className="text-[28px] lg:text-[44px] font-[900] text-white tracking-[-0.04em] leading-none">∞</div>
              <div className="mt-1 text-[11px] lg:text-[12px] font-semibold tracking-widest text-white/80">STOLOVA</div>
            </div>
          </div>
        </div>
      </section>

      {/* ZARADA */}
      <section id="zarada" className="bg-[#FFFBF7]">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-6 py-16 lg:py-24">
          <div className="max-w-[760px]">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-amber-200 px-3.5 py-1.5 shadow-sm">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-zinc-900"><Euro className="h-3.5 w-3.5" /></span>
              <span className="text-[11px] font-bold tracking-widest text-zinc-700">NE SAMO BRŽE, NEGO I PROFITABILNIJE</span>
            </div>
            <h2 className="mt-5 text-[30px] lg:text-[46px] font-[800] leading-[1.05] tracking-[-0.03em]">Kako ti dižemo promet bez dodatnog osoblja</h2>
            <p className="mt-3 text-[15px] lg:text-[17px] leading-[1.6] text-zinc-500">QR nije samo jelovnik — to je prodavač koji nikad ne zaboravi ponuditi desert, piće ili dodatak. Sustav radi dok ti poslužuješ.</p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="rounded-[24px] bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px] shadow-[0_16px_40px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(16,185,129,0.32)] transition-all">
              <div className="rounded-[22px] bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white h-full">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold">PROSJEČAN RAČUN</span>
                  <TrendingIcon />
                </div>
                <div className="mt-8 text-[52px] font-[900] leading-none tracking-[-0.04em]">+27%</div>
                <div className="mt-2 text-[13px] font-medium text-white/80">više uz pametne prijedloge uz svaku narudžbu</div>
                <div className="mt-4 h-[2px] w-full bg-white/20 rounded-full overflow-hidden"><div className="h-full w-[72%] bg-white rounded-full" /></div>
              </div>
            </div>
            <div className="rounded-[24px] bg-zinc-900 p-6 text-white shadow-[0_16px_40px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold border border-white/10">GREŠKE</span>
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="mt-8 text-[52px] font-[900] leading-none tracking-[-0.04em]">-80%</div>
              <div className="mt-2 text-[13px] font-medium text-white/60">manje grešaka, nema krivih narudžbi i povrata jela</div>
              <div className="mt-4 flex gap-1.5">
                <span className="h-1.5 w-8 rounded-full bg-white/20" /><span className="h-1.5 w-8 rounded-full bg-white/20" /><span className="h-1.5 w-8 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="rounded-[24px] bg-white border border-zinc-200 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all">
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-zinc-900 text-white px-2.5 py-1 text-[11px] font-bold">OBRT STOLA</span>
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div className="mt-8 text-[52px] font-[900] leading-none tracking-[-0.04em] text-zinc-900">2x</div>
              <div className="mt-2 text-[13px] font-medium text-zinc-500">brži obrt stolova u špici, manje čekanja gostiju</div>
              <div className="mt-4 grid grid-cols-6 gap-1.5">
                {Array.from({length:6}).map((_,i)=><div key={i} className={`h-1.5 rounded-full ${i<4?'bg-zinc-900':'bg-zinc-200'}`} />)}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <DetailCard
              color="amber"
              title="Pametni prijedlozi"
              desc="Sustav sam predlaže dodatke koji povećavaju račun, bez da konobar mora pamtiti."
              pills={["Dodaj pomfrit? +2,50€", "Piše uz ćevape? +3,00€", "Desert? +4,20€"]}
            />
            <DetailCard
              color="emerald"
              title="Manje praznog hoda"
              bullets={["QR sken = nema čekanja konobara", "Kuhinja vidi odmah, nema papira", "Konobar poslužuje 2x više stolova"]}
            />
            <DetailCard
              color="violet"
              title="Zadovoljan gost"
              bullets={["Točna narudžba svaki put", "Brži servis, više osmijeha", "Gost se vraća i preporučuje"]}
            />
          </div>
        </div>
      </section>

      {/* FUNKCIONALNOSTI */}
      <section id="funkcionalnosti" className="bg-[#FFFBF7] border-t border-zinc-100">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-6 py-16 lg:py-24">
          <div className="text-center max-w-[640px] mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3.5 py-1.5 text-[11px] font-bold tracking-widest text-white">
              <Sparkles className="h-3.5 w-3.5" /> FUNKCIJE
            </div>
            <h2 className="mt-4 text-[30px] lg:text-[46px] font-[800] leading-[1.05] tracking-[-0.03em]">Sve što ti treba, ništa što ne treba.</h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              gradient="from-amber-400 to-orange-400"
              icon={<QrCode className="h-5 w-5" />}
              title="QR jelovnik"
              desc="Gost skenira QR, vidi slike, alergene i cijene. Naručuje sam — na hrvatskom, engleskom i njemačkom."
            />
            <FeatureCard
              gradient="from-emerald-400 to-teal-500"
              icon={<ChefHat className="h-5 w-5" />}
              title="KDS kuhinja"
              desc="Dark-mode ekran za kuhinju. Timeri, boje prioriteta, zvuk za novo. Radi i na tabletu."
            />
            <FeatureCard
              gradient="from-violet-500 to-indigo-500"
              icon={<Smartphone className="h-5 w-5" />}
              title="Konobar app"
              desc="Svi stolovi na dlanu. Push kad je spremno, zatvaranje računa, dodjela stolova. Brzo."
            />
            <FeatureCard
              gradient="from-zinc-800 to-zinc-900"
              icon={<LayoutGrid className="h-5 w-5" />}
              title="Upravljanje stolovima"
              desc="Raspored sale, spajanje stolova, rezervacije. Drag & drop, uživo sinkronizirano."
            />
            <FeatureCard
              gradient="from-teal-500 to-emerald-600"
              icon={<BarChart3 className="h-5 w-5" />}
              title="Izvještaji"
              desc="Promet po danu, najprodavanije, prosječan račun, obrt stolova. Izvoz u PDF/CSV."
            />
            <FeatureCard
              gradient="from-amber-500 to-orange-500"
              icon={<Zap className="h-5 w-5" />}
              title="Postavka 15 min"
              desc="Uvezi jelovnik, isprintaj QR, spoji tablet u kuhinji. Gotovo. Bez IT ekipe."
            />
          </div>
        </div>
      </section>

      {/* ULOGE */}
      <section id="uloge" className="bg-white border-t border-zinc-100">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-6 py-16 lg:py-24">
          <div className="text-center max-w-[640px] mx-auto">
            <h2 className="text-[30px] lg:text-[46px] font-[800] leading-[1.05] tracking-[-0.03em]">Svatko vidi ono što mu treba</h2>
            <p className="mt-3 text-[15px] lg:text-[16px] text-zinc-500">Tri uloge, tri pogleda. Bez kaosa.</p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <RoleCard
              role="ADMIN"
              color="emerald"
              icon={<Crown className="h-4 w-4" />}
              title="Vlasnik vidi sve"
              desc="Kontrola nad cijelim sustavom. Jelovnik, stolovi, osoblje, izvještaji i cijene."
              items={["Upravljanje jelovnikom i cijenama", "Izvještaji i izvoz prometa", "Upravljanje korisnicima"]}
              gradient="from-emerald-500 to-teal-600"
            />
            <RoleCard
              role="KONOBAR"
              color="amber"
              icon={<Smartphone className="h-4 w-4" />}
              title="Konobar poslužuje"
              desc="Fokus na goste, ne na papire. Vidi svoje stolove, statuse i push obavijesti."
              items={["Pregled stolova i narudžbi uživo", "Push: stol spreman za posluživanje", "Brzo zatvaranje računa"]}
              gradient="from-amber-400 to-orange-400"
            />
            <RoleCard
              role="KUHINJA"
              color="violet"
              icon={<Flame className="h-4 w-4" />}
              title="Kuhinja kuha"
              desc="Samo ono bitno: što, koliko, za koji stol i koliko dugo. Bez poziva i vikanja."
              items={["KDS timer i prioritet narudžbi", "Oznake alergena i napomena", "Zvuk za novu narudžbu"]}
              gradient="from-violet-600 to-blue-600"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      
{/* SEO FAQ - dodano za Google */}
<section className="bg-white border-t border-zinc-100">
  <div className="mx-auto max-w- px-5 lg:px-6 py-16">
    <h2 className="text- font-[800] tracking-tight text-center">Često pitana pitanja o QR naručivanju</h2>
    <div className="mt-8 space-y-4">
      <details className="rounded-2xl border border-zinc-200 p-5 bg-[#FFFEFB]"><summary className="font-bold cursor-pointer">Što je QR jelovnik i kako radi?</summary><p className="mt-3 text- text-zinc-600 leading-[1.6]">Gost skenira QR kod na stolu i otvara digitalni jelovnik. Naručuje sam bez čekanja konobara. Narudžba ide direktno na KDS u kuhinji.</p></details>
      <details className="rounded-2xl border border-zinc-200 p-5 bg-[#FFFEFB]"><summary className="font-bold cursor-pointer">Treba li gost instalirati aplikaciju?</summary><p className="mt-3 text- text-zinc-600">Ne. QR jelovnik radi u browseru. Bez aplikacije, bez registracije.</p></details>
      <details className="rounded-2xl border border-zinc-200 p-5 bg-[#FFFEFB]"><summary className="font-bold cursor-pointer">Što je KDS sustav?</summary><p className="mt-3 text- text-zinc-600">KDS (Kitchen Display System) je ekran u kuhinji koji prikazuje narudžbe uživo s timerima, prioritetima i alergenima. Zamjenjuje papiriće.</p></details>
      <details className="rounded-2xl border border-zinc-200 p-5 bg-[#FFFEFB]"><summary className="font-bold cursor-pointer">Koliko košta TableBoost?</summary><p className="mt-3 text- text-zinc-600">Bez provizije po narudžbi. Fiksno mjesečno, bez ugovorne obveze. Postavljanje 15 minuta.</p></details>
    </div>
  </div>
</section>

<section className="px-5 lg:px-6 pb-8">
        <div className="mx-auto max-w-[1240px] rounded-[28px] bg-gradient-to-br from-emerald-600 via-teal-600 to-violet-600 p-[1px] shadow-[0_24px_64px_rgba(16,185,129,0.28)]">
          <div className="rounded-[26px] bg-gradient-to-br from-emerald-600 via-teal-600 to-violet-600 px-6 lg:px-14 py-12 lg:py-16 text-center relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_at_10%_-10%,rgba(255,255,255,0.18),transparent),radial-gradient(700px_at_90%_20%,rgba(255,255,255,0.14),transparent)]" />
            <div className="relative">
              <h2 className="mx-auto max-w-[600px] text-[28px] lg:text-[44px] font-[800] leading-[1.05] tracking-[-0.03em] text-white">Spreman? Idemo postaviti tvoj restoran.</h2>
              <p className="mx-auto mt-3 max-w-[480px] text-[14px] lg:text-[16px] leading-[1.6] text-white/80">Kontaktirajte nas, uvezi jelovnik i isprintaj QR kodove. Podrška je uz tebe cijelim putem.</p>
              <div className="mt-7 flex justify-center">
                <a href="/login" className="group inline-flex h-[52px] items-center gap-2 rounded-full bg-white px-7 text-[15px] font-bold text-zinc-900 shadow-[0_10px_28px_rgba(0,0,0,0.18)] hover:bg-zinc-50 transition">
                  Idi na login
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
              <div className="mt-4 text-[12px] font-medium text-white/70">Bez kartice • 15 min postavljanje • Podrška na HR</div>
              <div className="mt-6 rounded-[20px] border border-white/10 bg-white/5 backdrop-blur p-4">
                <div className="text-[13px] font-semibold text-white mb-2">Imaš pitanje? Piši direktno:</div>
                <ContactForm source="hero" compact={true} />
                <div className="mt-2 text-[11px] text-white/60">Odgovaramo u 2h • <a href="mailto:info@tableboost.app" className="underline">info@tableboost.app</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
       {/* EKOSUSTAV SEO BAR */}
      <div className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w- px-5 lg:px-6 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 text- text-zinc-600 text-center">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4ff00] animate-pulse border border-black/10"></span>
            Dio istog ekosustava:
          </span>
          <a href="https://haccp-pro.app" target="_blank" className="font-bold text-zinc-900 underline decoration-zinc-300 decoration-2 underline-offset-2 hover:decoration-black">
            HACCP-PRO - digitalna HACCP knjiga koja OCR-om očitava LOT i rok trajanja
          </a>
          <a href="https://haccp-pro.app" target="_blank" className="ml-1 inline-flex rounded-full bg-zinc-900 text-white px-2.5 py-0.5 text- font-bold">
            HACCP-PRO →
          </a>
        </div>
      </div>
      <footer className="border-t border-zinc-200 bg-[#FFFEFB]">
        <div className="mx-auto flex max-w-[1240px] flex-col lg:flex-row items-center justify-between gap-3 px-5 lg:px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 grid place-items-center">
              <div className="h-3 w-3 rounded-full bg-white" />
            </div>
            <span className="text-[14px] font-bold tracking-tight">TableBoost<span className="font-medium text-zinc-400">.app</span></span>
            <span className="text-zinc-300">•</span>
            <span className="text-[12px] text-zinc-500">© {2026}</span>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-zinc-500">
            <span className="inline-flex items-center gap-1">Made in HR <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /></span>
            <LegalFooter />
            <a href="/login" className="font-semibold text-zinc-700 hover:text-zinc-900">Prijava</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


function ContactForm({ source = "landing", compact = false }: { source?: string; compact?: boolean }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source }),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", phone: "", message: "" });
        setTimeout(()=>setStatus("idle"), 4000);
      } else setStatus("error");
    } catch { setStatus("error"); }
  };

  if (compact) {
    return (
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 w-full max-w-[520px]">
        <input required type="email" placeholder="tvoj@email.com" value={form.email}
          onChange={e=>setForm({...form,email:e.target.value})}
          className="h-12 flex-1 rounded-full border border-zinc-200 bg-white px-5 text-[14px] outline-none focus:border-zinc-900 placeholder:text-zinc-400" />
        <button disabled={status==="sending"} className="h-12 rounded-full bg-zinc-900 px-6 text-[14px] font-bold text-white hover:bg-black transition disabled:opacity-50">
          {status==="sending" ? "Šaljem..." : status==="sent" ? "✓ Poslano!" : "Pošalji upit"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[28px] border border-zinc-200 bg-white p-6 lg:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-bold tracking-tight">Javi se ekipi</h3>
        <span className="text-[12px] text-zinc-500">→ info@tableboost.app</span>
      </div>
      <div className="mt-5 grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required placeholder="Ime i prezime" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
            className="h-12 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-[14px] outline-none focus:border-zinc-900 focus:bg-white" />
          <input placeholder="Telefon (opcionalno)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}
            className="h-12 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-[14px] outline-none focus:border-zinc-900 focus:bg-white" />
        </div>
        <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
          className="h-12 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-[14px] outline-none focus:border-zinc-900 focus:bg-white" />
        <textarea required placeholder="Poruka - npr. koristim KOR, imam 45 artikala..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})}
          className="min-h-[110px] rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[14px] outline-none focus:border-zinc-900 focus:bg-white resize-none" />
        <button disabled={status==="sending"} className="h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[14px] font-bold shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_10px_28px_rgba(16,185,129,0.45)] transition disabled:opacity-60">
          {status==="sending" ? "Šaljem..." : status==="sent" ? "✓ Poslano na info@tableboost.app!" : "Pošalji poruku"}
        </button>
        {status==="sent" && <p className="text-[12px] text-emerald-600 font-medium">Hvala! Javim se u roku 2h na {form.email || "tvoj email"}.</p>}
        {status==="error" && <p className="text-[12px] text-red-500">Greška, probaj direkt na info@tableboost.app</p>}
        <p className="text-[11px] text-zinc-400 text-center">Ili piši direktno: <a href="mailto:info@tableboost.app" className="underline font-semibold text-zinc-600">info@tableboost.app</a></p>
      </div>
    </form>
  );
}


function FeatureCard({ gradient, icon, title, desc }: { gradient: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
      <div className={`absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r ${gradient}`} />
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br ${gradient} text-white shadow-[0_6px_16px_rgba(0,0,0,0.15)]`}>
        {icon}
      </div>
      <h3 className="mt-4 text-[16px] font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-[1.6] text-zinc-500">{desc}</p>
      <div className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-700">Uključeno</div>
    </div>
  );
}

function RoleCard({
  role,
  color,
  icon,
  title,
  desc,
  items,
  gradient,
}: {
  role: string;
  color: "emerald" | "amber" | "violet";
  icon: React.ReactNode;
  title: string;
  desc: string;
  items: string[];
  gradient: string;
}) {
  const colorMap = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    violet: "bg-violet-50 border-violet-200 text-violet-800",
  };
  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
      <div className={`h-[84px] bg-gradient-to-br ${gradient} p-5 flex items-start justify-between`}>
        <span className={`inline-flex items-center gap-1.5 rounded-full border bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold tracking-widest ${color === "emerald" ? "text-emerald-700" : color === "amber" ? "text-amber-700" : "text-violet-700"}`}>
          {icon} {role}
        </span>
        <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center text-white">{color === "emerald" ? <Crown className="h-4 w-4" /> : color === "amber" ? <Smartphone className="h-4 w-4" /> : <ChefHat className="h-4 w-4" />}</div>
      </div>
      <div className="p-6">
        <h3 className="text-[17px] font-bold tracking-tight">{title}</h3>
        <p className="mt-2 text-[13.5px] leading-[1.6] text-zinc-500">{desc}</p>
        <div className="mt-5 space-y-2.5">
          {items.map((it) => (
            <div key={it} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white"><Check className="h-3 w-3" /></span>
              <span className="text-[13px] leading-[1.5] text-zinc-700">{it}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  color,
  title,
  desc,
  pills,
  bullets,
}: {
  color: "amber" | "emerald" | "violet";
  title: string;
  desc?: string;
  pills?: string[];
  bullets?: string[];
}) {
  const top = {
    amber: "from-amber-400 to-orange-400",
    emerald: "from-emerald-400 to-teal-500",
    violet: "from-violet-500 to-indigo-500",
  }[color];
  return (
    <div className="group rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all relative overflow-hidden">
      <div className={`absolute left-0 top-0 h-[3px] w-full bg-gradient-to-r ${top}`} />
      <h3 className="text-[16px] font-bold tracking-tight">{title}</h3>
      {desc && <p className="mt-2 text-[13.5px] leading-[1.6] text-zinc-500">{desc}</p>}
      {pills && (
        <div className="mt-4 flex flex-wrap gap-2">
          {pills.map((p) => (
            <span key={p} className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-[12px] font-semibold text-zinc-800">
              {p}
            </span>
          ))}
        </div>
      )}
      {bullets && (
        <ul className="mt-4 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2 text-[13px] leading-[1.5] text-zinc-600">
              <span className="mt-[7px] h-1 w-1 rounded-full bg-zinc-400 shrink-0" /> {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TrendingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-80">
      <path d="M3 17L9 11L13 15L21 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7H21V14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

