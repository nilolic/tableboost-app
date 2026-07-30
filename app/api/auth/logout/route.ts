import { NextResponse } from 'next/server'
function clearCookies(res: NextResponse){
  res.cookies.set('tb_user','',{ path:'/', maxAge:0, httpOnly:true, sameSite:'lax' })
  res.cookies.set('tb_impersonate','',{ path:'/', maxAge:0, httpOnly:true, sameSite:'lax' })
  return res
}
export async function POST(){
  const res = NextResponse.json({ok:true})
  return clearCookies(res)
}
export async function GET(){
  const res = new NextResponse(null, { status: 302, headers: { Location: '/login' } })
  res.cookies.set('tb_user','',{ path:'/', maxAge:0, httpOnly:true, sameSite:'lax' })
  res.cookies.set('tb_impersonate','',{ path:'/', maxAge:0, httpOnly:true, sameSite:'lax' })
  return res
}
