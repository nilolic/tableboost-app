import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email i lozinka obavezni' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Korisnik ne postoji' }, { status: 401 })
    }
    let valid = false
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      valid = await bcrypt.compare(password, user.password)
    } else {
      valid = user.password === password
    }
    if (!valid) {
      return NextResponse.json({ error: 'Kriva lozinka' }, { status: 401 })
    }
    const res = NextResponse.json({ role: user.role, email: user.email, id: user.id })
    res.cookies.set('tb_user', JSON.stringify({ id: user.id, role: user.role, restaurantId: user.restaurantId, email: user.email }), { httpOnly: true, path: '/', maxAge: 60*60*24*7, sameSite: 'lax' })
    return res
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error: e.message || 'Server greska' }, { status: 500 })
  }
}
