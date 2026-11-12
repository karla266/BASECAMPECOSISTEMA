'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function DiaCumbrePage() {
  const router = useRouter();
  const { addItem } = useCart();
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [leaderName, setLeaderName] = useState('');

  const unitPrice = 2450;

  const handleBookDiaCumbre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !leaderName.trim()) return;

    addItem({
      id: `DIA-CUMBRE-${date}`,
      sku: 'PACK-DIA-CUMBRE',
      title: `Paquete Integral Día Cumbre (${date})`,
      unitPrice,
      quantity: guests,
      type: 'flight',
      metadata: {
        flightDate: date,
        passengerName: leaderName.trim(),
        weatherPolicyAccepted: true,
        notes: 'Incluye Desayuno Montañero en Anturios + Vuelo Tándem + Hidratación en aterrizaje.',
      },
    });
    router.push('/checkout');
  };

  return (
    <section className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Experiencia Integral Todo Incluido
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">
          Día Cumbre: Montaña, Vuelo Tándem y Gastronomía Campestre
        </h1>
        <p className="text-neutral-400 mt-2">
          Itinerario completo diseñado para vivir la jornada de vuelo y montaña en Orizaba y Fortín con un solo checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <p className="font-bold text-emerald-400">09:00 AM • Check-in y Desayuno</p>
          <p className="text-neutral-300 mt-1">
            Recepción en Restaurante Campestre Anturios con desayuno montañero y registro de peso.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <p className="font-bold text-emerald-400">11:00 AM • Ascenso y Despegue</p>
          <p className="text-neutral-300 mt-1">
            Traslado a rampa en Cerro de las Antenas, briefing de seguridad y vuelo biplaza APPI.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <p className="font-bold text-emerald-400">02:00 PM • Convivencia Post-Vuelo</p>
          <p className="text-neutral-300 mt-1">
            Aterrizaje, bebida artesanal de cumbre y entrega de material.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleBookDiaCumbre}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Nombre del Titular
            </label>
            <input
              type="text"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Fecha de la Experiencia
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Número de Participantes ($2,450 MXN c/u)
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={guests}
              onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-neutral-800">
          <div>
            <p className="text-xs text-neutral-400">Total Paquete Día Cumbre</p>
            <p className="text-2xl font-extrabold text-white">
              ${(unitPrice * guests).toLocaleString('es-MX')} MXN
            </p>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
          >
            Reservar Día Cumbre en Checkout
          </button>
        </div>
      </form>
    </section>
  );
}
