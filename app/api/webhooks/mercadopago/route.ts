import { NextResponse } from "next/server";
import {
  classifyCommercialProduct,
  upsertOrder,
  type OrderStatus,
  type CommercialProduct,
} from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MercadoPagoPayment = {
  id: number | string;
  status?: string;
  transaction_amount?: number;
  date_created?: string;
  external_reference?: string;
  description?: string;
  payer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: { number?: string };
  };
  additional_info?: {
    payer?: {
      first_name?: string;
      last_name?: string;
      phone?: { number?: string };
    };
  };
};

function token(): string {
  return (
    process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() ||
    process.env.MP_ACCESS_TOKEN?.trim() ||
    ""
  );
}

function paymentIdFromPayload(body: unknown, requestUrl: URL): string | null {
  const queryType = requestUrl.searchParams.get("type") || requestUrl.searchParams.get("topic");
  const queryId = requestUrl.searchParams.get("data.id") || requestUrl.searchParams.get("id");
  if (queryType === "payment" && queryId) return queryId;

  if (!body || typeof body !== "object") return null;
  const row = body as Record<string, unknown>;
  const rowType = typeof row.type === "string" ? row.type : typeof row.topic === "string" ? row.topic : "";
  if (rowType && rowType !== "payment") return null;
  if (row.data && typeof row.data === "object") {
    const dataId = (row.data as Record<string, unknown>).id;
    if (typeof dataId === "string" || typeof dataId === "number") return String(dataId);
  }
  if (typeof row.id === "string" || typeof row.id === "number") return String(row.id);
  return null;
}

async function fetchPayment(paymentId: string, accessToken: string): Promise<MercadoPagoPayment> {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as MercadoPagoPayment | { message?: string } | null;
  if (!response.ok || !data || typeof data !== "object" || !("id" in data)) {
    const message =
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : "No fue posible verificar el pago en Mercado Pago.";
    throw new Error(message);
  }
  return data as MercadoPagoPayment;
}

function customerName(payment: MercadoPagoPayment): string {
  const first =
    payment.payer?.first_name?.trim() || payment.additional_info?.payer?.first_name?.trim() || "";
  const last =
    payment.payer?.last_name?.trim() || payment.additional_info?.payer?.last_name?.trim() || "";
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;
  if (payment.payer?.email?.trim()) return payment.payer.email.trim();
  return "Cliente sin nombre";
}

function inferProductFromPayment(payment: MercadoPagoPayment): {
  product: CommercialProduct;
  label: string;
} {
  const amount = typeof payment.transaction_amount === "number" ? payment.transaction_amount : 0;
  const fromAmount = classifyCommercialProduct(amount);
  if (fromAmount.product !== "otro") return fromAmount;

  const probe = `${payment.external_reference || ""} ${payment.description || ""}`.toLowerCase();
  if (probe.includes("voucher") || probe.includes("folio") || probe.includes("mercado libre")) {
    return {
      product: "canje_folio_mercado_libre",
      label: "Canje de folio / voucher Mercado Libre",
    };
  }
  if (probe.includes("appi") && (probe.includes("anticipo") || probe.includes("downpayment"))) {
    return {
      product: "curso_appi_anticipo",
      label: "Curso APPI - Anticipo",
    };
  }
  if (probe.includes("appi") && (probe.includes("mensualidad") || probe.includes("mensual"))) {
    return {
      product: "curso_appi_mensualidad",
      label: "Curso APPI - Mensualidad",
    };
  }
  return {
    product: "vuelo_tandem_fortin_web",
    label: "Vuelo Tándem Fortín (web directa)",
  };
}

function normalizeStatus(status?: string): OrderStatus {
  return status === "approved" ? "approved" : "pending";
}

export async function POST(request: Request) {
  try {
    const accessToken = token();
    if (!accessToken) {
      return NextResponse.json(
        { error: "Falta MERCADOPAGO_ACCESS_TOKEN (o MP_ACCESS_TOKEN)." },
        { status: 500 }
      );
    }

    const requestUrl = new URL(request.url);
    const body = await request.json().catch(() => null);
    const paymentId = paymentIdFromPayload(body, requestUrl);

    if (!paymentId) {
      return NextResponse.json({ ok: true, ignored: "Notificación sin payment id." }, { status: 200 });
    }

    // Validación de autenticidad mediante consulta directa al recurso de pago.
    const payment = await fetchPayment(paymentId, accessToken);
    const { product, label } = inferProductFromPayment(payment);
    const status = normalizeStatus(payment.status);
    const amount = typeof payment.transaction_amount === "number" ? payment.transaction_amount : 0;

    const order = await upsertOrder({
      transactionId: String(payment.id),
      createdAt: payment.date_created || new Date().toISOString(),
      customer: customerName(payment),
      customerPhone: payment.payer?.phone?.number || payment.additional_info?.payer?.phone?.number,
      customerEmail: payment.payer?.email,
      product,
      productLabel: label,
      amount,
      status,
      externalReference: payment.external_reference,
    });

    return NextResponse.json(
      {
        ok: true,
        order: {
          transactionId: order.transactionId,
          status: order.status,
          redemptionCode: order.redemptionCode,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al procesar webhook de Mercado Pago.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
