"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

function pesos(valor: number): string {
  return valor.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PaginaCheckout() {
  const { items, subtotal, hasPreorderItems, updateQuantity, removeItem } = useCart();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-black text-white">Checkout</h1>
        <p className="mt-2 text-sm text-zinc-400">El cobro se completa aquí, dentro de Basecamp 420.</p>
        {hasPreorderItems ? (
          <p className="mt-4 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-zinc-950">
            ⏳ PREVENTA • Aparta con precio especial (Envío diferido al arribar)
          </p>
        ) : null}
        <section className="mt-6 space-y-3">
          {items.map((item) => (
            <article key={item.sku} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="font-bold text-white">{item.nombre}</h2>
              <p className="text-sm text-zinc-400">
                {item.cantidad} × ${pesos(item.precio)} · {item.disponibilidad === "PREVENTA" ? "PREVENTA" : "EN_STOCK"}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button type="button" onClick={() => updateQuantity(item.sku, item.cantidad - 1)} className="min-h-12 min-w-12 rounded-xl border border-zinc-700" aria-label="Restar uno">
                  −
                </button>
                <span className="min-w-8 text-center font-black">{item.cantidad}</span>
                <button type="button" onClick={() => updateQuantity(item.sku, item.cantidad + 1)} className="min-h-12 min-w-12 rounded-xl border border-zinc-700" aria-label="Sumar uno">
                  +
                </button>
                <button type="button" onClick={() => removeItem(item.sku)} className="ml-auto min-h-12 rounded-xl px-3 text-sm font-bold text-red-300">
                  Quitar
                </button>
              </div>
            </article>
          ))}
          {items.length === 0 ? <p className="text-sm text-zinc-400">No hay líneas en el carrito.</p> : null}
        </section>
        <p className="mt-6 flex items-center justify-between text-sm font-bold">
          <span>Subtotal</span>
          <span>${pesos(subtotal)} MXN</span>
        </p>
        <Link href="/thetrip" className="mt-6 flex min-h-12 items-center justify-center rounded-2xl border border-zinc-700 text-sm font-bold text-white">
          Seguir en The Trip
        </Link>
      </div>
    </main>
  );
}
