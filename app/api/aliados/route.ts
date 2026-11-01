import { NextResponse } from "next/server";
import { insertarRegistro } from "@/lib/registrosLocal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GIROS = new Set(["Smoke Shop / Growshop", "Hotel / Hospedaje", "Agencia / Guía de Turismo", "Tienda Retail / Conveniencia"]);
const ALIANZAS = new Set(["Distribución Mayorista Parafernalia", "Vitrina a Consignación con Llave", "Convenio Comisiones Vuelos Parapente"]);

function texto(valor: unknown, maximo = 200): string {
  return typeof valor === "string" ? valor.trim().slice(0, maximo) : "";
}

export async function POST(request: Request) {
  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "No se pudo leer la solicitud." }, { status: 400 });
  }

  const empresa = texto(cuerpo.empresa, 160);
  const representante = texto(cuerpo.representante, 120);
  const telefono = texto(cuerpo.telefono, 20);
  const correo = texto(cuerpo.correo, 160).toLowerCase();
  const giro = texto(cuerpo.giro, 80);
  const ciudad = texto(cuerpo.ciudad, 80);
  const estadoGeo = texto(cuerpo.estado, 80);
  const tipoAlianza = texto(cuerpo.tipoAlianza, 80);
  const mensaje = texto(cuerpo.mensaje, 800);
  const digitos = telefono.replace(/\D/g, "");

  if (empresa.length < 2 || representante.length < 3 || digitos.length < 10 || !correo.includes("@")) {
    return NextResponse.json({ success: false, message: "Completa empresa, contacto, WhatsApp y correo." }, { status: 400 });
  }
  if (!GIROS.has(giro) || !ALIANZAS.has(tipoAlianza) || ciudad.length < 2 || estadoGeo.length < 2) {
    return NextResponse.json({ success: false, message: "Elige giro, ciudad, estado y tipo de alianza." }, { status: 400 });
  }

  try {
    insertarRegistro("aliados_b2b", {
      empresa,
      representante,
      telefono,
      correo,
      giro,
      ciudad,
      estado_geo: estadoGeo,
      tipo_alianza: tipoAlianza,
      mensaje,
    });
  } catch {
    return NextResponse.json({ success: false, message: "No se pudo guardar la alianza." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Alianza registrada correctamente" }, { status: 201 });
}
