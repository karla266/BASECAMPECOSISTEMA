"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

function pesos(valor: number): string {
  return valor.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PaginaCheckout() {
  const { items, subtotal, hasPreorderItems, updateQuantity, removeItem } = useCart();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function pagar() {
    if (!items.length || enviando) return;
    setEnviando(true);
    setAviso("");
    try {
      const respuesta = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          telefono,
          items: items.map((item) => ({
            sku: item.sku,
            title: item.nombre,
            quantity: item.cantidad,
            price: item.precio,
          })),
        }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { checkoutUrl?: string; error?: string } | null;
      if (!respuesta.ok || !cuerpo?.checkoutUrl) {
        setAviso(cuerpo?.error || "No se pudo abrir Mercado Pago.");
        setEnviando(false);
        return;
      }
      window.location.assign(cuerpo.checkoutUrl);
    } catch {
      setAviso("No se pudo abrir Mercado Pago.");
      setEnviando(false);
    }
  }

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
        <div className="mt-4 grid gap-3">
          <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} placeholder="Nombre" className="min-h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4" />
          <input value={telefono} onChange={(evento) => setTelefono(evento.target.value)} placeholder="Teléfono" inputMode="tel" className="min-h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4" />
        </div>
        {aviso ? <p className="mt-3 text-sm text-amber-200">{aviso}</p> : null}
        <button type="button" onClick={() => void pagar()} disabled={!items.length || enviando} className="mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl bg-amber-500 text-sm font-black text-zinc-950 disabled:opacity-40">
          {enviando ? "Abriendo Mercado Pago..." : "Pagar con Mercado Pago"}
        </button>
        <Link href="/thetrip" className="mt-3 flex min-h-12 items-center justify-center rounded-2xl border border-zinc-700 text-sm font-bold text-white">
          Seguir en The Trip
        </Link>
      </div>
    </main>
  );
}
