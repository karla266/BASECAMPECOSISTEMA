import Link from "next/link";
import { readOrders } from "@/lib/orders";
import { buildFortinCoordinatesLink, buildPassengerConfirmationLink, buildSalvadorAlertLink } from "@/lib/whatsapp";

function money(amount: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(
    amount
  );
}

function statusClasses(status: string): string {
  if (status === "approved") return "text-emerald-400";
  if (status === "CANJEADO") return "text-violet-300";
  return "text-amber-400";
}

export default async function AdminPedidosPage() {
  const orders = await readOrders();
  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.basecamp420.com";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Micro-POS Operativo</p>
            <h1 className="mt-2 text-3xl font-black text-white">Panel de Pedidos y Cobros</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/checkin" className="rounded-lg border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20">
              Check-in en Pista
            </Link>
            <Link href="/admin" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold hover:border-cyan-400">
              Volver a Admin
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-800/70 text-left text-slate-200">
              <tr>
                <th className="px-4 py-3">Folio</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Estatus</th>
                <th className="px-4 py-3">Acciones</th>
                <th className="px-4 py-3">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    Aún no hay pedidos registrados en data/orders.json.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const orderUrl = `${siteBaseUrl}/comprobante/${encodeURIComponent(order.redemptionCode)}`;
                  const notifyUrl = buildPassengerConfirmationLink({
                    passengerName: order.customer,
                    folio: order.redemptionCode,
                    activity: order.productLabel,
                    dateText: order.reservationDate ? `${order.reservationDate}${order.reservationSlot ? ` ${order.reservationSlot}` : ""}` : undefined,
                    amount: order.amount,
                    comprobanteUrl: orderUrl,
                  });
                  const locationUrl = buildFortinCoordinatesLink({
                    folio: order.redemptionCode,
                    passengerName: order.customer,
                  });
                  const pilotUrl = buildSalvadorAlertLink({
                    folio: order.redemptionCode,
                    customerName: order.customer,
                    reservationDate: order.reservationDate,
                    reservationSlot: order.reservationSlot,
                    amount: order.amount,
                    activity: order.productLabel,
                  });

                  return (
                    <tr key={order.transactionId} className="border-t border-slate-800 align-top">
                      <td className="px-4 py-3 font-mono text-xs text-amber-300">{order.redemptionCode}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{order.customer}</div>
                        {order.customerPhone ? <div className="text-xs text-slate-400">{order.customerPhone}</div> : null}
                      </td>
                      <td className="px-4 py-3">{order.productLabel}</td>
                      <td className="px-4 py-3">{money(order.amount)}</td>
                      <td className={`px-4 py-3 font-bold ${statusClasses(order.status)}`}>{order.status}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <a href={notifyUrl} target="_blank" rel="noreferrer" className="rounded-md bg-emerald-500 px-2 py-1.5 text-center text-xs font-semibold text-slate-950">
                            Notificar Pasajero
                          </a>
                          <a href={locationUrl} target="_blank" rel="noreferrer" className="rounded-md bg-cyan-500 px-2 py-1.5 text-center text-xs font-semibold text-slate-950">
                            Enviar Ubicación Pista
                          </a>
                          <a href={pilotUrl} target="_blank" rel="noreferrer" className="rounded-md bg-amber-400 px-2 py-1.5 text-center text-xs font-semibold text-slate-950">
                            Alertar a Salvador
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/comprobante/${order.redemptionCode}`} className="text-cyan-300 hover:text-cyan-200">
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
