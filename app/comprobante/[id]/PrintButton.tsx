"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-extrabold text-black shadow-lg transition hover:bg-amber-300 print:hidden"
    >
      Imprimir Comprobante
    </button>
  );
}
