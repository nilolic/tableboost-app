import { prisma } from "@/lib/prisma"
import MenuClient from "./MenuClient"

export default async function MenuPage({ params, searchParams }: { params: { restaurantSlug: string }, searchParams: { lang?: string, table?: string } }) {
  const lang = (searchParams.lang as 'hr'|'en'|'de') || 'hr'

  // 1. Pokušaj naći STOL po random qrSlug-u (npr. /menu/x7K9pQ2m)
  const tableBySlug = await prisma.table.findUnique({
    where: { qrSlug: params.restaurantSlug },
    include: {
      restaurant: {
        include: {
          categories: {
            include: {
              items: { orderBy: { order: 'asc' } },
              children: { include: { items: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
            },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  }).catch(() => null)

  if (tableBySlug) {
    const restaurant = tableBySlug.restaurant as any
    const sortItems = (items:any[]) => [...items].sort((a,b)=>{
      if (a.isBoosted!== b.isBoosted) return a.isBoosted? -1 : 1
      if (a.isBoosted && b.isBoosted) return (b.boostLevel || 0) - (a.boostLevel || 0)
      return (a.order || 0) - (b.order || 0)
    })
    let mains = restaurant.categories.filter((c:any)=>!c.parentId).map((c:any)=>({
      id: c.id, name: c.name, nameEn: c.nameEn, nameDe: c.nameDe, imageUrl: c.imageUrl,
      description: c.description, sendsToKitchen: c.sendsToKitchen, order: c.order,
      items: sortItems(c.items||[]),
      children: (c.children||[]).map((ch:any)=>({ id: ch.id, name: ch.name, nameEn: ch.nameEn, nameDe: ch.nameDe, imageUrl: ch.imageUrl, description: ch.description, sendsToKitchen: ch.sendsToKitchen, order: ch.order, items: sortItems(ch.items||[]) })).sort((a:any,b:any)=>a.order-b.order)
    })).sort((a:any,b:any)=>a.order-b.order)

    if(mains.length===0){
      mains = restaurant.categories.map((c:any)=>({ id: c.id, name: c.name, nameEn: c.nameEn, nameDe: c.nameDe, imageUrl: c.imageUrl, description: c.description, sendsToKitchen: c.sendsToKitchen, order: c.order, items: sortItems(c.items||[]), children: [] }))
    }

    const restaurantPublic = {
      name: restaurant.name, slug: restaurant.slug, serviceMode: restaurant.serviceMode || 'TABLE',
      paymentCashEnabled: restaurant.paymentCashEnabled ?? true,
      paymentCardTerminalEnabled: restaurant.paymentCardTerminalEnabled ?? true,
      paymentCardOnlineEnabled: restaurant.paymentCardOnlineEnabled ?? false,
    }
    return <MenuClient restaurant={restaurantPublic} tableNumber={tableBySlug.number} mains={mains} lang={lang} slug={restaurant.slug} />
  }

  // 2. Ako nije QR slug, blokiraj ?table= pokušaje
  if (searchParams.table) {
    return <div className="p-10 text-center"><h1 className="text-3xl font-bold">Neispravan QR kod</h1><p className="opacity-60 mt-2">Molimo skenirajte QR kod sa stola. Linkovi sa ?table= više nisu dozvoljeni.</p></div>
  }

  // 3. Fallback - ako netko ide na /menu/caffe-bar-lu-ica bez QR-a (samo info stranica)
  let restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.restaurantSlug },
    include: {
      categories: { include: { items: { orderBy: { order: 'asc' } }, children: { include: { items: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
    }
  }).catch(() => null)

  if (!restaurant) return <div className="p-10 text-center"><h1 className="text-3xl font-bold">Restoran nije pronađen</h1><p className="opacity-60 mt-2">Slug: {params.restaurantSlug}</p></div>

  return <div className="p-10 text-center"><h1 className="text-3xl font-bold">{(restaurant as any).name}</h1><p className="opacity-60 mt-2">Molimo skenirajte QR kod sa stola za narudžbu.</p></div>
}
