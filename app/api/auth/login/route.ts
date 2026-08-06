import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { pending2FA } from '@/lib/twofa'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email i lozinka obavezni' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (!user) return NextResponse.json({ error: 'Korisnik ne postoji' }, { status: 401 })
    let valid = false
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      valid = await bcrypt.compare(password, user.password)
    } else {
      valid = user.password === password
    }
    if (!valid) return NextResponse.json({ error: 'Kriva lozinka' }, { status: 401 })

    // 1:1 kao haccp-pro/server.js linija 78
    if ((user as any).totp_enabled && (user as any).totp_secret) {
      const tempId = crypto.randomUUID()
      pending2FA.set(tempId, { userId: user.id, expires: Date.now() + 5*60*1000 })
      return NextResponse.json({ requires2FA: true, tempId })
    }

    // ako admin upalio 2FA a user jos nema secret - pusti ga da se logira pa ce frontend traziti setup
    if ((user as any).totp_secret && !(user as any).totp_enabled) {
      const res = NextResponse.json({ role: user.role, email: user.email, id: user.id, requiresSetup: true })
      res.cookies.set('tb_user', JSON.stringify({ id: user.id, role: user.role, restaurantId: user.restaurantId, email: user.email }), { httpOnly: true, path: '/', maxAge: 60*60*24*7, sameSite: 'lax' })
      return res
    }

    const res = NextResponse.json({ role: user.role, email: user.email, id: user.id })
    res.cookies.set('tb_user', JSON.stringify({ id: user.id, role: user.role, restaurantId: user.restaurantId, email: user.email }), { httpOnly: true, path: '/', maxAge: 60*60*24*7, sameSite: 'lax' })
    return res
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error: e.message || 'Server greska' }, { status: 500 })
  }
}
