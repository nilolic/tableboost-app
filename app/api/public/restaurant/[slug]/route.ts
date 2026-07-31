import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const r = await prisma.restaurant.findUnique({
    where: { slug: params.slug },
    select: { name: true, slug: true, logoUrl: true, loginImageUrl: true }
  })
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(r)
}
