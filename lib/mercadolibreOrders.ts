/**
 * Parseo y validación de notificaciones de MercadoLibre (topic orders_v2).
 *
 * Función pura, sin I/O, para poder testearla sin base de datos ni red.
 */

export interface ParsedOrderNotification {
  topic: 'orders_v2';
  orderId: string;
  resource: string;
}

export type ParseResult =
  | { ok: true; notification: ParsedOrderNotification }
  | { ok: false; error: string };

/**
 * Valida el cuerpo de un webhook de MercadoLibre y extrae el id de orden.
 * Devuelve { ok: false } en vez de lanzar, para que el handler decida
 * si responder 400 o ignorar el evento.
 */
export function parseOrderNotification(body: unknown): ParseResult {
  if (body === null || typeof body !== 'object') {
    return { ok: false, error: 'El cuerpo del webhook no es un objeto JSON' };
  }
  const raw = body as Record<string, unknown>;

  if (raw.topic !== 'orders_v2') {
    // No es un evento de órdenes: no es error, solo no nos interesa.
    return { ok: false, error: `topic no soportado: ${String(raw.topic)}` };
  }

  if (typeof raw.resource !== 'string' || raw.resource.length === 0) {
    return { ok: false, error: 'resource ausente o inválido para orders_v2' };
  }

  const orderId = raw.resource.split('/').pop();
  if (!orderId) {
    return { ok: false, error: 'resource no contiene un id de orden' };
  }

  return {
    ok: true,
    notification: { topic: 'orders_v2', orderId, resource: raw.resource },
  };
}
