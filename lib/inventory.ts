import { getDbConnection } from '@/lib/db';
import type { RowDataPacket } from 'mysql2/promise';

export interface InventoryRow {
  clave: string;
  descripcion: string;
  existencia: number;
  precio: number;
  sucursal: string;
}

interface StoreConfig {
  key: 'madera' | 'smokeshop';
  label: string;
  port: number;
}

export const STORES: StoreConfig[] = [
  { key: 'madera', label: 'Papelería Madera (3306)', port: 3306 },
  { key: 'smokeshop', label: 'Tienda General (3307)', port: 3307 },
];

/**
 * Búsqueda en una sucursal SICAR. Los pools se crean al momento de la
 * petición (lazy), no al importar el módulo, para que un error de
 * configuración no tumbe el arranque del route.
 */
export async function searchStore(
  store: StoreConfig,
  query: string
): Promise<InventoryRow[]> {
  const pool = getDbConnection(store.port);
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT clave, descripcion, existencia, precio FROM articulo WHERE descripcion LIKE ? LIMIT 10',
    [`%${query}%`]
  );
  return rows.map((row) => ({
    clave: String(row.clave),
    descripcion: String(row.descripcion),
    existencia: Number(row.existencia),
    precio: Number(row.precio),
    sucursal: store.label,
  }));
}

export function selectedStores(storeParam: string | null): StoreConfig[] {
  const store = storeParam || 'all';
  if (store === 'all') return STORES;
  return STORES.filter((s) => s.key === store);
}
