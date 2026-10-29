import { NextResponse } from "next/server";
import { readOrders } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await readOrders();
    return NextResponse.json({ orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No fue posible leer pedidos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
