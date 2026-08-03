"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { LayoutDashboard, UtensilsCrossed, Package, Tags, FileUp, Languages, ShoppingCart, QrCode, Sparkles, Users, Settings, ChevronDown, Menu, X, Store, LogOut, Zap, Building2, CreditCard } from "lucide-react"
type NavItem = { href: string; label: string; icon: any; desc: string; badge?: string; exact?: boolean; roles?: string[] }
type NavGroup = { label: string; icon: any; items: NavItem[]; roles?: string[] }
const allNavGroups: NavGroup[] = [
  { label: "Meni", icon: UtensilsCrossed, roles: ["SUPER_ADMIN", "RESTAURANT_ADMIN"], items: [
    { href: "/admin/items", label: "Artikli", icon: Package, desc: "Uredi ponudu" },
    { href: "/admin/categories", label: "Kategorije", icon: Tags, desc: "Grupe jela" },
    { href: "/admin/import", label: "Uvoz PDF-a", icon: FileUp, desc: "Iz PDF cjenika", badge: "NOVO" },
    { href: "/admin/menu", label: "Prijevodi", icon: Languages, desc: "EN / DE" },
  ]},
  { label: "Poslovanje", icon: ShoppingCart, roles: ["SUPER_ADMIN","RESTAURANT_ADMIN","WAITER","KITCHEN"], items: [
    { href: "/admin/orders", label: "Narudžbe", icon: ShoppingCart, desc: "Uživo", roles: ["SUPER_ADMIN","RESTAURANT_ADMIN","WAITER","KITCHEN"] },
    { href: "/admin/qr", label: "Stolovi & QR", icon: QrCode, desc: "QR kodovi", roles: ["SUPER_ADMIN","RESTAURANT_ADMIN"] },
    { href: "/admin/upsell", label: "Upsell", icon: Sparkles, desc: "Boost prodaje", roles: ["SUPER_ADMIN","RESTAURANT_ADMIN"] },
  ]},
  { label: "Postavke", icon: Settings, roles: ["SUPER_ADMIN", "RESTAURANT_ADMIN"], items: [
    { href: "/admin/settings", label: "Podaci objekta", icon: Building2, desc: "OIB, adresa, IBAN" },
    { href: "/admin/payments", label: "Plaćanja", icon: CreditCard, desc: "Kartice, Stripe", badge: "NOVO" },
    { href: "/admin/staff", label: "Osoblje", icon: Users, desc: "Konobari" },
    { href: "/admin", label: "Restoran", icon: Store, desc: "Profil", exact: true },
  ]}
]
export default function AdminSidebar({ user, restaurant, impersonated }: any) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ "Meni": true, "Poslovanje": true, "Postavke": true })
  const role = user?.role || "WAITER"
  const navGroups = allNavGroups.map(g => {
    const groupAllowed =!g.roles || g.roles.includes(role)
    if (!groupAllowed) return null
    const filteredItems = g.items.filter(i =>!i.roles || i.roles.includes(role))
    if (filteredItems.length === 0) return null
    return {...g, items: filteredItems }
  }).filter(Boolean) as NavGroup[]
  useEffect(() => { navGroups.forEach(g => { if (g.items.some(i => pathname?.startsWith(i.href))) { setOpenGroups(p => ({...p, [g.label]: true })) } }) }, [pathname])
  const toggleGroup = (label: string) => setOpenGroups(p => ({...p, [label]:!p[label] }))
  const isActive = (href: string, exact?: boolean) => exact? pathname === href : pathname === href || pathname?.startsWith(href + "/")
  const isStaff = role === "WAITER" || role === "KITCHEN"
  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-40 h-10 w-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-lg"><Menu size={18} /></button>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" />}
      <aside className={`fixed lg:sticky top-0 z-50 h-screen w-64 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800 shrink-0 transition-transform duration-300 lg:translate-x-0 ${mobileOpen? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 shrink-0"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20"><Zap size={18} className="text-white" /></div><div className="flex-1"><div className="font-bold text-white tracking-tight">TableBoost</div><div className="text-xs text-slate-400 -mt-0.5 truncate">{restaurant?.name || "Admin panel"}</div></div><button onClick={() => setMobileOpen(false)} className="lg:hidden h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center"><X size={16} /></button></div>
        {isStaff && <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs"><div className="text-slate-400">Prijavljen kao</div><div className="text-white font-bold">{role === "KITCHEN"? "🍳 Kuhinja" : "🧑‍💼 Konobar"} - {user?.name || user?.email}</div></div>}
        {impersonated && <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs"><div className="text-amber-300 font-medium">👀 Impersonate</div><div className="text-white font-medium truncate">{impersonated.name}</div></div>}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {!isStaff && <Link href="/admin" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === "/admin"? "bg-white text-slate-900 shadow-lg" : "hover:bg-slate-800 hover:text-white text-slate-400"}`}><LayoutDashboard size={18} /> Dashboard</Link>}
          {navGroups.map(group => (<div key={group.label}><button onClick={() => toggleGroup(group.label)} className="w-full flex items-center justify-between px-3 py-2 text- font-semibold tracking-widest uppercase text-slate-500 hover:text-slate-300"><span className="flex items-center gap-2"><group.icon size={14} /> {group.label}</span><ChevronDown size={14} className={`transition-transform ${openGroups[group.label]? "rotate-180" : ""}`} /></button><div className={`mt-1 space-y-1 overflow-hidden transition-all ${openGroups[group.label]? "max-h- opacity-100" : "max-h-0 opacity-0"}`}>{group.items.map(item => {const active = isActive(item.href, (item as any).exact); return (<Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm relative ${active? "bg-white text-slate-900 shadow-lg" : "hover:bg-slate-800/80 hover:text-white text-slate-400"}`}><item.icon size={18} className={active? "text-slate-900" : "text-slate-500 group-hover:text-white"} /><div className="flex-1"><div className="font-medium leading-none flex items-center gap-2">{item.label} {(item as any).badge && <span className="text- px-1.5 py-0.5 rounded-full bg-green-500 text-white font-bold">{(item as any).badge}</span>}</div><div className={`text-xs mt-0.5 ${active? "text-slate-500" : "text-slate-500"}`}>{(item as any).desc}</div></div>{active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-violet-500" />}</Link>)})}</div></div>))}
        </nav>
        <div className="p-3 border-t border-slate-800 shrink-0"><div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50"><div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-sm">{user?.email?.[0]?.toUpperCase() || "A"}</div><div className="flex-1 min-w-0"><div className="text-sm font-medium text-white truncate">{user?.name || user?.email || "admin"}</div><div className="text-xs text-slate-400 truncate">{user?.role || "WAITER"}</div></div><a href="/api/auth/logout" className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"><LogOut size={14} /></a></div></div>
      </aside>
    </>
  )
}
