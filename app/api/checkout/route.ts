import { NextResponse } from 'next/server';
import { getActivePointDeviceId } from '@/lib/point-devices';
import { descontarStockCatalogoLocal } from '@/lib/catalogo-pos';
import { cancelarOrdenPalapa, crearOrdenPalapa, preferenciaMercadoPago } from '@/lib/palapa';
import { crearReserva, esSlotVuelo, quitarReserva } from '@/lib/vuelos';

async function validarYDescontarStock(itemsVendidos: Array<{ sku?: string; barcode?: string; cantidad?: number | string }>) {
  try {
    const result = await descontarStockCatalogoLocal(itemsVendidos);
    return result;
  } catch {
    return { updated: 0, skipped: itemsVendidos.length };
  }
}

export async function POST(request: Request) {
  let reservaId = '';
  let ordenPalapaId = '';
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
      punto,
      notas,
      metadata,
    } = payload as {
      punto?: string;
      notas?: string;
      nombre?: string;
      telefono?: string;
      fecha?: string;
      horario?: string;
      pesoKg?: number;
      tipo?: string;
      productLabel?: string;
      items?: Array<{ id?: string; sku?: string; barcode?: string; cantidad?: number | string; price?: number; title?: string; quantity?: number }>;
      metadata?: Record<string, unknown>;
    };
    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'Falta configurar MP_ACCESS_TOKEN en el archivo .env.local' },
        { status: 500 }
      );
    }

    if (tipo === 'pedido_palapa') {
      const alta = await crearOrdenPalapa({
        nombre: String(nombre || ''),
        telefono: String(telefono || ''),
        punto: String(punto || ''),
        notas: String(notas || ''),
        items: Array.isArray(items) ? items.map((item) => ({ id: item.sku || item.id, cantidad: Number(item.cantidad ?? item.quantity ?? 0) })) : [],
      });
      if ('error' in alta) return NextResponse.json({ error: alta.error }, { status: 400 });
      ordenPalapaId = alta.orden.id;
      const sitio = (process.env.APP_URL || 'https://www.basecamp420.com').replace(/\/$/, '');
      const preferencia = preferenciaMercadoPago(alta.orden, sitio);
      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencia),
      });
      const data = await mpRes.json();
      if (!mpRes.ok) {
        await cancelarOrdenPalapa(ordenPalapaId);
        return NextResponse.json({ error: data.message || 'Error al comunicarse con Mercado Pago' }, { status: 400 });
      }
      return NextResponse.json({ checkoutUrl: data.init_point, ordenId: ordenPalapaId });
    }

    const esVuelo = !Array.isArray(items) && Boolean(fecha && horario);
    if (esVuelo) {
      const slot = String(horario || '');
      if (!esSlotVuelo(slot)) {
        return NextResponse.json({ error: 'El horario debe ser 10:00, 12:00, 14:00 o 16:00.' }, { status: 400 });
      }
      const alta = await crearReserva({
        fecha: String(fecha),
        horario: slot,
        pasajero: nombre || 'Pasajero',
        telefono: telefono || '',
        pesoKg: Number(pesoKg) || 75,
      });
      if ('error' in alta) {
        return NextResponse.json({ error: alta.error }, { status: 409 });
      }
      reservaId = alta.reserva.id;
    }

    const activePointDeviceId = getActivePointDeviceId();

    if (Array.isArray(items) && items.length > 0) {
      const itemsToSync = items.map((item) => ({
        sku: item.sku,
        barcode: item.barcode,
        cantidad: Number(item.cantidad ?? item.quantity ?? 1),
      }));

      await validarYDescontarStock(itemsToSync);

      const lineas = items
        .map((item) => ({
          id: String(item.sku || item.id || "SKU"),
          title: String(item.title || item.sku || "Producto The Trip").slice(0, 120),
          quantity: Math.max(1, Number(item.cantidad ?? item.quantity ?? 1)),
          currency_id: "MXN",
          unit_price: Math.round(Number(item.price ?? 0) * 100) / 100,
        }))
        .filter((item) => item.unit_price > 0);
      if (lineas.length > 0) {
        const sitio = (process.env.APP_URL || "https://www.basecamp420.com").replace(/\/$/, "");
        const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            items: lineas,
            payer: { name: nombre || "Cliente", phone: { number: telefono || "0000000000" } },
            back_urls: {
              success: `${sitio}/checkout?status=approved`,
              failure: `${sitio}/checkout?status=failure`,
              pending: `${sitio}/checkout?status=pending`,
            },
            auto_return: "approved",
            statement_descriptor: "BASECAMP 420",
            external_reference: `BC-TRIP-${Date.now()}`,
          }),
        });
        const data = await mpRes.json();
        if (!mpRes.ok) {
          return NextResponse.json({ error: data.message || "Error al comunicarse con Mercado Pago" }, { status: 400 });
        }
        return NextResponse.json({ checkoutUrl: data.init_point });
      }
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
      if (reservaId) await quitarReserva(reservaId);
      return NextResponse.json(
        { error: data.message || 'Error al comunicarse con Mercado Pago' },
        { status: 400 }
      );
    }

    return NextResponse.json({ checkoutUrl: data.init_point });
  } catch (error: unknown) {
    if (reservaId) await quitarReserva(reservaId);
    if (ordenPalapaId) await cancelarOrdenPalapa(ordenPalapaId);
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
