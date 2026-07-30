import { NextResponse } from 'next/server'
export async function POST(req: Request){
  const res = NextResponse.redirect(new URL('/login', req.url))
  res.cookies.delete('tb_user')
  res.cookies.delete('tb_impersonate')
  return res
}
export async function GET(req: Request){
  const res = NextResponse.redirect(new URL('/login', req.url))
  res.cookies.delete('tb_user')
  res.cookies.delete('tb_impersonate')
  return res
}
