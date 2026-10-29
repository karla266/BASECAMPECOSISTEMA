"use client";

export default function PrintConvenioButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-emerald-500 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-xl transition hover:bg-emerald-400 print:hidden"
    >
      Imprimir Convenio Oficial (PDF)
    </button>
  );
}
