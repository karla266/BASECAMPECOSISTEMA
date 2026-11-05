import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";

export type StockDeltaInput = {
  idempotency_key: string;
  articulo_clave: string;
  delta: number;
  existencia_final?: number | null;
  origen?: "POINT" | "SICAR_MANUAL";
};

export type WebSaleItem = {
  clave: string;
  qty: number;
  title?: string;
};

export type WebSaleQueueEntry = {
  order_id: string;
  idempotency_key: string;
  status: "PENDING_SICAR" | "SYNCED_SICAR";
  source: "MERCADOPAGO";
  created_at: string;
  updated_at: string;
  items: WebSaleItem[];
};

type CatalogItem = Record<string, unknown>;
type CatalogShape = CatalogItem[] | { productos: CatalogItem[]; [key: string]: unknown };

type StockIdempotencyLedger = Record<string, { applied_at: string }>;

const SHARED_UPLOADS_ROOT =
  process.env.SHARED_UPLOADS_DIR?.trim() || "/home/u893741392/shared_uploads";

export const CATALOG_PATH =
  process.env.CATALOG_PATH?.trim() || path.join(SHARED_UPLOADS_ROOT, "inventario_thetrip.json");
const WEB_SALES_QUEUE_PATH =
  process.env.WEB_SALES_QUEUE_PATH?.trim() || path.join(SHARED_UPLOADS_ROOT, "web_sales_queue.json");
const STOCK_DELTA_IDEMPOTENCY_PATH =
  process.env.STOCK_DELTA_IDEMPOTENCY_PATH?.trim() ||
  path.join(SHARED_UPLOADS_ROOT, "stock_delta_idempotency.json");

export function edgeSyncSecret(): string {
  return process.env.EDGE_SYNC_SECRET?.trim() || "";
}

export function hasValidEdgeSyncKey(request: Request): boolean {
  const expected = edgeSyncSecret();
  if (!expected) return false;
  const received = request.headers.get("x-basecamp-sync-key")?.trim() || "";
  return received.length > 0 && received === expected;
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

async function writeJsonAtomic(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${Date.now()}.${process.pid}.tmp`;
  await writeFile(tempPath, JSON.stringify(value, null, 2), "utf8");
  await rename(tempPath, filePath);
}

function normalizeLookup(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function toNonNegativeNumber(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, parsed);
}

function matchCatalogItem(item: CatalogItem, lookupKey: string): boolean {
  const byId = normalizeLookup(item.id);
  const byClave = normalizeLookup(item.clave ?? item.sku);
  const byName = normalizeLookup(item.nombre ?? item.name);
  return byId === lookupKey || byClave === lookupKey || byName === lookupKey;
}

function getCatalogItems(catalog: CatalogShape): CatalogItem[] {
  if (Array.isArray(catalog)) return catalog;
  if (catalog && typeof catalog === "object" && Array.isArray(catalog.productos)) {
    return catalog.productos;
  }
  throw new Error("El catálogo no contiene una lista de productos válida.");
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function applyStockDelta(input: StockDeltaInput): Promise<{ duplicate: boolean; applied: boolean }> {
  const idempotencyKey = String(input.idempotency_key || "").trim();
  const articuloClave = String(input.articulo_clave || "").trim();
  if (!idempotencyKey) throw new Error("idempotency_key es obligatorio.");
  if (!articuloClave) throw new Error("articulo_clave es obligatorio.");

  const ledger = await readJsonFile<StockIdempotencyLedger>(STOCK_DELTA_IDEMPOTENCY_PATH, {});
  if (ledger[idempotencyKey]) {
    return { duplicate: true, applied: false };
  }

  const catalog = await readJsonFile<CatalogShape>(CATALOG_PATH, []);
  const items = getCatalogItems(catalog);
  const target = normalizeLookup(articuloClave);
  const row = items.find((item) => matchCatalogItem(item, target));
  if (!row) {
    throw new Error(`No existe el producto para clave/id/nombre: ${articuloClave}`);
  }

  const existingStock =
    toNonNegativeNumber(row.stock) ??
    toNonNegativeNumber(row.existencias) ??
    toNonNegativeNumber(row.existencia) ??
    0;
  const delta = Number(input.delta);
  if (!Number.isFinite(delta)) {
    throw new Error("delta debe ser numérico.");
  }

  const explicitFinal = toNonNegativeNumber(input.existencia_final);
  const nextStock = explicitFinal ?? Math.max(0, existingStock + delta);

  row.stock = nextStock;
  row.existencias = nextStock;
  row.updated_at = nowIso();

  await writeJsonAtomic(CATALOG_PATH, catalog);
  ledger[idempotencyKey] = { applied_at: nowIso() };
  await writeJsonAtomic(STOCK_DELTA_IDEMPOTENCY_PATH, ledger);
  return { duplicate: false, applied: true };
}

export async function enqueueWebSale(input: {
  order_id: string;
  idempotency_key: string;
  items: WebSaleItem[];
}): Promise<void> {
  const orderId = String(input.order_id || "").trim();
  const idempotencyKey = String(input.idempotency_key || "").trim();
  if (!orderId) throw new Error("order_id es obligatorio para encolar venta web.");
  if (!idempotencyKey) throw new Error("idempotency_key es obligatorio para encolar venta web.");
  const queue = await readJsonFile<WebSaleQueueEntry[]>(WEB_SALES_QUEUE_PATH, []);
  const now = nowIso();
  const incomingItems = Array.isArray(input.items) ? input.items : [];
  const normalizedItems = incomingItems
    .map((item) => ({
      clave: String(item.clave || "").trim(),
      qty: Number(item.qty),
      title: typeof item.title === "string" ? item.title.trim() : undefined,
    }))
    .filter((item) => item.clave && Number.isFinite(item.qty) && item.qty > 0);

  const existingIndex = queue.findIndex((row) => row.order_id === orderId);
  if (existingIndex >= 0) {
    const existing = queue[existingIndex];
    queue[existingIndex] = {
      ...existing,
      idempotency_key: existing.idempotency_key || idempotencyKey,
      status: existing.status === "SYNCED_SICAR" ? "SYNCED_SICAR" : "PENDING_SICAR",
      updated_at: now,
      items: normalizedItems,
    };
  } else {
    queue.unshift({
      order_id: orderId,
      idempotency_key: idempotencyKey,
      status: "PENDING_SICAR",
      source: "MERCADOPAGO",
      created_at: now,
      updated_at: now,
      items: normalizedItems,
    });
  }

  await writeJsonAtomic(WEB_SALES_QUEUE_PATH, queue);
}

export async function listPendingWebSales(): Promise<WebSaleQueueEntry[]> {
  const queue = await readJsonFile<WebSaleQueueEntry[]>(WEB_SALES_QUEUE_PATH, []);
  return queue.filter((row) => row.status === "PENDING_SICAR");
}

export async function ackWebSale(orderId: string): Promise<boolean> {
  const target = String(orderId || "").trim();
  if (!target) return false;
  const queue = await readJsonFile<WebSaleQueueEntry[]>(WEB_SALES_QUEUE_PATH, []);
  const idx = queue.findIndex((row) => row.order_id === target);
  if (idx < 0) return false;
  queue[idx] = {
    ...queue[idx],
    status: "SYNCED_SICAR",
    updated_at: nowIso(),
  };
  await writeJsonAtomic(WEB_SALES_QUEUE_PATH, queue);
  return true;
}
