import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (req.headers.get('x-tenant-id') !== 'basecamp_420') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { fullName, phone, licenseNumber, organization, flightHours, gliderEquipment } = body;
    if (!fullName || !phone || !licenseNumber || !gliderEquipment) {
      return NextResponse.json({ error: 'Campos obligatorios incompletos.' }, { status: 400 });
    }
    const folio = `PILOT-${Date.now().toString(36).toUpperCase()}`;
    return NextResponse.json({
      status: 'ok',
      estado_revision: 'PENDIENTE',
      folio,
      pilot: {
        nombre_completo: String(fullName).slice(0, 120),
        whatsapp: String(phone).slice(0, 40),
        licencia: `${organization} - ${licenseNumber}`,
        horas_vuelo: Number(flightHours) || 0,
        equipo_vela: String(gliderEquipment).slice(0, 160),
        estado: 'PENDIENTE',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error al procesar registro de piloto.' }, { status: 500 });
  }
}
