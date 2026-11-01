import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import https from 'https'
import * as cheerio from 'cheerio'
import { NextResponse } from 'next/server'

const DEFAULT_SOURCES = [
  'https://tiaraexpress.mx/categoria/otros-productos',
  'https://tienda.bluntwrap.com.mx/collections/bluntwrap-hemp',
  'https://tienda.bluntwrap.com.mx/collections/bluntwrap-2x',
]
const CATALOG_DIR = path.join(process.cwd(), 'public', 'uploads', 'catalogo')
const DATA_FILE = path.join(process.cwd(), 'data', 'catalogo_the_trip.json')

const sanitizeText = (value = '') =>
  String(value)
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim()

const slugify = (value = '') =>
  sanitizeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

const normalizeImageUrl = (value = '') => {
  if (!value) return ''
  const raw = value.replace(/\s/g, '')
  const cleaned = raw.split(',')[0]
  return cleaned.includes('http') ? cleaned : ''
}

const ensureDirectory = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true })
}

const detectExtension = (url = '') => {
  try {
    const pathname = new URL(url).pathname || ''
    const match = pathname.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/)
    return match ? match[1].toLowerCase() : 'jpg'
  } catch {
    return 'jpg'
  }
}

const parsePrice = (text = '') => {
  const match = sanitizeText(text).match(/\d[\d,.]*/)
  if (!match) return 0
  const raw = match[0].replace(/,/g, '')
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

const downloadImage = async (imageUrl, productTitle) => {
  const cleanUrl = normalizeImageUrl(imageUrl)
  if (!cleanUrl) return ''

  const safeName = slugify(productTitle || 'producto') || 'producto'
  const ext = detectExtension(cleanUrl)
  const fileName = `${safeName}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}.${ext}`
  const outputPath = path.join(CATALOG_DIR, fileName)

  try {
    const response = await axios.get(cleanUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      maxRedirects: 5,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      validateStatus: (status) => status >= 200 && status < 400,
    })

    if (!response.data) return ''
    await fs.writeFile(outputPath, Buffer.from(response.data))
    return `/uploads/catalogo/${fileName}`
  } catch {
    return ''
  }
}

const getSourceUrls = (payload = {}) => {
  const rawUrls = Array.isArray(payload.urls) ? payload.urls : []
  const single = payload.url ? [payload.url] : []
  return rawUrls.length ? rawUrls : single.length ? single : DEFAULT_SOURCES
}

const getCategoryLabel = (sourceUrl = '') => {
  if (sourceUrl.includes('tiara')) return 'Accesorios para fumar'
  if (sourceUrl.includes('hemp')) return 'Hemp CBD'
  return 'Rolling Paper'
}

const extractProductCards = ($) => {
  const selectors = [
    'article.product',
    '.product-card',
    '.product-item',
    '.grid-product',
    '.card',
    'li.product',
    '[data-product-id]',
    'div.product',
    'a[href*="/products/"]',
    'a[href*="/producto/"]',
  ]

  const nodes = []
  selectors.forEach((selector) => {
    $(selector).each((_, el) => {
      const text = sanitizeText($(el).text())
      const images = $(el).find('img, picture source').length
      if (text && (images > 0 || $(el).attr('href') || $(el).attr('data-product-id'))) {
        nodes.push(el)
      }
    })
  })

  return nodes
}

const buildProductCandidate = ($, el, index, sourceUrl) => {
  const anchor = $(el).find('a[href*="/products/"] , a[href*="/producto/"]').first()
  const nameText = anchor.length
    ? anchor.text()
    : $(el).find('h2, h3, h4, .title, .product-title, .product-name, .wd-entities-title').first().text()

  const nombre = sanitizeText(nameText || $(el).attr('data-title') || `Producto ${index + 1}`)
    .replace(/\s+\|\s+.*$/, '')

  const priceNode = $(el).find('.price, .product-price, [data-price], .money, .price__regular, .price-sale, .price-wrapper').first()
  const priceText = sanitizeText(priceNode.length ? priceNode.text() : $(el).text())
  const precio = parsePrice(priceText)

  const imageNode = $(el).find('img').first()
  const imageUrl = normalizeImageUrl(
    imageNode.attr('src') || imageNode.attr('data-src') || imageNode.attr('data-srcset') || '',
  )

  return {
    sku: `BW-${sourceUrl.includes('tiara') ? 'TR' : '2X'}-${String(index + 1).padStart(3, '0')}`,
    nombre: nombre || `Bluntwrap ${index + 1}`,
    precio: Number((precio || 0).toFixed(2)),
    stock: index % 7 === 0 ? 0 : 20,
    categoria: getCategoryLabel(sourceUrl),
    media: {
      images: [imageUrl || '', '', '', ''],
      video: '',
    },
  }
}

async function importarCatalogo(sourceUrl = DEFAULT_SOURCES[0]) {
  await ensureDirectory(CATALOG_DIR)

  const response = await axios.get(sourceUrl, {
    timeout: 20000,
    maxRedirects: 6,
    validateStatus: (status) => status >= 200 && status < 400,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  })

  if (!response.data || !String(response.data).trim()) {
    throw new Error('La respuesta del catálogo está vacía.')
  }

  const $ = cheerio.load(response.data)
  const nodes = extractProductCards($)

  if (!nodes.length) {
    throw new Error('No se encontraron productos válidos en la URL proporcionada.')
  }

  const productos = []
  const vistos = new Set()

  for (let index = 0; index < nodes.length; index += 1) {
    const el = nodes[index]
    const producto = buildProductCandidate($, el, productos.length, sourceUrl)
    const key = `${producto.nombre}-${producto.precio}`
    if (vistos.has(key)) continue
    vistos.add(key)

    const localImage = producto.media.images[0]
      ? await downloadImage(producto.media.images[0], producto.nombre)
      : ''

    producto.media.images[0] = localImage || ''
    if (!producto.media.images[0]) {
      producto.media.images = ['', '', '', '']
    }

    productos.push(producto)
  }

  return productos
}

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => ({}))
    const sourceUrls = getSourceUrls(payload)
    const allItems = []

    for (const sourceUrl of sourceUrls) {
      const items = await importarCatalogo(sourceUrl)
      allItems.push(...items)
    }

    const deduped = []
    const check = new Set()
    allItems.forEach((item) => {
      const key = `${item.nombre}-${item.precio}`
      if (!check.has(key)) {
        check.add(key)
        deduped.push(item)
      }
    })

    await ensureDirectory(path.dirname(DATA_FILE))
    await fs.writeFile(DATA_FILE, JSON.stringify(deduped, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      source: sourceUrls,
      count: deduped.length,
      file: '/data/catalogo_the_trip.json',
      items: deduped,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al importar catálogo.',
        source: DEFAULT_SOURCES,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    await ensureDirectory(path.dirname(DATA_FILE))
    const raw = await fs.readFile(DATA_FILE, 'utf-8').catch(() => '[]')
    const items = JSON.parse(raw || '[]')

    return NextResponse.json({ success: true, count: Array.isArray(items) ? items.length : 0, items }, { status: 200 })
  } catch {
    return NextResponse.json({ success: false, count: 0, items: [] }, { status: 200 })
  }
}
