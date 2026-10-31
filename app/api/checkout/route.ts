import { NextResponse } from 'next/server';
import { getActivePointDeviceId } from '@/lib/point-devices';
import { descontarStockCatalogoLocal } from '@/lib/catalogo-pos';

async function validarYDescontarStock(itemsVendidos: Array<{ sku?: string; barcode?: string; cantidad?: number | string }>) {
  try {
    const result = await descontarStockCatalogoLocal(itemsVendidos);
    return result;
  } catch {
    return { updated: 0, skipped: itemsVendidos.length };
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      nombre,
      telefono,
      fecha,
      horario,
      pesoKg,
      tipo,
      productLabel,
      items,
      metadata,
    } = payload as {
      nombre?: string;
      telefono?: string;
      fecha?: string;
      horario?: string;
      pesoKg?: number;
      tipo?: string;
      productLabel?: string;
      items?: Array<{ sku?: string; barcode?: string; cantidad?: number | string; price?: number; title?: string; quantity?: number }>;
      metadata?: Record<string, unknown>;
    };
    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'Falta configurar MP_ACCESS_TOKEN en el archivo .env.local' },
        { status: 500 }
      );
    }

    const activePointDeviceId = getActivePointDeviceId();

    if (Array.isArray(items) && items.length > 0) {
      const itemsToSync = items.map((item) => ({
        sku: item.sku,
        barcode: item.barcode,
        cantidad: Number(item.cantidad ?? item.quantity ?? 1),
      }));

      await validarYDescontarStock(itemsToSync);
    }

    const payloadMp = {
      items: [
        {
          id: 'BC-VUELO-TANDEM',
          title: `Vuelo Parapente Tándem Fortín (${fecha || 'fecha por confirmar'} - ${horario || 'horario por confirmar'})`,
          description: `Pasajero: ${nombre || 'Cliente'} · WhatsApp: ${telefono || 'sin número'}`,
          quantity: 1,
          currency_id: 'MXN',
          unit_price: 1600.0,
        },
      ],
      payer: {
        name: nombre || 'Cliente',
        phone: { number: telefono || '0000000000' },
      },
      back_urls: {
        success: 'https://www.basecamp420.com/calendario?status=approved',
        failure: 'https://www.basecamp420.com/calendario?status=failure',
        pending: 'https://www.basecamp420.com/calendario?status=pending',
      },
      auto_return: 'approved',
      statement_descriptor: 'BASECAMP 420',
      external_reference: `BC-VUELO-${Date.now()}`,
      metadata: {
        reservation_date: fecha,
        reservation_slot: horario,
        passenger_weight_kg: pesoKg,
        product_type: tipo,
        product_label: productLabel,
        point_device_id: activePointDeviceId,
        ...(metadata ?? {}),
      },
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadMp),
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al comunicarse con Mercado Pago' },
        { status: 400 }
      );
    }

    return NextResponse.json({ checkoutUrl: data.init_point });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
