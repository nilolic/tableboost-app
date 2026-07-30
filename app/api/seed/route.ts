import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const hash = await bcrypt.hash('admin123', 10)
    const user = await prisma.user.upsert({
      where: { email: 'admin@tableboost.app' },
      update: { password: hash, role: 'SUPER_ADMIN', name: 'Admin' },
      create: { email: 'admin@tableboost.app', password: hash, name: 'Admin', role: 'SUPER_ADMIN' }
    })
    return NextResponse.json({ ok: true, user: user.email, role: user.role })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
