import { NextResponse } from 'next/server';
import { getActivePointDeviceId } from '@/lib/point-devices';

export async function POST(request: Request) {
  try {
    const { nombre, telefono, fecha, horario, pesoKg, tipo, productLabel } = await request.json();
    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'Falta configurar MP_ACCESS_TOKEN en el archivo .env.local' },
        { status: 500 }
      );
    }

    const activePointDeviceId = getActivePointDeviceId();
    const payload = {
      items: [
        {
          id: 'BC-VUELO-TANDEM',
          title: `Vuelo Parapente Tándem Fortín (${fecha} - ${horario})`,
          description: `Pasajero: ${nombre} · WhatsApp: ${telefono}`,
          quantity: 1,
          currency_id: 'MXN',
          unit_price: 1600.0,
        },
      ],
      payer: {
        name: nombre,
        phone: { number: telefono },
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
      },
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al comunicarse con Mercado Pago' },
        { status: 400 }
      );
    }

    return NextResponse.json({ checkoutUrl: data.init_point });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
