import { NextResponse } from "next/server";
import { findOrderByIdOrCode, redeemOrder } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RedeemRouteProps {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: RedeemRouteProps) {
  try {
    const order = await findOrderByIdOrCode(params.id);
    if (!order) {
      return NextResponse.json({ ok: false, message: "Folio o transacción no encontrada." }, { status: 404 });
    }

    if (order.status === "CANJEADO") {
      return NextResponse.json({ ok: false, message: "Este voucher ya fue canjeado." }, { status: 409 });
    }

    const body = await _request.json().catch(() => ({}));
    const operator = typeof body.operator === "string" ? body.operator : "admin";
    const redeemed = await redeemOrder(order.transactionId, operator);

    return NextResponse.json({
      ok: true,
      message: "Vuelo canjeado exitosamente.",
      order: {
        redemptionCode: redeemed?.redemptionCode,
        status: redeemed?.status,
        redeemedAt: redeemed?.redeemedAt,
        redeemedBy: redeemed?.redeemedBy,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No fue posible canjear el voucher.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
