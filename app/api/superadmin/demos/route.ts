import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(){
  const cur = await getCurrentUser()
  if(!cur||cur.role!=='SUPER_ADMIN') return NextResponse.json({error:'Unauthorized'},{status:401})
  const demos = await prisma.restaurant.findMany({ where: { slug: { startsWith: 'demo-' } }, include: { users:true, _count:{select:{items:true, tables:true}} }, orderBy:{createdAt:'desc'} })
  return NextResponse.json(demos)
}

export async function POST(req:Request){
  const cur = await getCurrentUser()
  if(!cur||cur.role!=='SUPER_ADMIN') return NextResponse.json({error:'Unauthorized'},{status:401})
  try{
    let { demoId, naziv } = await req.json()
    if(!demoId) return NextResponse.json({error:'demoId obavezan'},{status:400})
    demoId = demoId.toLowerCase().trim().replace(/[^a-z0-9\-]/g,'-').replace(/-+/g,'-')
    if(!demoId.startsWith('demo-')) demoId = 'demo-'+demoId
    const name = naziv || `DEMO ${demoId.replace('demo-','').replace(/-/g,' ')}`
    const slug = demoId
    const exists = await prisma.restaurant.findUnique({where:{slug}})
    if(exists) return NextResponse.json({error:'Demo već postoji: '+slug},{status:400})

    const hashSef = await bcrypt.hash('Sef12345!',10)
    const hashKuhar = await bcrypt.hash('Kuhar12345!',10)

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        legalName: name,
        city: 'Split',
        description: 'DEMO restoran kreiran iz SuperAdmina - TableBoost',
        users: {
          create: [
            { email: `${slug}-admin@demo.local`, name: 'Vlasnik DEMO', password: hashSef, role: 'RESTAURANT_ADMIN' },
            { email: `${slug}-kuhar@demo.local`, name: 'Kuhar DEMO', password: hashKuhar, role: 'KITCHEN' },
            { email: `${slug}-konobar@demo.local`, name: 'Konobar DEMO', password: hashKuhar, role: 'WAITER' },
          ]
        },
        tables: {
          create: Array.from({length:8},(_,i)=>({ number:i+1, qrSlug:`${slug}-stol-${i+1}` }))
        },
        categories: {
          create: [
            { name: 'Predjela', order: 1 },
            { name: 'Glavna jela', order: 2 },
            { name: 'Deserti', order: 3 },
            { name: 'Pića', order: 4 },
          ]
        }
      },
      include: { categories:true }
    })

    // dodaj 2 artikla po kategoriji
    for(const cat of restaurant.categories){
      await prisma.menuItem.createMany({
        data: [
          { name: `${cat.name} DEMO 1`, price: 9.5, categoryId: cat.id, restaurantId: restaurant.id, description: 'Demo artikl' },
          { name: `${cat.name} DEMO 2`, price: 12.9, categoryId: cat.id, restaurantId: restaurant.id, description: 'Demo artikl 2' },
        ]
      })
    }

    return NextResponse.json({ok:true, restaurant, creds: { admin:`${slug}-admin@demo.local / Sef12345!`, link:`https://tableboost.app/login` }})
  }catch(e:any){ console.error(e); return NextResponse.json({error:e.message},{status:500}) }
}
