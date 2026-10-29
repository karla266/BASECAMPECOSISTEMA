import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nombre, telefono, fecha, horario } = await request.json();
    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'Falta configurar MP_ACCESS_TOKEN en el archivo .env.local' },
        { status: 500 }
      );
    }

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
