import { NextResponse } from "next/server";
import { readPipelineQueue, updateQueueItem } from "@/lib/autopilot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await readPipelineQueue();
    return NextResponse.json({ ok: true, items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No fue posible leer la cola.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      proposedTitle?: string;
      proposedDescription?: string;
      pinnedComment?: string;
      tags?: string[];
    };
    if (!body.id) {
      return NextResponse.json({ ok: false, error: "id es requerido." }, { status: 400 });
    }
    const updated = await updateQueueItem(body.id, {
      proposedTitle: body.proposedTitle,
      proposedDescription: body.proposedDescription,
      pinnedComment: body.pinnedComment,
      tags: body.tags,
    });
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Elemento no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No fue posible actualizar el elemento.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
