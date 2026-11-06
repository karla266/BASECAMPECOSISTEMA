import Link from "next/link";
import { pesosDesdeCentavos } from "@/lib/palapa-menu";
import { buscarOrdenPalapa } from "@/lib/palapa";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pedido confirmado | Basecamp 420",
  robots: { index: false, follow: false },
};

function textoParam(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] || "" : valor || "";
}

export default async function ExitoPedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ orden?: string | string[]; estado?: string | string[]; status?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const orden = await buscarOrdenPalapa(textoParam(resolvedSearchParams.orden));
  const estado = textoParam(resolvedSearchParams.estado) || textoParam(resolvedSearchParams.status);
  const mensaje = orden
    ? `Hola Basecamp 420, ya pagué mi pedido ${orden.id} por $${pesosDesdeCentavos(orden.totalCentavos)} MXN para ${orden.puntoEtiqueta}.`
    : "Hola Basecamp 420, ya pagué mi pedido de la palapa y quiero confirmar la entrega.";

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-16 text-zinc-100">
      <section className="mx-auto max-w-lg rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Mercado Pago</p>
        <h1 className="mt-3 text-3xl font-black">{estado === "pendiente" ? "Pago en revisión" : "Pedido recibido"}</h1>
        <p className="mt-3 text-sm leading-6 text-emerald-50">
          {orden
            ? `${orden.nombre}, tu pedido va a ${orden.puntoEtiqueta}. Una vez aprobado, puedes seguir el estado desde esta misma página y volver al menú de compra.`
            : "Si el cobro ya está aprobado, tu pedido queda confirmado dentro de la plataforma y puedes continuar desde el menú principal."}
        </p>
        {orden ? (
          <ul className="mt-4 text-left text-sm text-zinc-200">
            {orden.items.map((linea) => (
              <li key={linea.id}>{linea.cantidad} x {linea.nombre}</li>
            ))}
          </ul>
        ) : null}
        <Link href="/checkout" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 text-center text-base font-black text-zinc-950">
          Seguir en checkout
        </Link>
        <Link href="/ordenar" className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-700 text-sm">
          Volver al menú
        </Link>
      </section>
    </main>
  );
}
