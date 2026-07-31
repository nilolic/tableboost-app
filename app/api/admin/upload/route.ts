import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const ALLOWED = ['jpg','jpeg','png','webp','avif','svg']
const MAX_SIZE = 8 * 1024 // 8MB

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user?.restaurantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  const type = form.get('type') as string // logo | login

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!['logo','login'].includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  const origExt = (file.name.split('.').pop() || '').toLowerCase()
  const ext = ALLOWED.includes(origExt) ? origExt : 'webp'

  if(file.size > MAX_SIZE) return NextResponse.json({ error: 'File prevelik (max 8MB)' }, { status: 400 })
  
  // check mime
  if(!file.type.startsWith('image/')) return NextResponse.json({ error: 'Samo slike: JPG, PNG, WEBP' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const fileName = `${type}-${Date.now()}.${ext}`
  const dir = path.join(process.cwd(), 'public', 'uploads', user.restaurantId)
  await mkdir(dir, { recursive: true })
  const filePath = path.join(dir, fileName)
  await writeFile(filePath, buffer)

  const publicUrl = `/uploads/${user.restaurantId}/${fileName}`
  return NextResponse.json({ url: publicUrl })
}
