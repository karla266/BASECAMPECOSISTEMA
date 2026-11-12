'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

type FlightSlot = '10:00' | '12:00' | '14:00' | '16:00';

interface SlotStatus {
  time: FlightSlot;
  label: string;
  titularBusy: boolean;
}

const OFFICIAL_SLOTS: SlotStatus[] = [
  { time: '10:00', label: '10:00 AM — Apertura térmica estable', titularBusy: false },
  { time: '12:00', label: '12:00 PM — Térmica activa panorámica', titularBusy: false },
  { time: '14:00', label: '02:00 PM — Ventana de tarde Valle de Fortín', titularBusy: true },
  { time: '16:00', label: '04:00 PM — Última ventana diurna', titularBusy: false },
];

export default function UnifiedFlightBookingPage() {
  const router = useRouter();
  const { addItem } = useCart();

  const [flightDate, setFlightDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<FlightSlot>('10:00');
  const [passengerName, setPassengerName] = useState('');
  const [passengerWeightKg, setPassengerWeightKg] = useState<number>(70);
  const [packageType, setPackageType] = useState<'standard' | 'certificate'>('standard');
  const [weatherPolicyAccepted, setWeatherPolicyAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentSlotObj = OFFICIAL_SLOTS.find((s) => s.time === selectedSlot);
  const assignedPilot = currentSlotObj?.titularBusy
    ? 'Piloto Certificado de Respaldo (Directorio APPI Fortín)'
    : 'Salvador Lara (Master Instructor APPI)';

  const unitPrice = packageType === 'certificate' ? 2800 : 1600;

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!flightDate) {
      setErrorMsg('Selecciona una fecha válida para tu vuelo.');
      return;
    }
    if (!passengerName.trim()) {
      setErrorMsg('Ingresa el nombre completo del pasajero.');
      return;
    }
    if (passengerWeightKg < 25 || passengerWeightKg > 115) {
      setErrorMsg('El peso operativo seguro para vuelo tándem es entre 25 kg y 115 kg.');
      return;
    }
    if (!weatherPolicyAccepted) {
      setErrorMsg('Debes aceptar la política de seguridad meteorológica y reprogramación.');
      return;
    }

    const bookingId = `FLIGHT-${flightDate}-${selectedSlot}-${packageType}`;

    addItem({
      id: bookingId,
      sku: packageType === 'certificate' ? 'VUELO-CERT-2800' : 'VUELO-WEB-1600',
      title:
        packageType === 'certificate'
          ? `Vuelo en Parapente Tándem + Certificado (${flightDate} ${selectedSlot})`
          : `Vuelo en Parapente Tándem Web (${flightDate} ${selectedSlot})`,
      unitPrice,
      quantity: 1,
      type: 'flight',
      metadata: {
        flightDate,
        flightSlot: selectedSlot,
        passengerName: passengerName.trim(),
        passengerWeightKg,
        assignedPilot,
        includesCertificate: packageType === 'certificate',
        weatherPolicyAccepted: true,
      },
    });

    router.push('/checkout');
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold text-white mb-2">
        Reserva Oficial de Vuelo en Parapente Tándem
      </h1>
      <p className="text-neutral-400 mb-8">
        Selecciona tu fecha, horario de despegue y modalidad. Tu lugar queda bloqueado al confirmar en el checkout.
      </p>

      <form
        onSubmit={handleProceedToCheckout}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPackageType('standard')}
            className={`p-4 rounded-xl border text-left transition-all ${
              packageType === 'standard'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-neutral-800 bg-neutral-950'
            }`}
          >
            <p className="font-bold text-white text-lg">Vuelo Tándem Web</p>
            <p className="text-emerald-400 font-extrabold text-2xl mt-1">$1,600 MXN</p>
            <p className="text-xs text-neutral-400 mt-1">
              Incluye equipo certificado, seguro de vuelo e instructor APPI.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPackageType('certificate')}
            className={`p-4 rounded-xl border text-left transition-all ${
              packageType === 'certificate'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-neutral-800 bg-neutral-950'
            }`}
          >
            <p className="font-bold text-white text-lg">Vuelo + Certificado de Experiencia</p>
            <p className="text-emerald-400 font-extrabold text-2xl mt-1">$2,800 MXN</p>
            <p className="text-xs text-neutral-400 mt-1">
              Incluye vuelo tándem, certificado oficial impreso y paquete multimedia.
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-200 mb-2">
              Fecha de Vuelo
            </label>
            <input
              type="date"
              value={flightDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFlightDate(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-200 mb-2">
              Horario Oficial de Despegue
            </label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value as FlightSlot)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white"
            >
              {OFFICIAL_SLOTS.map((slot) => (
                <option key={slot.time} value={slot.time}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-200 mb-2">
              Nombre Completo del Pasajero
            </label>
            <input
              type="text"
              placeholder="Ej. Karla Guzmán"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-200 mb-2">
              Peso del Pasajero (kg)
            </label>
            <input
              type="number"
              min={25}
              max={115}
              value={passengerWeightKg}
              onChange={(e) => setPassengerWeightKg(Number(e.target.value))}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white"
              required
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400">
              Piloto Asignado por Disponibilidad
            </p>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">{assignedPilot}</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            Slot Verificado
          </span>
        </div>

        <label className="flex items-start gap-3 text-sm text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={weatherPolicyAccepted}
            onChange={(e) => setWeatherPolicyAccepted(e.target.checked)}
            className="mt-1 rounded border-neutral-700"
          />
          <span>
            Acepto la política meteorológica y de cancelación: el despegue está sujeto a condiciones de viento y visibilidad seguras en montaña. En caso de clima adverso, la reserva se reprograma sin penalización.
          </span>
        </label>

        {errorMsg && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2.5">
            {errorMsg}
          </p>
        )}

        <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-neutral-800">
          <div>
            <p className="text-xs text-neutral-400">Total a pagar en Checkout</p>
            <p className="text-2xl font-extrabold text-white">${unitPrice.toLocaleString('es-MX')} MXN</p>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-colors"
          >
            Pagar y Confirmar en Checkout
          </button>
        </div>
      </form>
    </section>
  );
}
