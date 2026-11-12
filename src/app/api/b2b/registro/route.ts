import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const tenantHeader = req.headers.get('x-tenant-id');
  if (tenantHeader !== 'basecamp_420') {
    return NextResponse.json(
      { error: 'Encabezado X-Tenant-ID inválido o ausente.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      unitMode,
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      businessSector,
      partnershipType,
      peopleCount,
      targetDate,
      budgetRange,
      objective,
    } = body;

    if (!companyName || !contactName || !contactEmail || !contactPhone || !targetDate) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios en la solicitud comercial.' },
        { status: 400 }
      );
    }

    const timestamp = Date.now().toString(36).toUpperCase();
    const folio = `B2B-${unitMode === 'cima-digital' ? 'CIMA' : 'ALLY'}-${timestamp}`;

    const leadRecord = {
      folio,
      estado: 'NUEVO_LEAD',
      razon_social: String(companyName).slice(0, 140),
      contacto: String(contactName).slice(0, 120),
      correo: String(contactEmail).slice(0, 120),
      whatsapp_telefono: String(contactPhone).slice(0, 40),
      giro_comercial: businessSector,
      tipo_alianza: partnershipType,
      num_personas: Number(peopleCount) || 1,
      fecha_objetivo: targetDate,
      presupuesto: budgetRange,
      objetivo: String(objective).slice(0, 1000),
      creado_en: new Date().toISOString(),
    };

    return NextResponse.json({
      status: 'ok',
      folio: leadRecord.folio,
      lead: leadRecord,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar el payload de la solicitud B2B.' },
      { status: 500 }
    );
  }
}
