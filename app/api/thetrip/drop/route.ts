import { NextResponse } from "next/server";
import { diaMexico, estadoDrop } from "@/lib/dropsEstado";
import { leerMotor } from "@/lib/dropsArchivos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const motor = leerMotor();
    return NextResponse.json(estadoDrop(motor), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : "No se pudo leer el drop.";
    return NextResponse.json({ error: mensaje, hoy: diaMexico() }, { status: 500 });
  }
}
