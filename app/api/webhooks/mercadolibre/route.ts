import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Notificaciones de ordenes/ventas
    if (body.topic === 'orders_v2') {
      const orderId = body.resource.split('/').pop();
      console.log(`Nueva venta recibida: ${orderId}`);
      
      // Lógica para descontar stock en la tabla existencia de SICAR
      // const pool = getDbConnection(3306);
      // await pool.query('UPDATE existencia SET EXISTENCIA = EXISTENCIA - 1 WHERE ...');
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
