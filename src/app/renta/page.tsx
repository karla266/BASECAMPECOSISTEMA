'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface RentalAsset {
  sku: string;
  serialPrefix: string;
  name: string;
  category: string;
  dailyRate: number;
  securityDeposit: number;
  status: 'DISPONIBLE' | 'ASIGNADO_A_TOUR';
}

const RENTAL_CATALOG: RentalAsset[] = [
  {
    sku: 'RENT-CASCO-ARNES',
    serialPrefix: 'QR-FLIGHT-01',
    name: 'Kit Casco Certificado + Arnés de Práctica Tierra',
    category: 'Vuelo Libre / Inflado',
    dailyRate: 450,
    securityDeposit: 1000,
    status: 'DISPONIBLE',
  },
  {
    sku: 'RENT-PIOLET-CRAMPON',
    serialPrefix: 'QR-ALTA-04',
    name: 'Combo Alta Montaña: Piolet Técnico + Crampones 12 Puntas',
    category: 'Glaciar / Pico de Orizaba',
    dailyRate: 550,
    securityDeposit: 1200,
    status: 'DISPONIBLE',
  },
  {
    sku: 'RENT-TENT-2P',
    serialPrefix: 'QR-CAMP-09',
    name: 'Casa de Campaña Impermeable 2 Personas (3 Estaciones)',
    category: 'Camping / Trekking',
    dailyRate: 350,
    securityDeposit: 800,
    status: 'DISPONIBLE',
  },
  {
    sku: 'RENT-BASTONES-STOVE',
    serialPrefix: 'QR-TREK-12',
    name: 'Par de Bastones de Trekking + Estufa Portátil de Campamento',
    category: 'Senderismo / Trepacerros',
    dailyRate: 220,
    securityDeposit: 500,
    status: 'DISPONIBLE',
  },
];

export default function OutdoorRentalPage() {
  const router = useRouter();
  const { addItem } = useCart();

  const [selectedSku, setSelectedSku] = useState(RENTAL_CATALOG[0].sku);
  const [quantity, setQuantity] = useState(1);
  const [rentalDays, setRentalDays] = useState(1);
  const [pickupDate, setPickupDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [inspectionAccepted, setInspectionAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const asset = RENTAL_CATALOG.find((a) => a.sku === selectedSku) || RENTAL_CATALOG[0];
  const rentalSubtotal = asset.dailyRate * rentalDays * quantity;
  const totalDeposit = asset.securityDeposit * quantity;
  const totalUnitCharge = asset.dailyRate * rentalDays + asset.securityDeposit;

  const handleAddRentalToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pickupDate) {
      setErrorMsg('Selecciona la fecha de check-out del equipo.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Ingresa el nombre del titular responsable del contrato de renta.');
      return;
    }
    if (!inspectionAccepted) {
      setErrorMsg('Debes aceptar el protocolo de inspección fotográfica Check-Out / Check-In y garantía.');
      return;
    }

    addItem({
      id: `RENT-${asset.sku}-${pickupDate}-${rentalDays}D`,
      sku: asset.sku,
      title: `Renta: ${asset.name} (${rentalDays} día(s) + Depósito Reembolsable)`,
      unitPrice: totalUnitCharge,
      quantity,
      type: 'rental',
      metadata: {
        deliveryDate: pickupDate,
        passengerName: customerName.trim(),
        rentalDays,
        securityDeposit: totalDeposit,
        serialCode: asset.serialPrefix,
        notes: `Tarifa renta: $${rentalSubtotal} MXN + Garantía reembolsable: $${totalDeposit} MXN`,
      },
    });

    router.push('/checkout');
  };

  return (
    <section className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Activos Serializados con Código QR Unitario
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">
          Renta de Equipo Outdoor y Alta Montaña
        </h1>
        <p className="text-neutral-400 mt-2">
          Reserva tu equipo con disponibilidad garantizada, checklist fotográfico de entrega y depósito en garantía reembolsable al check-in.
        </p>
      </div>

      <form
        onSubmit={handleAddRentalToCheckout}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RENTAL_CATALOG.map((item) => (
            <button
              key={item.sku}
              type="button"
              onClick={() => setSelectedSku(item.sku)}
              className={`p-5 rounded-xl border text-left transition-all ${
                selectedSku === item.sku
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-neutral-800 bg-neutral-950'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400">{item.category}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {item.serialPrefix} • {item.status}
                </span>
              </div>
              <h2 className="font-bold text-white text-base mt-2">{item.name}</h2>
              <p className="text-sm text-neutral-300 mt-2">
                Renta por día: <strong>${item.dailyRate} MXN</strong> • Depósito en garantía:{' '}
                <strong>${item.securityDeposit} MXN</strong>
              </p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Titular Responsable del Contrato
            </label>
            <input
              type="text"
              placeholder="Nombre completo como aparece en INE"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Fecha de Salida (Check-Out)
            </label>
            <input
              type="date"
              value={pickupDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Días
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={rentalDays}
                onChange={(e) => setRentalDays(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2.5 text-white text-sm text-center"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Equipos
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2.5 text-white text-sm text-center"
                required
              />
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={inspectionAccepted}
            onChange={(e) => setInspectionAccepted(e.target.checked)}
            className="mt-1 rounded border-neutral-700"
          />
          <span>
            Acepto el checklist de inspección fotográfica al recoger (Check-Out) y devolver (Check-In) el activo serializado. El depósito en garantía (${totalDeposit.toLocaleString('es-MX')} MXN) se reembolsa íntegramente tras validar el buen estado del equipo.
          </span>
        </label>

        {errorMsg && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2">
            {errorMsg}
          </p>
        )}

        <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs text-neutral-400">
              Renta (${rentalSubtotal.toLocaleString('es-MX')}) + Garantía Reembolsable (${totalDeposit.toLocaleString('es-MX')})
            </p>
            <p className="text-2xl font-extrabold text-white">
              ${(rentalSubtotal + totalDeposit).toLocaleString('es-MX')} MXN
            </p>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-colors"
          >
            Bloquear Serie QR y Pagar en Checkout
          </button>
        </div>
      </form>
    </section>
  );
}
