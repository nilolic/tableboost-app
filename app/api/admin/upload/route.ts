import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
export const dynamic = 'force-dynamic'
const ALLOWED = ['jpg','jpeg','png','webp','avif','svg']
const MAX_SIZE = 8 * 1024 * 1024
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user?.restaurantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const form = await req.formData()
  const file = form.get('file') as File | null
  const type = form.get('type') as string
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!['logo','login','menu','item','category','food'].includes(type)) return NextResponse.json({ error: 'Invalid type: ' + type }, { status: 400 })
  const origExt = (file.name.split('.').pop() || '').toLowerCase()
  let ext = ALLOWED.includes(origExt)? origExt : 'webp'
  if(file.size > MAX_SIZE) return NextResponse.json({ error: 'File prevelik (max 8MB)' }, { status: 400 })
  if(!file.type.startsWith('image/')) return NextResponse.json({ error: 'Samo slike' }, { status: 400 })
  const bytes = await file.arrayBuffer()
  let buffer = Buffer.from(bytes)
  if (type === 'logo') {
    try {
      const sharp = (await import('sharp')).default
      buffer = await sharp(buffer).resize(400, 400, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toBuffer()
      ext = 'png'
    } catch (e) { console.log('sharp fallback', e) }
  }
  const fileName = `${type}-${Date.now()}.${ext}`
  const dir = path.join(process.cwd(), 'public', 'uploads', user.restaurantId)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, fileName), buffer)
  return NextResponse.json({ url: `/uploads/${user.restaurantId}/${fileName}` })
}
