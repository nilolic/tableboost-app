import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    let restaurantId = user?.restaurantId;
    if (!restaurantId) { const r = await prisma.restaurant.findFirst(); restaurantId = r?.id; }
    if (!restaurantId) return NextResponse.json({ orders: [] });
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from'); const to = searchParams.get('to'); const all = searchParams.get('all') === '1';
    const where: any = { restaurantId };
    if (from || to) { where.createdAt = {}; if (from) where.createdAt.gte = new Date(from); if (to) { const toDate = new Date(to); toDate.setHours(23,59,59,999); where.createdAt.lte = toDate; } }
    const orders = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, take: all? undefined : 500, include: { table: true, items: { include: { menuItem: true } } }, });
    if(user?.role === 'WAITER' || user?.role === 'KITCHEN'){
      const sanitized = orders.map((o:any)=> ({...o, total: 0, tipAmount: 0, tipPercent: 0, }))
      return NextResponse.json({ orders: sanitized });
    }
    return NextResponse.json({ orders });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
