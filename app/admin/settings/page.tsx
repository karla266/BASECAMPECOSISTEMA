"use client";

import { Settings, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-400" />
          Ajustes
        </h1>
        <p className="text-slate-400 text-sm">Configuración global del entorno operativo.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" /> Seguridad y Accesos
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <h3 className="font-bold text-white">Autenticación 2FA</h3>
              <p className="text-sm text-slate-400">Requerir verificación de dos pasos para este tenant.</p>
            </div>
            <button className="w-12 h-6 bg-slate-800 rounded-full relative transition-colors">
              <div className="w-4 h-4 bg-slate-500 rounded-full absolute left-1 top-1"></div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
