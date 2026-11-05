import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NOMBRE_COOKIE_SESION, verificarSesionAdmin } from "@/lib/adminSession";
import { actualizarReserva, crearReserva, esSlotVuelo, leerPilotos, leerReservas, vaciarReservas, type ChecklistRuta } from "@/lib/vuelos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const sesion = await verificarSesionAdmin(jar.get(NOMBRE_COOKIE_SESION)?.value);
  if (!sesion) return NextResponse.json({ error: "Se requiere la sesión del panel." }, { status: 401 });
  const [reservas, pilotos] = await Promise.all([leerReservas(), leerPilotos()]);
  return NextResponse.json({ reservas, pilotos });
}

export async function POST(request: Request) {
  const cuerpo = (await request.json()) as {
    fecha?: string;
    horario?: string;
    pasajero?: string;
    telefono?: string;
    pesoKg?: number;
  };
  const fecha = String(cuerpo.fecha || "");
  const horario = String(cuerpo.horario || "");
  const pasajero = String(cuerpo.pasajero || "").trim();
  const telefono = String(cuerpo.telefono || "").trim();
  const pesoKg = Number(cuerpo.pesoKg);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: "Elige una fecha válida." }, { status: 400 });
  }
  if (!esSlotVuelo(horario)) {
    return NextResponse.json({ error: "El horario debe ser 10:00, 12:00, 14:00 o 16:00." }, { status: 400 });
  }
  if (pasajero.length < 3) return NextResponse.json({ error: "Escribe el nombre del pasajero." }, { status: 400 });
  if (!Number.isFinite(pesoKg) || pesoKg < 40 || pesoKg > 120) {
    return NextResponse.json({ error: "El peso debe estar entre 40 y 120 kg." }, { status: 400 });
  }
  const resultado = await crearReserva({ fecha, horario, pasajero, telefono, pesoKg });
  if ("error" in resultado && resultado.error) {
    return NextResponse.json({ error: resultado.error }, { status: 409 });
  }
  return NextResponse.json(resultado, { status: 201 });
}

export async function PATCH(request: Request) {
  const jar = await cookies();
  const sesion = await verificarSesionAdmin(jar.get(NOMBRE_COOKIE_SESION)?.value);
  if (!sesion) return NextResponse.json({ error: "Se requiere la sesión del panel." }, { status: 401 });
  const cuerpo = (await request.json()) as {
    id?: string;
    anticipo?: "Pagado" | "Pendiente";
    checklist?: { arnes?: boolean; casco?: boolean; radio?: boolean; paracaidas?: boolean };
    fotoInspeccion?: string | null;
  };
  if (!cuerpo.id) return NextResponse.json({ error: "Falta la reserva." }, { status: 400 });
  const anticipo = cuerpo.anticipo === "Pagado" || cuerpo.anticipo === "Pendiente" ? cuerpo.anticipo : undefined;
  const cambios: { anticipo?: "Pagado" | "Pendiente"; checklist?: ChecklistRuta; fotoInspeccion?: string } = {};
  if (anticipo) cambios.anticipo = anticipo;
  if (cuerpo.checklist) {
    cambios.checklist = {
      arnes: Boolean(cuerpo.checklist.arnes),
      casco: Boolean(cuerpo.checklist.casco),
      radio: Boolean(cuerpo.checklist.radio),
      paracaidas: Boolean(cuerpo.checklist.paracaidas),
    };
  }
  if (typeof cuerpo.fotoInspeccion === "string") cambios.fotoInspeccion = cuerpo.fotoInspeccion.slice(0, 180);
  const reserva = await actualizarReserva(cuerpo.id, cambios);
  if (!reserva) return NextResponse.json({ error: "La reserva no existe." }, { status: 404 });
  return NextResponse.json({ reserva });
}

export async function DELETE() {
  const jar = await cookies();
  const sesion = await verificarSesionAdmin(jar.get(NOMBRE_COOKIE_SESION)?.value);
  if (!sesion) return NextResponse.json({ error: "Se requiere la sesión del panel." }, { status: 401 });
  await vaciarReservas();
  return NextResponse.json({ ok: true, reservas: [] });
}
