import type { Pool } from 'mysql2/promise';
import { getDbConnection } from '@/lib/db';
import { fetchMeliOrder, type MeliOrder } from '@/lib/mercadolibre';
import { getMeliToken } from '@/lib/mercadolibreAuth';

/**
 * Cascada real de descuento de stock para ventas de Mercado Libre:
 *
 *   1. Mercado Libre (verificación)  -> se confirma el pedido con la API,
 *      nunca se confía ciegamente en el webhook.
 *   2. MariaDB SICAR (fuente de verdad del ERP) -> se descuenta `articulo`
 *      por `seller_sku` == `clave`, dentro de una transacción con
 *      idempotencia vía `basecamp_inyecciones`.
 *   3. SQLite / catálogo local (mostrador) -> se refleja el mismo
 *      descuento para que el Micro-POS no venda lo que ya se fue por ML.
 *
 * Cualquier paso puede fallar sin tumbar a los demás: cada uno se reporta
 * por separado para poder reintentar solo lo que falló.
 */

export interface CascadeResult {
  orderId: string;
  alreadyProcessed: boolean;
  meliOrder?: MeliOrder;
  sicar: { applied: boolean; folio?: string; error?: string };
  local: { applied: boolean; updated?: number; error?: string };
}

const IDEMPOTENCY_DDL = `
  CREATE TABLE IF NOT EXISTS basecamp_inyecciones (
    orden_id_ml VARCHAR(50) PRIMARY KEY,
    sicar_folio VARCHAR(50),
    committed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

type Queryable = {
  query: (sql: string, values?: unknown[]) => Promise<[unknown, unknown]>;
};

async function yaFueInyectada(db: Queryable, orderId: string): Promise<boolean> {
  await db.query(IDEMPOTENCY_DDL);
  const [rows] = await db.query('SELECT 1 FROM basecamp_inyecciones WHERE orden_id_ml = ? LIMIT 1', [orderId]);
  return Array.isArray(rows) && rows.length > 0;
}

async function marcarInyectada(db: Queryable, orderId: string, folio: string): Promise<void> {
  await db.query(
    'INSERT INTO basecamp_inyecciones (orden_id_ml, sicar_folio) VALUES (?, ?) ON DUPLICATE KEY UPDATE sicar_folio = VALUES(sicar_folio)',
    [orderId, folio],
  );
}

const HISTORIAL_DDL = `
  CREATE TABLE IF NOT EXISTS basecamp_salidas_ml_historial (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    orden_id_ml VARCHAR(50) NOT NULL,
    sku VARCHAR(80) NOT NULL,
    cantidad DECIMAL(12,4) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_salidas_ml_orden (orden_id_ml),
    INDEX idx_salidas_ml_sku (sku)
  )
`;

/** Códigos MariaDB de contención transitoria: deadlock (1213) / lock wait timeout (1205). */
const DEADLOCK_CODES = new Set([1205, 1213]);

function esErrorDeContencion(error: unknown): boolean {
  const code = (error as { errno?: number })?.errno;
  return typeof code === 'number' && DEADLOCK_CODES.has(code);
}

async function descontarEnSicar(
  pool: Pool,
  orderId: string,
  items: Array<{ sku: string; cantidad: number }>,
  maxIntentos = 5,
): Promise<{ applied: boolean; folio?: string; error?: string }> {
  for (let intento = 1; intento <= maxIntentos; intento += 1) {
    const conn = await pool.getConnection();
    try {
      await conn.query('SET SESSION innodb_lock_wait_timeout = 5');
      await conn.beginTransaction();

      if (await yaFueInyectada(conn, orderId)) {
        await conn.rollback();
        return { applied: true, folio: orderId };
      }

      for (const item of items) {
        if (!item.sku || item.cantidad <= 0) continue;
        await conn.query(HISTORIAL_DDL);
        const [resultExistencia] = await conn.query(
          'UPDATE existencia SET EXISTENCIA = EXISTENCIA - ? WHERE clave = ?',
          [item.cantidad, item.sku],
        );
        const affectedExistencia = (resultExistencia as { affectedRows?: number }).affectedRows ?? 0;
        if (affectedExistencia < 1) {
          const [resultArticulo] = await conn.query(
            'UPDATE articulo SET existencia = existencia - ?, disponible = disponible - ? WHERE clave = ?',
            [item.cantidad, item.cantidad, item.sku],
          );
          const affectedArticulo = (resultArticulo as { affectedRows?: number }).affectedRows ?? 0;
          if (affectedArticulo < 1) {
            throw new Error(`SKU ${item.sku} no existe en SICAR (clave); no se descontó.`);
          }
        }
        await conn.query(
          'INSERT INTO basecamp_salidas_ml_historial (orden_id_ml, sku, cantidad) VALUES (?, ?, ?)',
          [orderId, item.sku, item.cantidad],
        );
      }

      await marcarInyectada(conn, orderId, orderId);
      await conn.commit();
      return { applied: true, folio: orderId };
    } catch (error) {
      try {
        await conn.rollback();
      } catch {
        // la conexión ya pudo haberse perdido; no hay nada más que hacer aquí.
      }
      if (esErrorDeContencion(error) && intento < maxIntentos) {
        const espera = Math.min(8000, 250 * 2 ** (intento - 1)) * (0.75 + Math.random() * 0.5);
        await new Promise((resolve) => setTimeout(resolve, espera));
        continue;
      }
      return { applied: false, error: error instanceof Error ? error.message : String(error) };
    } finally {
      conn.release();
    }
  }
  return { applied: false, error: 'Se agotaron los reintentos ante contención de MariaDB.' };
}

async function replicarStockEnMicroPos(
  tenantId: string,
  orderId: string,
  items: Array<{ sku: string; cantidad: number }>,
): Promise<{ applied: boolean; updated?: number; error?: string }> {
  const base = (process.env.POS_SYNC_API_BASE || process.env.POS_API_BASE || 'http://127.0.0.1:8000').replace(/\/$/, '');
  try {
    const response = await fetch(`${base}/api/v1/sync/ml-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, order_id: orderId, items }),
    });
    const data = (await response.json().catch(() => ({}))) as { updated?: number; detail?: string };
    if (!response.ok) {
      return { applied: false, error: data.detail || `sync local falló con ${response.status}` };
    }
    return { applied: true, updated: Number(data.updated || 0) };
  } catch (error) {
    return { applied: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Ejecuta la cascada completa para una orden de Mercado Libre ya
 * parseada por `parseOrderNotification`. `tenantId` decide qué token
 * OAuth y qué pool SICAR (puerto) se usan.
 */
export async function aplicarCascadaVentaMeli(
  orderId: string,
  tenantId: string,
  sicarPort: number,
): Promise<CascadeResult> {
  const token = await getMeliToken(tenantId);
  if (!token) {
    throw new Error(`No hay token de Mercado Libre guardado para el tenant "${tenantId}". Completa el OAuth primero.`);
  }

  const meliOrder = await fetchMeliOrder(orderId, token.accessToken);
  if (meliOrder.status !== 'paid') {
    // No es un error: una orden "confirmed"/"cancelled" no debe tocar stock todavía.
    return {
      orderId,
      alreadyProcessed: false,
      meliOrder,
      sicar: { applied: false, error: `status=${meliOrder.status}, se ignora hasta que esté 'paid'` },
      local: { applied: false, error: 'no aplicado: orden no pagada' },
    };
  }

  const items = (meliOrder.order_items || []).map((oi) => ({
    sku: oi.item.seller_sku || oi.item.id,
    cantidad: Number(oi.quantity) || 0,
  }));

  const pool = getDbConnection(sicarPort);
  const alreadyProcessed = await yaFueInyectada(pool, orderId);

  const sicarResult = alreadyProcessed
    ? { applied: true, folio: orderId }
    : await descontarEnSicar(pool, orderId, items);

  let localResult: { applied: boolean; updated?: number; error?: string };
  if (sicarResult.applied) {
    localResult = await replicarStockEnMicroPos(tenantId, orderId, items);
  } else {
    localResult = { applied: false, error: 'no aplicado: falló el paso de SICAR' };
  }

  return { orderId, alreadyProcessed, meliOrder, sicar: sicarResult, local: localResult };
}
