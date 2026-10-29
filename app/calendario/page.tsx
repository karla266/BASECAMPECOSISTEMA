'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CalendarioContent() {
  const searchParams = useSearchParams();
  const folioInicial = searchParams.get('folio') || '';

  const [folio, setFolio] = useState(folioInicial);
  const [esFolioValido, setEsFolioValido] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('10:00 AM');
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');

  const HORARIOS_OFICIALES = [
    { turno: '10:00 AM', desc: 'Apertura térmica (óptima principiantes)' },
    { turno: '12:00 PM', desc: 'Térmica activa panorámica' },
    { turno: '02:00 PM', desc: 'Vuelo dinámico sobre el valle' },
    { turno: '04:00 PM', desc: 'Última ventana diurna / Atardecer' },
  ];

  useEffect(() => {
    if (folio.trim().length >= 8) {
      setEsFolioValido(true);
    } else {
      setEsFolioValido(false);
    }
  }, [folio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mensaje = esFolioValido
      ? `Hola Basecamp 420, solicito confirmar mi vuelo CANJEANDO MI CERTIFICADO FÍSICO con Folio: ${folio}. Nombre: ${nombreCliente}, Fecha: ${fechaSeleccionada}, Horario: ${horarioSeleccionado}.`
      : `Hola Basecamp 420, solicito reservar y pagar Vuelo Tándem ($1,600 MXN) para el día ${fechaSeleccionada} a las ${horarioSeleccionado}. Nombre: ${nombreCliente}.`;

    window.open(`https://wa.me/522727258748?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-10 text-white shadow-2xl">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 font-bold">
          Agenda Oficial · Fortín de las Flores
        </span>
        <h1 className="text-3xl md:text-4xl font-black mt-3">Reserva tu Vuelo en Parapente</h1>
        <p className="text-neutral-400 text-sm mt-2">
          Piloto APPI Master Instructor: Salvador Lara (33 años de trayectoria)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
            ¿Tienes un Certificado de Vuelo de Mercado Libre?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ingresa tu folio (Ej. 20260000001)"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
            {esFolioValido && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-2 rounded-xl flex items-center font-bold">
                ✓ Folio Verificado
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Si compraste en Mercado Libre, introduce el folio impreso en tu tarjeta física para exonerar el pago web.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Nombre Completo del Pasajero</label>
            <input
              type="text"
              required
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              placeholder="Nombre y Apellidos"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">WhatsApp de Contacto</label>
            <input
              type="tel"
              required
              value={telefonoCliente}
              onChange={(e) => setTelefonoCliente(e.target.value)}
              placeholder="10 dígitos (ej. 272 123 4567)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1">Fecha Deseada de Vuelo</label>
          <input
            type="date"
            required
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-2">Horario de Despegue (Slots Oficiales)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HORARIOS_OFICIALES.map((h) => (
              <button
                type="button"
                key={h.turno}
                onClick={() => setHorarioSeleccionado(h.turno)}
                className={`p-3 rounded-xl border text-left transition ${
                  horarioSeleccionado === h.turno
                    ? 'border-amber-400 bg-amber-400/10 text-white'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-bold text-sm text-amber-400">{h.turno}</div>
                <div className="text-xs text-neutral-400 mt-0.5">{h.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-400 text-sm">Monto a liquidar:</span>
            <span className="text-2xl font-black text-white">
              {esFolioValido ? '$0 MXN (Pagado en ML)' : '$1,600 MXN'}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 px-6 rounded-xl text-base transition shadow-lg"
          >
            {esFolioValido ? 'Confirmar Turno con mi Folio' : 'Agendar Turno y Proceder al Pago'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CalendarioPage() {
  return (
    <main className="min-h-screen bg-neutral-950 py-12 px-4">
      <Suspense fallback={<div className="text-center text-white">Cargando agenda...</div>}>
        <CalendarioContent />
      </Suspense>
    </main>
  );
}