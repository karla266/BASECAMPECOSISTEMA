import { NextResponse } from "next/server";
import { insertarRegistro } from "@/lib/registrosLocal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORGANISMOS = new Set(["APPI", "FALP", "Libre"]);
const NIVELES = new Set(["APPI 1", "APPI 2", "APPI 3", "Tandem Pro Comercial"]);

function texto(valor: unknown, maximo = 160): string {
  return typeof valor === "string" ? valor.trim().slice(0, maximo) : "";
}

export async function POST(request: Request) {
  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "No se pudo leer el registro." }, { status: 400 });
  }

  const nombre = texto(cuerpo.nombre, 120);
  const telefono = texto(cuerpo.telefono, 20);
  const correo = texto(cuerpo.correo, 160).toLowerCase();
  const licenciaNumero = texto(cuerpo.licenciaNumero, 40);
  const licenciaOrganismo = texto(cuerpo.licenciaOrganismo, 20);
  const nivel = texto(cuerpo.nivel, 40);
  const equipo = texto(cuerpo.equipo, 160);
  const ciudad = texto(cuerpo.ciudad, 80);
  const horas = Number(cuerpo.horas);
  const digitos = telefono.replace(/\D/g, "");

  if (nombre.length < 3 || digitos.length < 10 || !correo.includes("@") || !licenciaNumero) {
    return NextResponse.json({ success: false, message: "Completa nombre, WhatsApp, correo y número de licencia." }, { status: 400 });
  }
  if (!ORGANISMOS.has(licenciaOrganismo) || !NIVELES.has(nivel)) {
    return NextResponse.json({ success: false, message: "Elige un organismo y un nivel de certificación válidos." }, { status: 400 });
  }
  if (!Number.isFinite(horas) || horas < 0 || horas > 100000 || equipo.length < 2 || ciudad.length < 2) {
    return NextResponse.json({ success: false, message: "Indica horas de vuelo, equipo y ciudad base." }, { status: 400 });
  }

  try {
    insertarRegistro("pilotos", {
      nombre,
      telefono,
      correo,
      licencia_numero: licenciaNumero,
      licencia_organismo: licenciaOrganismo,
      nivel,
      horas_vuelo: horas,
      equipo,
      ciudad,
    });
  } catch {
    return NextResponse.json({ success: false, message: "No se pudo guardar el piloto." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Piloto registrado correctamente" }, { status: 201 });
}
