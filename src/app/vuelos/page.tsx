import React from 'react';
import Link from 'next/link';

export default function ParaglidingFlightsPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Vuelo Libre Certificado APPI • Orizaba y Fortín
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          Vuelos en Parapente Tándem en las Altas Montañas
        </h1>
        <p className="text-neutral-300 max-w-3xl">
          Despega desde el Cerro de las Antenas con vista al Pico de Orizaba y al Valle de Fortín. Operamos bajo estándar internacional APPI con Salvador Lara (Master Instructor) y cuerpo de pilotos certificados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { slot: '10:00 AM', desc: 'Apertura térmica suave, ideal para primer vuelo.' },
          { slot: '12:00 PM', desc: 'Térmica activa con máxima altura panorámica.' },
          { slot: '02:00 PM', desc: 'Ventana dinámica sobre el valle de Fortín.' },
          { slot: '04:00 PM', desc: 'Vuelo de tarde sujeto a condiciones de brisa y niebla.' },
        ].map((item) => (
          <div key={item.slot} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <p className="text-emerald-400 font-extrabold text-xl">{item.slot}</p>
            <p className="text-xs text-neutral-400 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <h2 className="text-xl font-bold text-white">Vuelo Tándem Web — $1,600 MXN</h2>
          <p className="text-sm text-neutral-400">
            Incluye check-in en Restaurante Anturios, ascenso a zona de despegue, equipo homologado, casco, arnés y vuelo biplaza con piloto certificado.
          </p>
          <Link
            href="/calendario"
            className="inline-block w-full text-center py-3 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
          >
            Elegir Horario y Pagar en Checkout
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <h2 className="text-xl font-bold text-white">
            Vuelo + Certificado de Experiencia — $2,800 MXN
          </h2>
          <p className="text-sm text-neutral-400">
            Incluye introducción teórica previa al despegue, vuelo biplaza, paquete de video y certificado oficial impreso.
          </p>
          <Link
            href="/calendario"
            className="inline-block w-full text-center py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700"
          >
            Reservar Modalidad con Certificado
          </Link>
        </div>
      </div>
    </section>
  );
}
