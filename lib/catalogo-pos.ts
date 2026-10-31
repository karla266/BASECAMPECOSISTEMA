import fs from 'fs/promises';
import path from 'path';

export type CatalogoTheTripItem = {
  sku: string;
  barcode?: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria?: string;
  media?: {
    images?: string[];
    video?: string;
  };
};

export type SkuPhotoMap = Record<string, string>;

export const CATALOG_PATH = path.join(process.cwd(), 'data', 'catalogo_the_trip.json');
export const SKU_PHOTO_MAP_PATH = path.join(process.cwd(), 'data', 'sku-photo-map.json');

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export async function readCatalogoTheTrip(): Promise<CatalogoTheTripItem[]> {
  const catalog = await readJsonFile<CatalogoTheTripItem[]>(CATALOG_PATH, []);
  return Array.isArray(catalog) ? catalog : [];
}

export async function readSkuPhotoMap(): Promise<SkuPhotoMap> {
  const map = await readJsonFile<Record<string, string>>(SKU_PHOTO_MAP_PATH, {});
  if (!map || typeof map !== 'object') {
    return {};
  }
  return Object.fromEntries(
    Object.entries(map)
      .filter(([, value]) => typeof value === 'string' && value.trim())
      .map(([key, value]) => [String(key).trim(), String(value).trim()]),
  );
}

export async function writeSkuPhotoMap(map: SkuPhotoMap): Promise<void> {
  await fs.mkdir(path.dirname(SKU_PHOTO_MAP_PATH), { recursive: true });
  await fs.writeFile(SKU_PHOTO_MAP_PATH, JSON.stringify(map, null, 2), 'utf8');
}

export function normalizeCatalogoLookup(value: string): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export async function resolveCatalogoProduct(input: string): Promise<CatalogoTheTripItem | null> {
  const searchValue = normalizeCatalogoLookup(input);
  if (!searchValue) return null;

  const catalog = await readCatalogoTheTrip();
  for (const item of catalog) {
    const sku = normalizeCatalogoLookup(item.sku);
    const barcode = normalizeCatalogoLookup(item.barcode ?? '');
    const nombre = item.nombre?.trim().toUpperCase() ?? '';
    if (sku === searchValue || barcode === searchValue || nombre.includes(searchValue) || item.nombre.toUpperCase().includes(searchValue)) {
      return item;
    }
  }

  return null;
}

export async function descontarStockCatalogoLocal(
  itemsVendidos: Array<{ sku?: string; barcode?: string; cantidad?: number | string }> = [],
): Promise<{ updated: number; skipped: number }> {
  if (!Array.isArray(itemsVendidos) || itemsVendidos.length === 0) {
    return { updated: 0, skipped: 0 };
  }

  const catalog = await readCatalogoTheTrip();
  let updated = 0;

  for (const item of itemsVendidos) {
    if (!item || (!item.sku && !item.barcode)) {
      continue;
    }

    const sku = String(item.sku ?? '').trim();
    const barcode = String(item.barcode ?? '').trim();
    const cantidad = Number(item.cantidad ?? 1);
    const match = catalog.find((producto) => {
      const candidateSku = String(producto.sku ?? '').trim();
      const candidateBarcode = String(producto.barcode ?? '').trim();
      return (
        (!!sku && candidateSku.toUpperCase() === sku.toUpperCase()) ||
        (!!barcode && candidateBarcode.toUpperCase() === barcode.toUpperCase())
      );
    });

    if (!match) {
      continue;
    }

    const targetQty = Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1;
    const currentStock = Number(match.stock) || 0;
    match.stock = Math.max(0, currentStock - targetQty);
    updated += 1;
  }

  await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');
  return { updated, skipped: itemsVendidos.length - updated };
}
