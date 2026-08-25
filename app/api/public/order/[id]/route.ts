import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(_:Request, {params}:{params:{id:string}}){
  const order = await prisma.order.findUnique({ where: { id: params.id }, select: { id:true, status:true } })
  if(!order) return NextResponse.json({ error:'Not found' }, { status:404 })
  return NextResponse.json(order)
}
