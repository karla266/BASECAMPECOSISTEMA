import { NextResponse } from "next/server";
import { registrarPiloto } from "@/lib/vuelos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cuerpo = (await request.json()) as {
    nombre?: string;
    telefono?: string;
    certificacion?: string;
  };
  const certificacion = cuerpo.certificacion === "tandem_appi" || cuerpo.certificacion === "en_formacion"
    ? cuerpo.certificacion
    : null;
  if (!certificacion) {
    return NextResponse.json({ error: "Elige Tándem APPI o En formación." }, { status: 400 });
  }
  const resultado = await registrarPiloto({
    nombre: String(cuerpo.nombre || ""),
    telefono: String(cuerpo.telefono || "").replace(/\D/g, ""),
    certificacion,
  });
  if ("error" in resultado && resultado.error) {
    return NextResponse.json({ error: resultado.error }, { status: 400 });
  }
  const piloto = resultado.piloto;
  const etiqueta = piloto.certificacion_tandem ? "Tándem APPI" : "En formación";
  const texto = `Hola Basecamp 420, alta de piloto: ${piloto.nombre}, WhatsApp ${piloto.telefono.slice(-10)}, certificación ${etiqueta}.`;
  return NextResponse.json({
    piloto,
    yaExistia: resultado.yaExistia,
    whatsapp: `https://wa.me/522727258748?text=${encodeURIComponent(texto)}`,
  }, { status: resultado.yaExistia ? 200 : 201 });
}
