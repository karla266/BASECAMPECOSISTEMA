import React from 'react';
import B2BCommercialForm from '@/components/b2b/B2BCommercialForm';

export default function AlianzasB2BPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Convenios y Grupos Empresariales
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">
          Alianzas Comerciales, Experiencias Corporativas y Distribución B2B
        </h1>
        <p className="text-neutral-400 mt-2">
          Estructura paquetes corporativos en Día Cumbre, convenios turísticos o distribución mayorista con vitrinas llave en mano.
        </p>
      </div>
      <B2BCommercialForm unitMode="alianzas" />
    </section>
  );
}
