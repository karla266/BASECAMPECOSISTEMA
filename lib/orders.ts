import { randomBytes } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type OrderStatus = "approved" | "pending" | "CANJEADO";

export type CommercialProduct =
  | "vuelo_tandem_fortin_web"
  | "canje_folio_mercado_libre"
  | "curso_appi_anticipo"
  | "curso_appi_mensualidad"
  | "otro";

export interface OrderRecord {
  transactionId: string;
  createdAt: string;
  customer: string;
  customerPhone?: string;
  customerEmail?: string;
  product: CommercialProduct;
  productLabel: string;
  amount: number;
  status: OrderStatus;
  redemptionCode: string;
  externalReference?: string;
  reservationDate?: string;
  reservationSlot?: string;
  passengerWeightKg?: number;
  redeemedAt?: string;
  redeemedBy?: string;
}

type OrdersFile = {
  orders: OrderRecord[];
};

const ORDERS_FILE = path.join(process.cwd(), "data", "orders.json");

function defaultOrdersFile(): OrdersFile {
  return { orders: [] };
}

function sanitizeOrders(input: unknown): OrderRecord[] {
  if (!Array.isArray(input)) return [];
  const out: OrderRecord[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const statusValue = row.status;
    if (
      typeof row.transactionId !== "string" ||
      typeof row.createdAt !== "string" ||
      typeof row.customer !== "string" ||
      typeof row.product !== "string" ||
      typeof row.productLabel !== "string" ||
      typeof row.amount !== "number" ||
      (statusValue !== "approved" && statusValue !== "pending" && statusValue !== "CANJEADO") ||
      typeof row.redemptionCode !== "string"
    ) {
      continue;
    }

    out.push({
      transactionId: row.transactionId,
      createdAt: row.createdAt,
      customer: row.customer,
      customerPhone: typeof row.customerPhone === "string" ? row.customerPhone : undefined,
      customerEmail: typeof row.customerEmail === "string" ? row.customerEmail : undefined,
      product: row.product as CommercialProduct,
      productLabel: row.productLabel,
      amount: row.amount,
      status: statusValue as OrderStatus,
      redemptionCode: row.redemptionCode,
      externalReference: typeof row.externalReference === "string" ? row.externalReference : undefined,
      reservationDate: typeof row.reservationDate === "string" ? row.reservationDate : undefined,
      reservationSlot: typeof row.reservationSlot === "string" ? row.reservationSlot : undefined,
      passengerWeightKg: typeof row.passengerWeightKg === "number" ? row.passengerWeightKg : undefined,
      redeemedAt: typeof row.redeemedAt === "string" ? row.redeemedAt : undefined,
      redeemedBy: typeof row.redeemedBy === "string" ? row.redeemedBy : undefined,
    });
  }
  return out;
}

export async function readOrders(): Promise<OrderRecord[]> {
  try {
    const content = await readFile(ORDERS_FILE, "utf8");
    const parsed = JSON.parse(content) as { orders?: unknown };
    return sanitizeOrders(parsed.orders);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    if (error instanceof SyntaxError) return [];
    throw error;
  }
}

async function writeOrders(orders: OrderRecord[]): Promise<void> {
  await mkdir(path.dirname(ORDERS_FILE), { recursive: true });
  const body = JSON.stringify({ orders }, null, 2);
  await writeFile(ORDERS_FILE, `${body}\n`, "utf8");
}

function generateCandidateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const raw = randomBytes(6);
  let suffix = "";
  for (let i = 0; i < raw.length; i += 1) {
    suffix += alphabet[raw[i] % alphabet.length];
  }
  return `BC420-${suffix}`;
}

async function ensureUniqueCode(existing: OrderRecord[]): Promise<string> {
  const used = new Set(existing.map((order) => order.redemptionCode));
  let code = generateCandidateCode();
  while (used.has(code)) code = generateCandidateCode();
  return code;
}

export async function upsertOrder(
  input: Omit<OrderRecord, "redemptionCode"> & { redemptionCode?: string }
): Promise<OrderRecord> {
  const current = await readOrders();
  const idx = current.findIndex((order) => order.transactionId === input.transactionId);
  const keptCode = idx >= 0 ? current[idx].redemptionCode : undefined;
  const redemptionCode = input.redemptionCode ?? keptCode ?? (await ensureUniqueCode(current));
  const normalized: OrderRecord = {
    ...input,
    redemptionCode,
    status: input.status === "CANJEADO" ? "CANJEADO" : input.status,
  };

  if (idx >= 0) {
    current[idx] = normalized;
  } else {
    current.unshift(normalized);
  }
  await writeOrders(current);
  return normalized;
}

export async function redeemOrder(idOrCode: string, operator?: string): Promise<OrderRecord | undefined> {
  const order = await findOrderByIdOrCode(idOrCode);
  if (!order) return undefined;

  const updated: OrderRecord = {
    ...order,
    status: "CANJEADO",
    redeemedAt: new Date().toISOString(),
    redeemedBy: operator || "admin",
  };

  const current = await readOrders();
  const idx = current.findIndex((item) => item.transactionId === order.transactionId);
  if (idx >= 0) {
    current[idx] = updated;
    await writeOrders(current);
  }
  return updated;
}

export async function findOrderByIdOrCode(idOrCode: string): Promise<OrderRecord | undefined> {
  const normalized = idOrCode.trim().toUpperCase();
  if (!normalized) return undefined;
  const orders = await readOrders();
  return orders.find(
    (order) =>
      order.transactionId.toUpperCase() === normalized ||
      order.redemptionCode.toUpperCase() === normalized
  );
}

export function classifyCommercialProduct(amount: number): {
  product: CommercialProduct;
  label: string;
} {
  const rounded = Math.round(amount);
  if (rounded === 1600) {
    return {
      product: "vuelo_tandem_fortin_web",
      label: "Vuelo Tándem Fortín (web directa)",
    };
  }
  if (rounded === 2800) {
    return {
      product: "canje_folio_mercado_libre",
      label: "Canje de folio / voucher Mercado Libre",
    };
  }
  if (rounded === 6000) {
    return {
      product: "curso_appi_anticipo",
      label: "Curso APPI - Anticipo",
    };
  }
  if (rounded === 3000) {
    return {
      product: "curso_appi_mensualidad",
      label: "Curso APPI - Mensualidad",
    };
  }
  return {
    product: "otro",
    label: "Otro concepto",
  };
}
