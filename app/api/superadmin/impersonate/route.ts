import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
export async function POST(req:Request){
  const cur = await getCurrentUser()
  if(!cur||cur.role!=='SUPER_ADMIN') return NextResponse.json({error:'Unauthorized'},{status:401})
  const { restaurantId } = await req.json()
  const res = NextResponse.json({ok:true})
  res.cookies.set('tb_impersonate', restaurantId, { httpOnly:true, path:'/', maxAge:60*60*2 })
  return res
}
export async function GET(req:Request){
  const url = new URL(req.url)
  if(url.searchParams.get('clear')){
    const res = NextResponse.redirect(new URL('/superadmin', req.url))
    res.cookies.delete('tb_impersonate')
    return res
  }
  return NextResponse.json({ok:true})
}
