"use client";

import { Mic, Settings2 } from 'lucide-react';

export default function AdminVoicePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
          <Mic className="w-8 h-8 text-blue-400" />
          Agente de Voz IA
        </h1>
        <p className="text-slate-400 text-sm">Configuración de respuestas automatizadas y leads.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
            <Settings2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Configuración del Agente</h2>
            <p className="text-sm text-slate-400">Entrenamiento y directrices del sistema</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Prompt Base del Sistema</label>
            <textarea 
              rows={4} 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
              defaultValue="Eres un agente de ventas experto para la marca..."
            />
          </div>
          <button className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors">
            Guardar Configuración
          </button>
        </div>
      </div>
    </>
  );
}
