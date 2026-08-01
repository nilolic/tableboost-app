import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getImpersonateId } from '@/lib/auth'
import { getRestaurantId } from '@/lib/getRestaurantId'
import bcrypt from 'bcryptjs'
export const dynamic = 'force-dynamic'

export async function GET(){
  const user = await getCurrentUser()
  const impId = await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if(!user ||!restaurantId) return NextResponse.json({error:'Unauthorized'},{status:401})
  if(!['RESTAURANT_ADMIN','SUPER_ADMIN'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403})
  const staff = await prisma.user.findMany({ where:{ restaurantId, role:{ in:['WAITER','KITCHEN'] } }, orderBy:{ createdAt:'desc' } })
  return NextResponse.json({ staff })
}
export async function POST(req:Request){
  const user = await getCurrentUser()
  const impId = await getImpersonateId()
  const restaurantId = getRestaurantId(user, impId)
  if(!user ||!restaurantId) return NextResponse.json({error:'Unauthorized'},{status:401})
  if(!['RESTAURANT_ADMIN','SUPER_ADMIN'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403})
  const { email, password, name, role } = await req.json()
  if(!email ||!password ||!role) return NextResponse.json({error:'Email, lozinka i rola obavezni'},{status:400})
  if(!['WAITER','KITCHEN'].includes(role)) return NextResponse.json({error:'Rola mora biti WAITER ili KITCHEN'},{status:400})
  if(password.length < 6) return NextResponse.json({error:'Lozinka min 6 znakova'},{status:400})
  const exists = await prisma.user.findUnique({where:{email: email.trim().toLowerCase()}})
  if(exists) return NextResponse.json({error:'Email već postoji'},{status:400})
  const hash = await bcrypt.hash(password,10)
  const created = await prisma.user.create({ data:{ email: email.trim().toLowerCase(), password: hash, name: name || null, role, restaurantId } })
  return NextResponse.json({ok:true, user:created})
}
