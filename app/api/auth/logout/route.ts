import { NextResponse } from 'next/server'
export async function POST(req: Request){
  const res = NextResponse.json({ok:true})
  res.cookies.set('tb_user','',{ path:'/', maxAge:0, httpOnly:true })
  res.cookies.set('tb_impersonate','',{ path:'/', maxAge:0, httpOnly:true })
  return res
}
export async function GET(req: Request){
  const res = NextResponse.redirect(new URL('/login', req.url))
  res.cookies.set('tb_user','',{ path:'/', maxAge:0, httpOnly:true })
  res.cookies.set('tb_impersonate','',{ path:'/', maxAge:0, httpOnly:true })
  return res
}
