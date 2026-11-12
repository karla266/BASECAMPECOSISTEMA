import React from 'react';
import B2BCommercialForm from '@/components/b2b/B2BCommercialForm';

export default function CimaDigitalPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          División Tecnológica B2B
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">
          Cima Digital: Automatización, Agentes de IA y Terminales Offline
        </h1>
        <p className="text-neutral-400 mt-2">
          Implementamos infraestructura de comercio unificado, agentes autónomos, reportes en tiempo real y puntos de venta resilientes. Completa el diagnóstico comercial para iniciar.
        </p>
      </div>
      <B2BCommercialForm unitMode="cima-digital" />
    </section>
  );
}
