import { NextResponse } from "next/server";
import { ejecutarTienda, tenantDe } from "@/lib/tiendaCli";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const resultado = await ejecutarTienda("listar", { tenant: tenantDe(request) });
  return NextResponse.json(resultado.body, { status: resultado.status });
}
