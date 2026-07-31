import { prisma } from './prisma'

export async function getUpsells(restaurantId: string, cartIds: string[], limit = 4) {
  if (!cartIds.length) {
    return prisma.menuItem.findMany({
      where: { restaurantId, available: true, upsellEnabled: true, isBoosted: true },
      take: limit,
      orderBy: [{ boostLevel: 'desc' }, { order: 'asc' }]
    })
  }
  const rules = await prisma.upsellRule.findMany({
    where: { restaurantId, sourceId: { in: cartIds } },
    include: { target: true },
    orderBy: { strength: 'desc' },
    take: 20
  })

  const map = new Map<string, { item: any, score: number }>()
  for (const r of rules) {
    if (!r.target.available || cartIds.includes(r.target.id)) continue
    const score = r.strength * (r.target.isBoosted? 2 : 1) * ((r.target.boostLevel || 0) + 1)
    map.set(r.target.id, { item: r.target, score: (map.get(r.target.id)?.score || 0) + score })
  }

  let result = Array.from(map.values()).sort((a,b)=>b.score-a.score).map(v=>v.item)

  if (result.length < limit) {
    const filler = await prisma.menuItem.findMany({
      where: { restaurantId, available: true, upsellEnabled: true, id: { notIn: [...cartIds,...result.map((x:any)=>x.id)] } },
      orderBy: [{ isBoosted: 'desc' }, { boostLevel: 'desc' }, { order: 'asc' }],
      take: limit - result.length
    })
    result = [...result,...filler]
  }
  return result.slice(0, limit)
}
