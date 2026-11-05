import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { usuarioDeLaSesion } from '@/lib/adminGuard'

const PHOTO_DIR = path.resolve(process.cwd(), '..', 'data', 'media', 'sales_photos')
const ALLOWED = /^[\w.-]+\.(jpe?g|png|webp)$/i

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name: rawName } = await params
  let decoded = ''
  try {
    decoded = decodeURIComponent(rawName || '')
  } catch {
    return NextResponse.json({ error: 'Archivo no permitido.' }, { status: 400 })
  }
  const name = path.basename(decoded)
  if (!ALLOWED.test(name) || name !== decoded) {
    return NextResponse.json({ error: 'Archivo no permitido.' }, { status: 400 })
  }

  const resolved = path.resolve(PHOTO_DIR, name)
  if (!resolved.startsWith(path.resolve(PHOTO_DIR) + path.sep) || !fs.existsSync(resolved)) {
    return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404 })
  }

  const extension = path.extname(name).toLowerCase()
  const bytes = fs.readFileSync(resolved)
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': TYPES[extension] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    },
  })
}

function nombreDeFoto(raw: string): string | null {
  let decoded = ''
  try {
    decoded = decodeURIComponent(raw || '')
  } catch {
    return null
  }
  const name = path.basename(decoded)
  if (!name || name !== decoded || name.includes('..') || /[\\/]/.test(decoded)) return null
  if (!ALLOWED.test(name)) return null
  return name
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name: rawName } = await params
  const sesion = await usuarioDeLaSesion()
  if (!sesion) {
    return NextResponse.json({ error: 'Inicia sesión para continuar.' }, { status: 401 })
  }

  const name = nombreDeFoto(rawName || '')
  if (!name) {
    return NextResponse.json({ error: 'Archivo no permitido.' }, { status: 400 })
  }

  const root = path.resolve(PHOTO_DIR)
  const resolved = path.resolve(root, name)
  const relativo = path.relative(root, resolved)
  if (!relativo || relativo.startsWith('..') || path.isAbsolute(relativo) || relativo !== name) {
    return NextResponse.json({ error: 'Archivo no permitido.' }, { status: 400 })
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404 })
  }

  fs.unlinkSync(resolved)
  return NextResponse.json({ ok: true })
}
