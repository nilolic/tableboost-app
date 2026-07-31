import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { status } = await req.json();
  const order = await prisma.order.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(order);
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.order.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
