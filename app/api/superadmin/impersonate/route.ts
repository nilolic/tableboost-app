import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req:Request){
  const cur = await getCurrentUser()
  if(!cur||cur.role!=='SUPER_ADMIN') return NextResponse.json({error:'Unauthorized'},{status:401})
  const { restaurantId } = await req.json()
  if(!restaurantId) return NextResponse.json({error:'No restaurantId'},{status:400})
  const res = NextResponse.json({ok:true, restaurantId})
  res.cookies.set('tb_impersonate', restaurantId, { httpOnly:true, path:'/', maxAge:60*60*2, sameSite:'lax' })
  return res
}

export async function GET(req:Request){
  const url = new URL(req.url)
  if(url.searchParams.get('clear')!==null){
    // FIX: ne radimo redirect na localhost, nego obrišemo cookie i vratimo redirect na relativni path sa ispravnim hostom
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost')? 'http' : 'https')
    // Ako imamo host, napravi apsolutni URL sa tim hostom, inače relativni
    const redirectUrl = host? `${proto}://${host}/superadmin` : '/superadmin'

    const res = NextResponse.redirect(redirectUrl, 302)
    res.cookies.set('tb_impersonate', '', { httpOnly:true, path:'/', maxAge:0 })
    return res
  }
  return NextResponse.json({ok:true})
}

export async function DELETE(){
  const res = NextResponse.json({ok:true, cleared:true})
  res.cookies.set('tb_impersonate', '', { httpOnly:true, path:'/', maxAge:0 })
  return res
}
