import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { translateText } from '@/lib/deepl'
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['RESTAURANT_ADMIN','SUPER_ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { text, targetLang, sourceLang } = await req.json()
  if (!text ||!targetLang) return NextResponse.json({ error: 'text i targetLang obavezni' }, { status: 400 })
  try {
    const translated = await translateText(text, targetLang, sourceLang || 'HR')
    return NextResponse.json({ translated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
