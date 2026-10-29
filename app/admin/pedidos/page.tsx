import Link from "next/link";
import { readOrders } from "@/lib/orders";

function money(amount: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(
    amount
  );
}

export default async function AdminPedidosPage() {
  const orders = await readOrders();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Micro-POS Operativo</p>
            <h1 className="mt-2 text-3xl font-black text-white">Panel de Pedidos y Cobros</h1>
          </div>
          <Link href="/admin" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold hover:border-cyan-400">
            Volver a Admin
          </Link>
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
                <th className="px-4 py-3">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Aún no hay pedidos registrados en data/orders.json.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.transactionId} className="border-t border-slate-800">
                    <td className="px-4 py-3 font-mono text-xs text-amber-300">{order.redemptionCode}</td>
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3">{order.productLabel}</td>
                    <td className="px-4 py-3">{money(order.amount)}</td>
                    <td className={`px-4 py-3 font-bold ${order.status === "approved" ? "text-emerald-400" : "text-amber-400"}`}>
                      {order.status}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/comprobante/${order.redemptionCode}`} className="text-cyan-300 hover:text-cyan-200">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
