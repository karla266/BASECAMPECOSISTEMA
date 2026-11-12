'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { items, removeItem, totalAmount, abierto, cerrarCart } = useCart();

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-neutral-950 border-l border-neutral-800 p-6 flex flex-col justify-between shadow-2xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
            <h2 className="text-lg font-extrabold text-white">Tu Carrito de Compras</h2>
            <button
              type="button"
              onClick={cerrarCart}
              className="text-neutral-400 hover:text-white text-sm font-bold p-1"
            >
              ✕ Cerrar
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {items.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-8">
                El carrito está vacío. Agrega experiencias o productos para continuar.
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between items-center gap-3"
                >
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-neutral-400">
                      Cant: {item.quantity} • ${item.unitPrice.toLocaleString('es-MX')} MXN
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-4 space-y-4">
          <div className="flex justify-between items-center text-white">
            <span className="text-sm text-neutral-400">Total Estimado</span>
            <span className="text-xl font-extrabold text-emerald-400">
              ${totalAmount.toLocaleString('es-MX')} MXN
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={cerrarCart}
              className="w-full py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700 text-sm text-center"
            >
              Seguir Comprando
            </button>
            <Link
              href="/checkout"
              onClick={cerrarCart}
              className="w-full py-3 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 text-sm text-center flex items-center justify-center"
            >
              Ir a Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}