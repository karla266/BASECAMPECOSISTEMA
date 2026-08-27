import React from 'react';

export function UnitCard({ title, icon, desc, color }: { title: string, icon: React.ReactNode, desc: string, color: 'emerald' | 'cyan' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:-translate-y-2 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all duration-300 group cursor-pointer">
      <div className={`w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-${color}-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
