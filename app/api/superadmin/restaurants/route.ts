import crypto from 'crypto';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'
export async function POST(req: Request){
  const cur = await getCurrentUser()
  if(!cur||cur.role!=='SUPER_ADMIN') return NextResponse.json({error:'Unauthorized'},{status:401})
  try{
    const { name, slug, ownerName, ownerEmail, ownerPass } = await req.json()
    if(!name||!slug||!ownerEmail||!ownerPass) return NextResponse.json({error:'Sva polja obavezna'},{status:400})
    const ex = await prisma.restaurant.findUnique({where:{slug}})
    if(ex) return NextResponse.json({error:'Slug postoji'},{status:400})
    const hash = await bcrypt.hash(ownerPass,10)
    const r = await prisma.restaurant.create({ data: { name, slug, users:{ create:{ email:ownerEmail, name:ownerName, password:hash, role:'RESTAURANT_ADMIN' } }, tables:{ create: Array.from({length:10},(_,i)=>({ number:i+1, qrSlug: crypto.randomBytes(6).toString('base64url') })) } } })
    return NextResponse.json({ok:true,restaurant:r})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
