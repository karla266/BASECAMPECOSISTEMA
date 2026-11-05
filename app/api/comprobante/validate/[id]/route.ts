import { NextResponse } from "next/server";
import { findOrderByIdOrCode } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await findOrderByIdOrCode(id);
  if (!order) {
    return NextResponse.json(
      {
        valid: false,
        message: "Folio o transacción no encontrada.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    valid: true,
    transactionId: order.transactionId,
    redemptionCode: order.redemptionCode,
    status: order.status,
    customer: order.customer,
    product: order.productLabel,
    amount: order.amount,
    createdAt: order.createdAt,
  });
}
