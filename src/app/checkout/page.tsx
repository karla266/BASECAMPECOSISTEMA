'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { trackConversionEvent } from '@/lib/analytics';

export default function UnifiedCheckoutPage() {
  const { items, removeItem, clearCart, totalAmount } = useCart();

  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderFolio, setOrderFolio] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (items.length > 0) {
      trackConversionEvent('begin_checkout', {
        itemCount: items.length,
        totalAmount,
      });
    }
  }, [items.length, totalAmount]);

  const handleCreateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'basecamp_420',
        },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerPhone: buyerPhone.trim(),
          items,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo inicializar el pago en Checkout.');
      }

      trackConversionEvent('purchase_confirmed', {
        folio: data.folio,
        totalAmount,
      });

      setOrderFolio(data.folio);
      if (data.init_point) {
        setCheckoutUrl(data.init_point);
      }
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el checkout.');
    } finally {
      setProcessing(false);
    }
  };

  if (orderFolio) {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16 text-center space-y-6">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
          Orden Confirmada y Registrada
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Folio de Operación: {orderFolio}
        </h1>
        <p className="text-neutral-300 text-sm max-w-xl mx-auto">
          Hemos registrado tu orden y enviado el resumen a <strong>{buyerEmail}</strong>.
        </p>
        {checkoutUrl && (
          <div className="pt-2">
            <a
              href={checkoutUrl}
              className="inline-block px-8 py-4 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-colors"
            >
              Completar Pago Seguro en Mercado Pago
            </a>
          </div>
        )}
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
        <h1 className="text-3xl font-extrabold text-white">
          Tu Carrito de Checkout está Vacío
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto text-sm">
          Agrega productos de The Trip Smoke Shop, reserva un vuelo en parapente tándem, inscríbete al Curso APPI ($30,000 MXN), renta equipo outdoor o programa tus alimentos en Anturios.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/the-trip"
            className="px-6 py-3 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
          >
            Ir a Tienda The Trip
          </Link>
          <Link
            href="/calendario"
            className="px-6 py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700"
          >
            Reservar Vuelo Tándem
          </Link>
          <Link
            href="/cursos"
            className="px-6 py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700"
          >
            Curso APPI ($30,000 MXN)
          </Link>
          <Link
            href="/renta"
            className="px-6 py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700"
          >
            Renta de Equipo Outdoor
          </Link>
          <Link
            href="/ordenar"
            className="px-6 py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700"
          >
            Ordenar Alimentos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-extrabold text-white">
          Resumen de Partidas en Checkout Único
        </h1>

        {items.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row justify-between gap-4"
          >
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                {item.type === 'flight'
                  ? 'Reserva de Vuelo'
                  : item.type === 'course'
                  ? 'Escuela APPI'
                  : item.type === 'food'
                  ? 'Pre-Orden Alimentos'
                  : item.type === 'rental'
                  ? 'Renta Equipo Outdoor'
                  : 'Producto Físico'}
              </span>
              <h2 className="font-bold text-white text-base">{item.title}</h2>
              <p className="text-xs text-neutral-400">SKU: {item.sku} • Cantidad: {item.quantity}</p>

              {item.metadata && (
                <div className="text-xs text-neutral-300 pt-2 space-y-0.5">
                  {item.metadata.flightDate && (
                    <p>Fecha programada: {item.metadata.flightDate} {item.metadata.flightSlot || ''}</p>
                  )}
                  {item.metadata.passengerName && (
                    <p>Titular / Pasajero: {item.metadata.passengerName} ({item.metadata.passengerWeightKg} kg)</p>
                  )}
                  {item.metadata.assignedPilot && (
                    <p>Piloto asignado: {item.metadata.assignedPilot}</p>
                  )}
                  {item.metadata.deliveryDate && (
                    <p>Entrega: {item.metadata.deliveryDate} {item.metadata.deliveryTime || ''} — {item.metadata.deliveryPoint || ''}</p>
                  )}
                  {item.metadata.rentalDays && (
                    <p>Días de renta: {item.metadata.rentalDays} • Serie/QR: {item.metadata.serialCode} • Garantía incluida: ${item.metadata.securityDeposit} MXN</p>
                  )}
                  {item.metadata.notes && <p>Notas: {item.metadata.notes}</p>}
                </div>
              )}
            </div>

            <div className="flex sm:flex-col justify-between items-end">
              <p className="text-lg font-extrabold text-white">
                ${(item.unitPrice * item.quantity).toLocaleString('es-MX')} MXN
              </p>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-xs text-red-400 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleCreateCheckout}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5 h-fit"
      >
        <h2 className="text-lg font-extrabold text-white">
          Datos de Confirmación y Pago
        </h2>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="Nombre y apellidos"
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Correo Electrónico (Recepción de Folio)
          </label>
          <input
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            placeholder="cliente@correo.com"
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Teléfono de Contacto
          </label>
          <input
            type="tel"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            placeholder="272 000 0000"
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
            required
          />
        </div>

        <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
          <span className="text-sm text-neutral-400">Total a Pagar</span>
          <span className="text-2xl font-extrabold text-emerald-400">
            ${totalAmount.toLocaleString('es-MX')} MXN
          </span>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg p-2.5">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={processing}
          className="w-full py-3.5 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-colors disabled:opacity-50"
        >
          {processing ? 'Generando Orden Segura...' : 'Pagar con Mercado Pago Checkout'}
        </button>
      </form>
    </section>
  );
}
