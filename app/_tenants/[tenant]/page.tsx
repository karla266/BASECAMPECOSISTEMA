"use client";

import { CheckCircle2, Server, Shield, Globe } from 'lucide-react';

export default function TenantPage({ params }: { params: { tenant: string } }) {
  // Aquí consultaríamos a https://api.basecamp420.com/api/tenant/{tenant} 
  // para obtener la configuración, la plantilla (smokeshop-dark, adventure-outdoor) y los productos.
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-slate-200">
      <div className="max-w-4xl w-full text-center p-12 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />
        
        <div className="relative z-10">
          <div className="inline-flex px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold text-xs tracking-widest uppercase mb-8 border border-emerald-500/20">
            Marca Aliada B2B
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            {params.tenant}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Este minisitio web es aprovisionado dinámicamente por el ecosistema SaaS Multi-Tenant de <strong className="text-emerald-400">Basecamp 420</strong>.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-8">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-slate-300 text-sm tracking-wider uppercase">Enrutamiento</span>
              </div>
              <span className="text-slate-400 text-sm leading-relaxed block">Resolución nativa Edge con Cloudflare for SaaS y Next.js Middleware.</span>
            </div>
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <Server className="w-5 h-5 text-fuchsia-400" />
                <span className="font-bold text-slate-300 text-sm tracking-wider uppercase">Base de Datos</span>
              </div>
              <span className="text-slate-400 text-sm leading-relaxed block">Separación de datos aislada con esquema multi-inquilino.</span>
            </div>
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-slate-300 text-sm tracking-wider uppercase">Estado Inquilino</span>
              </div>
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span> Activo y Seguro
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
