'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface MenuItem {
  sku: string;
  name: string;
  description: string;
  price: number;
}

const FOOD_MENU: MenuItem[] = [
  {
    sku: 'FOOD-MICHELADA',
    name: 'Michelada Artesanal de Cumbre',
    description: 'Preparada con escarchado de la casa y mix especial en vaso de litro.',
    price: 110,
  },
  {
    sku: 'FOOD-HOTDOG',
    name: 'Hot Dog Campestre Especial',
    description: 'Salchicha tipo Frankfurt, tocino ahumado, cebolla caramelizada y aderezos.',
    price: 85,
  },
  {
    sku: 'FOOD-TACO',
    name: 'Orden de Tacos a la Parrilla',
    description: 'Tortilla recién hecha con corte jugoso, guacamole y salsas de molcajete.',
    price: 95,
  },
  {
    sku: 'FOOD-DESAYUNO',
    name: 'Desayuno Montañero Anturios',
    description: 'Chilaquiles o huevos al gusto, café de olla ilimitado y pan de leña.',
    price: 165,
  },
];

export default function FoodOrderPage() {
  const router = useRouter();
  const { addItem } = useCart();

  const [quantities, setQuantities] = useState<Record<string, number>>({
    'FOOD-MICHELADA': 0,
    'FOOD-HOTDOG': 0,
    'FOOD-TACO': 0,
    'FOOD-DESAYUNO': 0,
  });

  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('13:00');
  const [deliveryPoint, setDeliveryPoint] = useState('Restaurante Campestre Anturios');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const updateQty = (sku: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [sku]: Math.max(0, (prev[sku] || 0) + delta),
    }));
  };

  const selectedItems = FOOD_MENU.filter((item) => (quantities[item.sku] || 0) > 0);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * (quantities[item.sku] || 0),
    0
  );

  const handleCheckoutFood = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedItems.length === 0) {
      setErrorMsg('Selecciona al menos un alimento o bebida para continuar.');
      return;
    }
    if (!deliveryDate) {
      setErrorMsg('Indica la fecha programada para la entrega de tu orden.');
      return;
    }

    for (const item of selectedItems) {
      addItem({
        id: `${item.sku}-${deliveryDate}-${deliveryTime}`,
        sku: item.sku,
        title: `${item.name} (${deliveryPoint})`,
        unitPrice: item.price,
        quantity: quantities[item.sku],
        type: 'food',
        metadata: {
          deliveryDate,
          deliveryTime,
          deliveryPoint,
          notes: notes.trim(),
        },
      });
    }

    router.push('/checkout');
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold text-white mb-2">
        Ordenar Alimentos y Bebidas (Pre-Orden)
      </h1>
      <p className="text-neutral-400 mb-8">
        Programa tus alimentos para tenerlos listos al aterrizar de tu vuelo o al llegar a Restaurante Anturios y Palapa El Paraíso.
      </p>

      <form onSubmit={handleCheckoutFood} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FOOD_MENU.map((item) => {
            const qty = quantities[item.sku] || 0;
            return (
              <div
                key={item.sku}
                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="font-bold text-white text-lg">{item.name}</h2>
                    <span className="text-emerald-400 font-extrabold">
                      ${item.price} MXN
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400 mt-1">{item.description}</p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-neutral-800">
                  <span className="text-xs text-neutral-400">Cantidad</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQty(item.sku, -1)}
                      className="w-8 h-8 rounded-lg bg-neutral-800 text-white font-bold hover:bg-neutral-700"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-white">{qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.sku, 1)}
                      className="w-8 h-8 rounded-lg bg-emerald-500 text-neutral-950 font-bold hover:bg-emerald-400"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-lg font-bold text-white">
            Logística de Entrega y Punto de Servicio
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Fecha de Entrega
              </label>
              <input
                type="date"
                value={deliveryDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Hora Programada
              </label>
              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Punto de Entrega
              </label>
              <select
                value={deliveryPoint}
                onChange={(e) => setDeliveryPoint(e.target.value)}
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              >
                <option value="Restaurante Campestre Anturios">
                  Restaurante Campestre Anturios (Check-in)
                </option>
                <option value="Zona de Aterrizaje Fortín">
                  Zona de Aterrizaje Fortín (Post-vuelo)
                </option>
                <option value="Palapa El Paraíso">Palapa El Paraíso</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Notas de Preparación (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Sin cebolla, salsa aparte, mesa junto al mirador..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2">
              {errorMsg}
            </p>
          )}

          <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xs text-neutral-400">Subtotal de Alimentos</p>
              <p className="text-2xl font-extrabold text-white">
                ${subtotal.toLocaleString('es-MX')} MXN
              </p>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-colors"
            >
              Confirmar Orden e Ir al Checkout
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
