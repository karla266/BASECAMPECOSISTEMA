"use client";

import { useState } from 'react';
import { LayoutTemplate, CheckCircle2 } from 'lucide-react';

const templates = [
  {
    id: 'smokeshop-dark',
    name: 'Smokeshop Dark Neon',
    description: 'Estilo nocturno, acentos neón y enfoque e-commerce agresivo. Ideal para parafernalia.',
    badge: 'Trending',
    previewColor: 'from-fuchsia-600 to-purple-900',
    borderColor: 'border-fuchsia-500/50'
  },
  {
    id: 'adventure-outdoor',
    name: 'Basecamp Outdoor Extreme',
    description: 'Estilo terrenal, bloques pesados y fondos texturizados. Para tours y renta de equipo.',
    badge: 'Popular',
    previewColor: 'from-emerald-600 to-slate-900',
    borderColor: 'border-emerald-500/50'
  },
  {
    id: 'service-minimal',
    name: 'Cima Minimal Health/Service',
    description: 'Estilo limpio, mucho espacio negativo y tipografía fina. Clínicas o agencias B2B.',
    badge: 'Nuevo',
    previewColor: 'from-slate-700 to-slate-950',
    borderColor: 'border-slate-500/50'
  }
];

export default function TemplateSelector() {
  const [activeTemplate, setActiveTemplate] = useState('adventure-outdoor');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <LayoutTemplate className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">Selector de Plantillas Visuales</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((tpl) => {
          const isActive = activeTemplate === tpl.id;
          return (
            <div 
              key={tpl.id}
              onClick={() => setActiveTemplate(tpl.id)}
              className={`relative rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden group ${
                isActive 
                  ? 'border-emerald-500 bg-slate-900' 
                  : 'border-slate-800 bg-slate-950 hover:border-slate-600'
              }`}
            >
              {/* Preview Window Header */}
              <div className="h-6 bg-slate-950 border-b border-slate-800 flex items-center px-3 gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
              </div>

              {/* Preview Content Area */}
              <div className={`h-32 bg-gradient-to-br ${tpl.previewColor} opacity-80 group-hover:opacity-100 transition-opacity`} />
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white text-base">{tpl.name}</h3>
                  {isActive && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{tpl.description}</p>
                <div className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                  {tpl.badge}
                </div>
              </div>

              {/* Action overlay */}
              {isActive && (
                <div className="absolute top-3 right-3">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-1 rounded shadow-lg uppercase">
                    Activa
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          Aplicar Plantilla Instantáneamente
        </button>
      </div>
    </div>
  );
}
