import Link from "next/link";

export const metadata = {
  title: "Comprobante de demostración | Basecamp 420",
  robots: { index: false, follow: false },
};

export default function ComprobanteDemoFolioPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-12 text-neutral-100">
      <section className="mx-auto max-w-3xl rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-amber-300">Basecamp 420</p>
        <h1 className="mt-3 text-3xl font-black text-white">Folio de demostración</h1>
        <p className="mt-4 text-sm leading-6 text-neutral-300">
          Este folio es una vista de control para pruebas públicas. Para un comprobante real, abre la ruta dinámica
          <code className="mx-1 rounded bg-neutral-800 px-1 py-0.5 text-amber-200">/comprobante/[folio]</code>
          con el folio emitido por compra o reserva.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/calendario" className="inline-flex min-h-12 items-center rounded-xl bg-amber-400 px-5 font-bold text-neutral-950">
            Ir a calendario
          </Link>
          <Link href="/ordenar" className="inline-flex min-h-12 items-center rounded-xl border border-neutral-700 px-5 font-semibold text-neutral-100">
            Ir a ordenar
          </Link>
        </div>
      </section>
    </main>
  );
}

