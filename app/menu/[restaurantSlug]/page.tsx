import { prisma } from "@/lib/prisma"
export default async function MenuPage({ params }: { params: { restaurantSlug: string } }) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.restaurantSlug },
    include: { categories: { include: { items: true } } }
  }).catch(() => null)
  if (!restaurant) return <div className="p-10 text-center"><h1 className="text-3xl font-bold">Restoran nije pronađen</h1><p>Dodaj ga u Prisma Studiu sa slug: {params.restaurantSlug}</p></div>
  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white">
      <header className="p-6 bg-black text-white text-center">
        <h1 className="text-3xl font-black">{restaurant.name}</h1>
        <p className="opacity-70">{restaurant.address}</p>
      </header>
      <div className="p-6 space-y-8">
        {restaurant.categories.map(cat => (
          <div key={cat.id}>
            <h2 className="text-xl font-bold mb-3 border-b pb-2">{cat.name}</h2>
            <div className="space-y-4">
              {cat.items.map(item => (
                <div key={item.id} className="flex justify-between gap-4">
                  <div><div className="font-semibold">{item.name}</div><div className="text-sm text-neutral-500">{item.description}</div></div>
                  <div className="font-bold">€{item.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
