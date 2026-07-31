import { prisma } from "@/lib/prisma"
import MenuClient from "./MenuClient"

export default async function MenuPage({ params, searchParams }: { params: { restaurantSlug: string }, searchParams: { lang?: string } }) {
  const lang = (searchParams.lang as 'hr'|'en'|'de') || 'hr'
  let restaurant = await prisma.restaurant.findUnique({ where: { slug: params.restaurantSlug }, include: { categories: { include: { items: true }, orderBy: { order: 'asc' } } } }).catch(() => null)
  let tableNumber: number | null = null
  let slug = params.restaurantSlug
  if (!restaurant) {
    const table = await prisma.table.findUnique({ where: { qrSlug: params.restaurantSlug }, include: { restaurant: { include: { categories: { include: { items: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } } } } }).catch(() => null)
    if (table) { restaurant = table.restaurant; tableNumber = table.number }
  }
  if (!restaurant) return <div className="p-10 text-center"><h1 className="text-3xl font-bold">Restoran nije pronađen</h1><p>Slug: {params.restaurantSlug}</p></div>
  const cats = restaurant.categories.map(cat => ({...cat, items: [...cat.items].sort((a, b) => { if (a.isBoosted!== b.isBoosted) return a.isBoosted? -1 : 1; if (a.isBoosted && b.isBoosted) return (b.boostLevel || 0) - (a.boostLevel || 0); return (a.order || 0) - (b.order || 0) }) }))
  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white">
      <header className="p-6 bg-black text-white text-center sticky top-0 z-10">
        <h1 className="text-3xl font-black">{restaurant.name}</h1>
        <p className="opacity-70 text-sm">{restaurant.slug} {tableNumber? `• Stol ${tableNumber}` : ''}</p>
        <div className="flex justify-center gap-2 mt-4">{[{ code: 'hr', label: 'HR', flag: '🇭🇷' }, { code: 'en', label: 'EN', flag: '🇬🇧' }, { code: 'de', label: 'DE', flag: '🇩🇪' }].map(l => (<a key={l.code} href={`?lang=${l.code}`} className={`px-4 py-1.5 rounded-full text-sm border ${lang === l.code? 'bg-white text-black border-white font-bold' : 'border-white/30 text-white/80 hover:bg-white/10'}`}>{l.flag} {l.label}</a>))}</div>
      </header>
      <MenuClient restaurant={restaurant} tableNumber={tableNumber} cats={cats as any} lang={lang} slug={slug} />
      <footer className="p-6 text-center text-xs text-neutral-400 border-t">TableBoost • {lang.toUpperCase()}</footer>
    </main>
  )
}
