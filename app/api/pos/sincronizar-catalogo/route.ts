import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CATALOG_PATH = path.join(process.cwd(), 'data', 'catalogo_the_trip.json');
const MAP_PATH = path.join(process.cwd(), 'data', 'sku-photo-map.json');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizeKey(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return (JSON.parse(raw) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function POST() {
  try {
    const catalogRaw = await readJson<CatalogoItem[]>(CATALOG_PATH, []);
    if (!Array.isArray(catalogRaw) || catalogRaw.length === 0) {
      return NextResponse.json(
        {
          success: false,
          count: 0,
          message: 'No existe data/catalogo_the_trip.json o está vacío. Importa primero el catálogo desde la administración.',
        },
        { status: 400 },
      );
    }

    const existingMap = await readJson<Record<string, string>>(MAP_PATH, {});
    const nextMap: Record<string, string> = { ...(existingMap ?? {}) };

    let synced = 0;

    for (const item of catalogRaw) {
      const sku = String(item?.sku ?? '').trim();
      const firstImage = Array.isArray(item?.media?.images) ? String(item.media.images[0] ?? '').trim() : '';
      if (!sku || !firstImage) {
        continue;
      }

      const barcode = typeof item.barcode === 'string' && item.barcode.trim() ? String(item.barcode).trim() : sku;
      nextMap[normalizeKey(sku)] = firstImage;
      nextMap[normalizeKey(barcode)] = firstImage;
      synced += 1;
    }

    await fs.mkdir(path.dirname(MAP_PATH), { recursive: true });
    await fs.writeFile(MAP_PATH, JSON.stringify(nextMap, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      count: synced,
      message: `Se sincronizaron ${synced} productos con el POS local.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al sincronizar catálogo con el POS.';
    return NextResponse.json(
      {
        success: false,
        count: 0,
        message,
      },
      { status: 500 },
    );
  }
}

type CatalogoItem = {
  sku?: string;
  barcode?: string;
  media?: {
    images?: string[];
    video?: string;
  };
};
