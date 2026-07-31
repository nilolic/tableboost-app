import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const user = await getCurrentUser();
    let restaurantId = user?.restaurantId;
    if (!restaurantId) {
      const r = await prisma.restaurant.findFirst();
      restaurantId = r?.id;
    }
    if (!restaurantId) return NextResponse.json({ orders: [] });
    
    const orders = await prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { table: true, items: { include: { menuItem: true } } },
    });
    return NextResponse.json({ orders });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
