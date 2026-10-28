import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const PHOTO_DIR = path.resolve(process.cwd(), '..', 'data', 'media', 'sales_photos')
const ALLOWED = /\.(jpe?g|png|webp)$/i

function ensureDir() {
  fs.mkdirSync(PHOTO_DIR, { recursive: true })
}

export async function GET() {
  if (!fs.existsSync(PHOTO_DIR)) {
    return NextResponse.json({ images: [] })
  }

  const images = fs
    .readdirSync(PHOTO_DIR)
    .filter((name) => ALLOWED.test(name) && path.basename(name) === name)
    .map((name) => {
      const stat = fs.statSync(path.join(PHOTO_DIR, name))
      return {
        name,
        url: `/api/webcam/${encodeURIComponent(name)}`,
        size: stat.size,
        updated: stat.mtime.toISOString(),
      }
    })
    .sort((a, b) => b.updated.localeCompare(a.updated))

  return NextResponse.json({ images })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const dataUrl = String(body?.image_data_url || '')
  const match = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/)
  if (!match) {
    return NextResponse.json({ error: 'La imagen debe ser un data URL de foto.' }, { status: 400 })
  }

  const extension = match[1] === 'jpeg' ? 'jpg' : match[1]
  let binary: Buffer
  try {
    binary = Buffer.from(match[2], 'base64')
  } catch {
    return NextResponse.json({ error: 'No se pudo leer la imagen.' }, { status: 400 })
  }
  if (binary.length < 1024 || binary.length > 8_000_000) {
    return NextResponse.json({ error: 'El tamaño de la foto no es válido.' }, { status: 400 })
  }

  ensureDir()
  const filename = `webcam_${Date.now()}.${extension}`
  fs.writeFileSync(path.join(PHOTO_DIR, filename), binary)

  return NextResponse.json({
    status: 'success',
    name: filename,
    url: `/api/webcam/${encodeURIComponent(filename)}`,
  })
}
