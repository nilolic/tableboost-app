import { prisma } from "@/lib/prisma"
import MenuClient from "./MenuClient"

export default async function MenuPage({ params, searchParams }: { params: { restaurantSlug: string }, searchParams: { lang?: string, table?: string } }) {
  const lang = (searchParams.lang as 'hr'|'en'|'de') || 'hr'
  const tableParam = searchParams.table ? parseInt(searchParams.table) : null

  let restaurant = await prisma.restaurant.findUnique({ 
    where: { slug: params.restaurantSlug },
    include: { 
      categories: { 
        include: { 
          items: { orderBy: { order: 'asc' } },
          children: { include: { items: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
        }, 
        orderBy: { order: 'asc' } 
      } 
    } 
  }).catch(() => null)

  let tableNumber: number | null = tableParam
  let slug = params.restaurantSlug

  if (!restaurant) {
    const table = await prisma.table.findUnique({ 
      where: { qrSlug: params.restaurantSlug }, 
      include: { restaurant: { include: { categories: { include: { items: { orderBy: { order: 'asc' } }, children: { include: { items: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } } } } 
    }).catch(() => null)
    if (table) { 
      restaurant = table.restaurant as any
      tableNumber = table.number
      slug = table.restaurant.slug
    }
  }

  if (!restaurant) return <div className="p-10 text-center"><h1 className="text-3xl font-bold">Restoran nije pronađen</h1><p className="opacity-60 mt-2">Slug: {params.restaurantSlug}</p></div>

  // sort items inside categories: boosted first
  const sortItems = (items:any[]) => [...items].sort((a,b)=>{
    if (a.isBoosted!== b.isBoosted) return a.isBoosted? -1 : 1
    if (a.isBoosted && b.isBoosted) return (b.boostLevel || 0) - (a.boostLevel || 0)
    return (a.order || 0) - (b.order || 0)
  })

  // izgradi mains = samo parent kategorije
  let mains = (restaurant as any).categories
    .filter((c:any)=>!c.parentId)
    .map((c:any)=>({
      id: c.id,
      name: c.name,
      nameEn: c.nameEn,
      nameDe: c.nameDe,
      imageUrl: c.imageUrl,
      description: c.description,
      sendsToKitchen: c.sendsToKitchen,
      order: c.order,
      items: sortItems(c.items||[]),
      children: (c.children||[]).map((ch:any)=>({
        id: ch.id,
        name: ch.name,
        nameEn: ch.nameEn,
        nameDe: ch.nameDe,
        imageUrl: ch.imageUrl,
        description: ch.description,
        sendsToKitchen: ch.sendsToKitchen,
        order: ch.order,
        items: sortItems(ch.items||[])
      })).sort((a:any,b:any)=>a.order-b.order)
    }))
    .sort((a:any,b:any)=>a.order-b.order)

  // ako nema mains (stara baza bez parentId) - sve kategorije postaju mains
  if(mains.length===0){
    mains = (restaurant as any).categories.map((c:any)=>({
      id: c.id,
      name: c.name,
      nameEn: c.nameEn,
      nameDe: c.nameDe,
      imageUrl: c.imageUrl,
      description: c.description,
      sendsToKitchen: c.sendsToKitchen,
      order: c.order,
      items: sortItems(c.items||[]),
      children: []
    }))
  }

  return <MenuClient restaurant={restaurant} tableNumber={tableNumber} mains={mains} lang={lang} slug={slug} />
}
