import { NextResponse } from "next/server";
import { ejecutarTienda, tenantDe } from "@/lib/tiendaCli";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const resultado = await ejecutarTienda("scraper", { tenant: tenantDe(request) }, 60000);
  return NextResponse.json(resultado.body, { status: resultado.status });
}
