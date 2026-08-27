"use client";

import { FileUp, UploadCloud } from 'lucide-react';

export default function AdminCsvPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
          <FileUp className="w-8 h-8 text-emerald-400" />
          Carga Masiva CSV
        </h1>
        <p className="text-slate-400 text-sm">Importación y actualización de inventarios (SICAR).</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center border-dashed">
        <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mb-6">
          <UploadCloud className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Arrastra tu archivo CSV aquí</h3>
        <p className="text-slate-400 text-sm mb-8 max-w-md">
          Sube la plantilla oficial exportada desde SICAR para actualizar precios, stock y nuevos artículos automáticamente.
        </p>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          Seleccionar Archivo
        </button>
      </div>
    </>
  );
}
