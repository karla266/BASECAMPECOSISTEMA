"use client";

import Link from 'next/link';
import { ArrowLeft, Globe, MonitorSmartphone, Megaphone, CheckCircle2 } from 'lucide-react';

export default function CimaDigitalPage() {
  const services = [
    {
      title: 'Desarrollo B2B SaaS',
      desc: 'Plataformas web de alto rendimiento, sistemas multi-tenant y portales de clientes.',
      icon: <MonitorSmartphone className="w-8 h-8 text-cyan-400" />
    },
    {
      title: 'Publicidad Aérea',
      desc: 'Branding masivo en velas de parapente. Tu logo volando sobre Valle de Bravo y más locaciones.',
      icon: <Megaphone className="w-8 h-8 text-cyan-400" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      <header className="border-b border-slate-900 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">Volver al Hub</span>
          </Link>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            <span className="font-extrabold tracking-widest text-white uppercase">Cima Digital</span>
          </div>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center py-20 px-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="max-w-4xl mx-auto w-full relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Agencia Web & <span className="text-cyan-400">Branding Extremo</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Construimos ecosistemas digitales para marcas audaces, y llevamos tu logotipo a los cielos literalmente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {services.map((svc, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:bg-slate-900 transition-colors">
                <div className="w-16 h-16 rounded-xl bg-cyan-950/30 border border-cyan-900/50 flex items-center justify-center mb-6">
                  {svc.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{svc.title}</h3>
                <p className="text-slate-400 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-cyan-950/20 border border-cyan-900/50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">¿Listo para elevar tu marca?</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Agenda una videollamada con nuestro equipo de estrategia y descubre cómo podemos escalar tus operaciones.
            </p>
            <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] inline-flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Agendar Consulta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
