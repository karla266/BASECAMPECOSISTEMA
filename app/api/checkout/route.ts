import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuración del SDK de Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-000000-000000-000000' });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = body.items;

    // Validación estricta y filtro legal de productos permitidos en The Trip Smokeshop
    const allowedCategories = ['parafernalia', 'pipas_pyrex', 'bongs', 'grinders', 'accesorios'];
    
    for (const item of items) {
        if (!allowedCategories.includes(item.category)) {
            return NextResponse.json(
                { error: 'El carrito contiene artículos no permitidos por las políticas estandarizadas de The Trip Smokeshop. Solo se permite venta de parafernalia legal.' },
                { status: 403 }
            );
        }
    }

    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: items.map((i: any) => ({
            id: i.sku,
            title: i.title,
            quantity: i.quantity,
            unit_price: i.price,
            currency_id: 'MXN'
        })),
        back_urls: {
            success: 'https://basecamp420.com/thetrip/success',
            failure: 'https://basecamp420.com/thetrip/failure',
            pending: 'https://basecamp420.com/thetrip/pending'
        },
        auto_return: 'approved',
      }
    });

    return NextResponse.json({ init_point: response.init_point });
  } catch (error) {
    console.error('Error al crear preferencia en Mercado Pago:', error);
    return NextResponse.json({ error: 'Fallo interno al orquestar el checkout.' }, { status: 500 });
  }
}
