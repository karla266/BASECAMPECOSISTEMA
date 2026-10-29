import { NextResponse } from "next/server";
import { appendGeneratedBatch } from "@/lib/autopilot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const items = await appendGeneratedBatch();
    return NextResponse.json({
      ok: true,
      generated: items.length,
      items,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No fue posible generar la cola de autopilot.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
