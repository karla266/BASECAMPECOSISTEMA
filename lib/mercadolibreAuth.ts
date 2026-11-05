import fs from 'fs/promises';
import path from 'path';

/**
 * Persistencia mínima del token OAuth de Mercado Libre.
 *
 * El callback de OAuth solo devolvía el token al navegador y no lo
 * guardaba en ningún lado, así que el webhook de `orders_v2` no tenía
 * forma de validar el pedido contra la API antes de tocar stock. Este
 * módulo cierra ese hueco con un almacén en disco (mismo patrón JSON que
 * `catalogo-pos.ts`) protegido por tenant.
 */

export interface MeliTokenRecord {
  tenantId: string;
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt: number; // epoch ms
  obtainedAt: number; // epoch ms
}

const TOKENS_PATH = path.join(process.cwd(), 'data', 'meli_tokens.json');

async function readStore(): Promise<Record<string, MeliTokenRecord>> {
  try {
    const raw = await fs.readFile(TOKENS_PATH, 'utf8');
    if (!raw.trim()) return {};
    const parsed = JSON.parse(raw) as Record<string, MeliTokenRecord>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeStore(store: Record<string, MeliTokenRecord>): Promise<void> {
  await fs.mkdir(path.dirname(TOKENS_PATH), { recursive: true });
  await fs.writeFile(TOKENS_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export async function saveMeliToken(
  tenantId: string,
  data: { access_token: string; refresh_token?: string; token_type?: string; expires_in?: number },
): Promise<void> {
  const store = await readStore();
  const now = Date.now();
  store[tenantId] = {
    tenantId,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type,
    expiresAt: now + (Number(data.expires_in ?? 21600) * 1000),
    obtainedAt: now,
  };
  await writeStore(store);
}

export async function getMeliToken(tenantId: string): Promise<MeliTokenRecord | null> {
  const store = await readStore();
  return store[tenantId] ?? null;
}

/** Tenant por defecto cuando el webhook no trae uno explícito. */
export const DEFAULT_MELI_TENANT = process.env.MELI_DEFAULT_TENANT || 'basecamp_420';
