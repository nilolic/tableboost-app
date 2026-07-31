import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(req: Request) {
  try {
    const cur = await getCurrentUser()
    // samo superadmin smije seedati
    if(!cur || cur.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Samo SUPER_ADMIN može seedati. Prijavi se kao admin.' }, { status: 401 })
    }

    const url = new URL(req.url)
    const force = url.searchParams.get('force') === '1'

    // NE diramo lozinku ako user već postoji - osim ako je force=1
    const existing = await prisma.user.findUnique({ where: { email: 'admin@tableboost.app' } })
    
    if (existing && !force) {
      return NextResponse.json({ 
        ok: true, 
        message: 'Admin već postoji, lozinka NIJE dirana. Dodaj ?force=1 ako želiš reset na admin123',
        user: existing.email 
      })
    }

    const hash = await bcrypt.hash('admin123', 10)
    const user = await prisma.user.upsert({
      where: { email: 'admin@tableboost.app' },
      update: force ? { password: hash } : {}, // SAMO ako je force=1
      create: { email: 'admin@tableboost.app', password: hash, name: 'Admin', role: 'SUPER_ADMIN' }
    })
    return NextResponse.json({ ok: true, user: user.email, role: user.role, forced: force })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
