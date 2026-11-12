import React from 'react';
import Link from 'next/link';

export default function AnturiosPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Gastronomía de Montaña y Check-In Oficial de Vuelo
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">
          Restaurante Campestre Anturios
        </h1>
        <p className="text-neutral-400 mt-2">
          Punto de encuentro para pilotos y pasajeros antes del despegue. Ordena tu desayuno montañero en línea o estructura una reservación de grupo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Pre-Orden de Alimentos</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Programa tu desayuno montañero, tacos a la parrilla o bebidas antes de llegar.
            </p>
          </div>
          <Link
            href="/ordenar"
            className="mt-6 inline-block text-center py-3 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
          >
            Ordenar Alimentos Ahora
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Paquete Día Cumbre</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Combina tu desayuno en Anturios con vuelo tándem en parapente.
            </p>
          </div>
          <Link
            href="/dia-cumbre"
            className="mt-6 inline-block text-center py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700"
          >
            Ver Experiencia Día Cumbre
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Reservación de Grupo</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Agenda mesas para grupos corporativos, expediciones o eventos especiales con anticipo.
            </p>
          </div>
          <Link
            href="/alianzas"
            className="mt-6 inline-block text-center py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700"
          >
            Reservar Grupo / Evento
          </Link>
        </div>
      </div>
    </section>
  );
}
