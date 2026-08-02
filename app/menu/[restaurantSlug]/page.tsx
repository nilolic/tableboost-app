import { prisma } from "@/lib/prisma"
import MenuClient from "./MenuClient"

export default async function MenuPage({ params, searchParams }: { params: { restaurantSlug: string }, searchParams: { lang?: string } }) {
  const lang = (searchParams.lang as 'hr'|'en'|'de') || 'hr'
  let restaurant = await prisma.restaurant.findUnique({ where: { slug: params.restaurantSlug }, include: { categories: { include: { items: { orderBy:{order:'asc'} } }, orderBy: { order: 'asc' } } } }).catch(() => null)
  let tableNumber: number | null = null
  let slug = params.restaurantSlug
  if (!restaurant) {
    const table = await prisma.table.findUnique({ where: { qrSlug: params.restaurantSlug }, include: { restaurant: { include: { categories: { include: { items: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } } } } }).catch(() => null)
    if (table) { restaurant = table.restaurant; tableNumber = table.number }
  }
  if (!restaurant) return <div className="p-10 text-center"><h1 className="text-3xl font-bold">Restoran nije pronađen</h1><p className="opacity-60 mt-2">Slug: {params.restaurantSlug}</p></div>
  const cats = restaurant.categories.map(cat => ({...cat, items: [...cat.items].sort((a, b) => {
    if (a.isBoosted!== b.isBoosted) return a.isBoosted? -1 : 1
    if (a.isBoosted && b.isBoosted) return (b.boostLevel || 0) - (a.boostLevel || 0)
    return (a.order || 0) - (b.order || 0)
  }) }))
  return (
    <main className="min-h-screen bg-orange-50/30">
      <div className="bg-black text-white">
        <div className="max-w-5xl mx-auto px-5 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-black grid place-items-center font-black text-sm">TB</div>
            <div>
              <div className="font-bold leading-none">{restaurant.name}</div>
              <div className="text-xs opacity-60 tracking-widest mt-1">{restaurant.slug.toUpperCase()} {tableNumber? `• STOL ${tableNumber}` : ''}</div>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[{code:'hr',f:'🇭🇷'},{code:'en',f:'🇬🇧'},{code:'de',f:'🇩🇪'}].map(l=>(
              <a key={l.code} href={`?lang=${l.code}`} className={`w-8 h-8 grid place-items-center rounded-full border text-xs ${lang===l.code? 'bg-white text-black border-white':'border-white/20'}`}>{l.f}</a>
            ))}
          </div>
        </div>
      </div>
      <MenuClient restaurant={restaurant} tableNumber={tableNumber} cats={cats as any} lang={lang} slug={slug} />
    </main>
  )
}
