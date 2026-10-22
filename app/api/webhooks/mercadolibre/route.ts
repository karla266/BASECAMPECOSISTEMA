import { NextResponse } from 'next/server';
import { parseOrderNotification } from '@/lib/mercadolibreOrders';

export async function POST(request: Request) {
  // Webhook de MercadoLibre: las notificaciones no firman el payload.
  // La autenticidad se valida (a) confía en que ML solo conozca esta URL y
  // (b) verificando el pedido contra la API antes de tocar el stock. Aquí
  // solo registramos el evento y devolvemos 200 rápido; el descuento de
  // stock se hace con el access token del tenant al validar el order.
  try {
    const body: unknown = await request.json().catch(() => null);
    const parsed = parseOrderNotification(body);

    if (parsed.ok) {
      console.log(`Nueva venta recibida: ${parsed.notification.orderId}`);
      // Lógica para descontar stock en la tabla existencia de SICAR:
      // primero validar el order con la API de ML (GET /orders/{id})
      // usando el token del tenant, y solo entonces descontar.
      // const pool = getDbConnection(3306);
      // await pool.query('UPDATE existencia SET EXISTENCIA = EXISTENCIA - 1 WHERE ...');
    } else {
      console.log(`Webhook ignorado: ${parsed.error}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
