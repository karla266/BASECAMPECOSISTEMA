import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function TenantCard({ name, url, status }: { name: string, url: string, status: string }) {
  const isActive = status === 'Activo';
  return (
    <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between group hover:bg-slate-900 transition-colors cursor-pointer">
      <div>
        <h4 className="font-bold text-white text-lg">{name}</h4>
        <p className="text-xs text-slate-500 mt-1 font-mono">{url}</p>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
        {isActive && <CheckCircle2 className="w-3 h-3" />}
        {status}
      </div>
    </div>
  );
}
