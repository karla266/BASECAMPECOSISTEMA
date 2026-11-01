import { NextResponse } from "next/server";
import { disponibilidad } from "@/lib/vuelos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const fecha = new URL(request.url).searchParams.get("fecha") || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: "Indica la fecha del vuelo." }, { status: 400 });
  }
  const slots = await disponibilidad(fecha);
  return NextResponse.json({ fecha, slots });
}
