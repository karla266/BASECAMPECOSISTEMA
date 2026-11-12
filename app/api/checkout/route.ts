import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function POST(req: NextRequest) {
  const tenantHeader = req.headers.get('x-tenant-id');
  if (tenantHeader !== 'basecamp_420') {
    return NextResponse.json(
      { error: 'Encabezado X-Tenant-ID inválido.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { buyerName, buyerEmail, buyerPhone, items } = body;

    if (!buyerName || !buyerEmail || !buyerPhone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Datos de comprador o partidas incompletos para procesar el checkout.' },
        { status: 400 }
      );
    }

    const folio = `BC420-${Date.now().toString(36).toUpperCase()}`;
    const idempotencyKey = crypto.randomUUID();
    const mpToken = process.env.MP_ACCESS_TOKEN;

    if (mpToken) {
      const mpPreference = {
        external_reference: folio,
        payer: {
          name: String(buyerName),
          email: String(buyerEmail),
        },
        items: items.map((item: any) => ({
          id: String(item.sku),
          title: String(item.title),
          quantity: Number(item.quantity) || 1,
          currency_id: 'MXN',
          unit_price: Number(Number(item.unitPrice).toFixed(2)),
        })),
        back_urls: {
          success: 'https://www.basecamp420.com/checkout?status=approved',
          failure: 'https://www.basecamp420.com/checkout?status=failure',
          pending: 'https://www.basecamp420.com/checkout?status=pending',
        },
        auto_return: 'approved',
      };

      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mpToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(mpPreference),
      });

      if (mpRes.ok) {
        const mpData = await mpRes.json();
        return NextResponse.json({
          status: 'ok',
          folio,
          preference_id: mpData.id,
          init_point: mpData.init_point,
        });
      }
    }

    return NextResponse.json({
      status: 'ok',
      folio,
      init_point: null,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error interno al crear la preferencia de checkout.' },
      { status: 500 }
    );
  }
}
