import { NextResponse } from "next/server";
import { approveQueueItem } from "@/lib/autopilot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      action?: "APROBAR" | "DESCARTAR";
      proposedTitle?: string;
      proposedDescription?: string;
      pinnedComment?: string;
      tags?: string[];
    };

    const item = await approveQueueItem(id, body);
    if (!item) {
      return NextResponse.json({ ok: false, error: "Elemento no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No fue posible procesar la aprobación.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
