'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BotonWhatsappVuelo from '@/components/vuelos/BotonWhatsappVuelo';

function CalendarioContent() {
  const searchParams = useSearchParams();
  const folioInicial = searchParams.get('folio') || '';
  const statusPago = searchParams.get('status');

  const [folio, setFolio] = useState(folioInicial);
  const [esFolioValido, setEsFolioValido] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('10:00');
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [pesoKg, setPesoKg] = useState(75);
  const [cupos, setCupos] = useState<Record<string, { disponible: boolean; piloto: string }>>({});

  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaSeleccionada)) return;
    void fetch(`/api/vuelos/disponibilidad?fecha=${fechaSeleccionada}`)
      .then((respuesta) => respuesta.json())
      .then((datos: { slots?: Array<{ horario: string; disponible: boolean; piloto: string }> }) => {
        const mapa: Record<string, { disponible: boolean; piloto: string }> = {};
        for (const slot of datos.slots || []) mapa[slot.horario] = { disponible: slot.disponible, piloto: slot.piloto };
        setCupos(mapa);
      })
      .catch(() => setCupos({}));
  }, [fechaSeleccionada]);
  const [procesandoPago, setProcesandoPago] = useState(false);

  const HORARIOS_OFICIALES = [
    { turno: '10:00', desc: 'Apertura térmica' },
    { turno: '12:00', desc: 'Térmica activa' },
    { turno: '14:00', desc: 'Vuelo sobre el valle' },
    { turno: '16:00', desc: 'Última ventana del día' },
  ];

  useEffect(() => {
    if (folio.trim().length >= 8) {
      setEsFolioValido(true);
    } else {
      setEsFolioValido(false);
    }
  }, [folio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Canje de folio físico de Mercado Libre -> Notifica por WhatsApp sin cobrar
    if (esFolioValido) {
      const folioParam = encodeURIComponent(folio.trim());
      window.location.href = `/reservar?folio=${folioParam}`;
      return;
    }

    // 2. Compra Web Directa ($1,600 MXN) -> Redirige a pasarela Mercado Pago
    setProcesandoPago(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreCliente,
          telefono: telefonoCliente,
          fecha: fechaSeleccionada,
          horario: horarioSeleccionado,
          pesoKg,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || 'Error al conectar con la pasarela de pagos');
      }
    } catch (err) {
      console.error('Error al procesar cobro:', err);
      alert('Error de conexión con el servidor');
    } finally {
      setProcesandoPago(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-10 text-white shadow-2xl">
      {statusPago === 'approved' && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-center text-emerald-300 text-sm font-bold">
          🎉 ¡Pago acreditado exitosamente! Tu vuelo quedó agendado.
        </div>
      )}

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
            Deja este campo vacío si vas a pagar los $1,600 MXN en línea con tarjeta o SPEI.
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
          <label className="block text-xs font-semibold text-neutral-400 mb-1">Peso aproximado (kg)</label>
          <input
            type="number"
            min={40}
            max={120}
            required
            value={pesoKg}
            onChange={(e) => setPesoKg(Number(e.target.value || 0))}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          />
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {HORARIOS_OFICIALES.map((h) => (
              <button
                type="button"
                key={h.turno}
                onClick={() => setHorarioSeleccionado(h.turno)}
                disabled={fechaSeleccionada !== '' && cupos[h.turno]?.disponible === false}
                className={`min-h-12 rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  horarioSeleccionado === h.turno
                    ? 'border-amber-400 bg-amber-400/10 text-white'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-bold text-sm text-amber-400">{h.turno}</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  {cupos[h.turno]?.disponible === false ? 'Slot saturado' : cupos[h.turno]?.piloto || h.desc}
                </div>
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
            disabled={procesandoPago || (fechaSeleccionada !== '' && cupos[horarioSeleccionado]?.disponible === false)}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold py-3.5 px-6 rounded-xl text-base transition shadow-lg"
          >
            {procesandoPago
              ? 'Conectando con Mercado Pago...'
              : esFolioValido
              ? 'Confirmar Turno con mi Folio'
              : 'Pagar $1,600 MXN y Confirmar Vuelo'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CalendarioPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-neutral-950 px-4 pb-28 pt-8">
      <Suspense fallback={<div className="text-center text-white">Cargando agenda...</div>}>
        <CalendarioContent />
      </Suspense>
      <BotonWhatsappVuelo />
    </main>
  );
}
