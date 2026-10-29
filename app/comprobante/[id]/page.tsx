import Link from "next/link";
import { notFound } from "next/navigation";
import { findOrderByIdOrCode } from "@/lib/orders";
import PrintButton from "./PrintButton";

interface ComprobantePageProps {
  params: {
    id: string;
  };
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(
    amount
  );
}

function activityDescription(productLabel: string): string {
  if (productLabel.toLowerCase().includes("curso appi")) {
    return "Curso APPI con Salvador Lara";
  }
  return "Vuelo Tándem Fortín";
}

export default async function ComprobantePage({ params }: ComprobantePageProps) {
  const order = await findOrderByIdOrCode(params.id);
  if (!order) notFound();

  const statusClass = order.status === "approved" ? "text-emerald-400" : "text-amber-400";
  const statusLabel = order.status === "approved" ? "PAGO APROBADO" : "PAGO PENDIENTE";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.basecamp420.com";
  const validatorUrl = `${baseUrl}/api/comprobante/validate/${encodeURIComponent(order.redemptionCode)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(validatorUrl)}`;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-100 md:py-12 print:bg-white print:text-black">
      <div className="mx-auto mb-5 flex w-full max-w-3xl items-center justify-between print:hidden">
        <Link href="/calendario" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
          ← Volver a calendario
        </Link>
        <PrintButton />
      </div>

      <article className="print-sheet ticket-container mx-auto w-full max-w-3xl rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl print:rounded-none print:border print:border-black print:bg-white print:p-4 print:shadow-none">
        <header className="border-b border-neutral-800 pb-4 print:border-black">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-amber-300 print:text-black">Basecamp 420</p>
          <h1 className="mt-2 text-2xl font-black text-white print:text-black">Comprobante Digital / Pase de Abordar</h1>
          <p className="mt-1 text-sm text-neutral-400 print:text-black">
            Folio: <strong className="text-neutral-200 print:text-black">{order.redemptionCode}</strong>
          </p>
          <p className={`mt-2 text-sm font-bold ${statusClass} print:text-black`}>{statusLabel}</p>
        </header>

        <section className="mt-5 grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 print:border-black print:bg-white">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300 print:text-black">Datos de la reserva</h2>
              <dl className="mt-3 space-y-1 text-neutral-200 print:text-black">
                <div>
                  <dt className="inline text-neutral-400 print:text-black">Transacción: </dt>
                  <dd className="inline font-semibold">{order.transactionId}</dd>
                </div>
                <div>
                  <dt className="inline text-neutral-400 print:text-black">Cliente: </dt>
                  <dd className="inline font-semibold">{order.customer}</dd>
                </div>
                <div>
                  <dt className="inline text-neutral-400 print:text-black">Actividad: </dt>
                  <dd className="inline font-semibold">{activityDescription(order.productLabel)}</dd>
                </div>
                <div>
                  <dt className="inline text-neutral-400 print:text-black">Producto comercial: </dt>
                  <dd className="inline font-semibold">{order.productLabel}</dd>
                </div>
                <div>
                  <dt className="inline text-neutral-400 print:text-black">Monto: </dt>
                  <dd className="inline font-semibold">{formatMoney(order.amount)}</dd>
                </div>
                <div>
                  <dt className="inline text-neutral-400 print:text-black">Fecha: </dt>
                  <dd className="inline font-semibold">
                    {new Date(order.createdAt).toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" })}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 print:border-black print:bg-white">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300 print:text-black">Indicaciones logísticas</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-neutral-200 print:text-black">
                <li>Punto de encuentro: Gasolinera / Pista de Fortín.</li>
                <li>Presentarse con calzado cerrado y ropa cómoda.</li>
                <li>Peso máximo permitido para operación tándem: 95 kg.</li>
                <li>Consultar confirmación de viento antes del despegue.</li>
              </ul>
            </div>
          </div>

          <aside className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-center print:border-black print:bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-black">QR de validación</p>
            <img src={qrUrl} alt={`QR de validación ${order.redemptionCode}`} className="mx-auto mt-3 h-56 w-56 rounded-lg border border-neutral-700 bg-white p-1 print:border-black" />
            <p className="mt-3 text-[11px] text-neutral-400 break-all print:text-black">{validatorUrl}</p>
          </aside>
        </section>
      </article>

      <style>{`
        @page {
          margin: 10mm;
        }
        @media print {
          .ticket-container {
            max-width: 80mm;
            margin: 0 auto;
          }
          .print-sheet {
            color: #000 !important;
            background: #fff !important;
          }
        }
      `}</style>
    </main>
  );
}
