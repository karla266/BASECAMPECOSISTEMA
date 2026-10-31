import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CATALOGO_PATH = path.join(process.cwd(), 'data', 'catalogo_the_trip.json');
const SKU_PHOTO_MAP_PATH = path.join(process.cwd(), 'data', 'sku-photo-map.json');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return (JSON.parse(raw) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const catalogo = await readJson<Array<Record<string, unknown>>>(CATALOGO_PATH, []);
    const photoMap = await readJson<Record<string, string>>(SKU_PHOTO_MAP_PATH, {});

    const productosPOS = Array.isArray(catalogo)
      ? catalogo.map((prod) => {
          const sku = String(prod.sku ?? '').trim();
          const stockValue = Number(prod.stock ?? prod.stock_fisico ?? 0);
          const image = photoMap[sku] || (Array.isArray((prod as { media?: { images?: string[] } }).media?.images) ? (prod as { media?: { images?: string[] } }).media?.images?.[0] : '') || '/placeholder-product.png';

          return {
            id: sku,
            sku,
            barcode: String(prod.barcode ?? sku),
            nombre: String(prod.nombre ?? 'Producto'),
            precio: Number(prod.precio ?? 0),
            stock: stockValue,
            categoria: String(prod.categoria ?? 'The Trip'),
            imagen: image,
            activo: stockValue > 0,
          };
        })
      : [];

    return NextResponse.json({ success: true, count: productosPOS.length, productos: productosPOS }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al cargar productos del POS';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
