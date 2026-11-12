import React from 'react';
import B2BCommercialForm from '@/components/b2b/B2BCommercialForm';

export default function ConvenioPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Captación Comercial B2B
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">
          Convenios Corporativos, Hoteles y Distribución Aliada
        </h1>
        <p className="text-neutral-400 mt-2">
          Registra los datos de tu organización para estructurar un convenio comercial o bloquear fechas de grupo.
        </p>
      </div>
      <B2BCommercialForm unitMode="alianzas" />
    </section>
  );
}
