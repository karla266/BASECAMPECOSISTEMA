import React from 'react';
import Link from 'next/link';

export default function PalapaElParaisoPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Unidad Gastronómica y Recreativa del Ecosistema
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">
          Palapa El Paraíso
        </h1>
        <p className="text-neutral-400 mt-2">
          Espacio campestre para convivencia post-vuelo, alimentos preparados al momento y eventos grupales en las Altas Montañas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Ordenar Alimentos y Bebidas</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Selecciona Palapa El Paraíso como punto de entrega en tu pre-orden y paga en el checkout único.
            </p>
          </div>
          <Link
            href="/ordenar"
            className="mt-6 inline-block text-center py-3 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
          >
            Ir a Menú de Pre-Orden
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Grupos y Reservaciones</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Bloquea fecha para grupos, clubes de montaña o convivencias empresariales.
            </p>
          </div>
          <Link
            href="/alianzas"
            className="mt-6 inline-block text-center py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700"
          >
            Solicitar Disponibilidad Grupal
          </Link>
        </div>
      </div>
    </section>
  );
}
