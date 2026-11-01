"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

function pesos(valor: number): string {
  return valor.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PaginaCheckout() {
  const { items, subtotal, hasPreorderItems } = useCart();
  const preventa = items.filter((item) => item.disponibilidad === "PREVENTA");
  const stock = items.filter((item) => item.disponibilidad !== "PREVENTA");

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-black text-white">Checkout</h1>
        <p className="mt-2 text-sm text-zinc-400">Subtotal ${pesos(subtotal)} MXN</p>
        {hasPreorderItems ? (
          <p className="mt-4 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-zinc-950">
            Las líneas en pre-venta se pagan en Mercado Libre. El mostrador no cobra ese anticipo aquí.
          </p>
        ) : null}
        <section className="mt-6 space-y-3">
          {preventa.map((item) => (
            <article key={item.sku} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="font-bold text-white">{item.nombre}</h2>
              <p className="text-sm text-zinc-400">{item.cantidad} × ${pesos(item.precio)} · PREVENTA</p>
              <a
                href={item.mercadolibre_url || `https://www.mercadolibre.com.mx/pagina/thetripsmokeshop?sku=${encodeURIComponent(item.sku)}`}
                className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-[#ffe600] text-sm font-bold text-zinc-950"
              >
                Pagar en Mercado Libre
              </a>
            </article>
          ))}
          {stock.map((item) => (
            <article key={item.sku} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="font-bold text-white">{item.nombre}</h2>
              <p className="text-sm text-zinc-400">{item.cantidad} × ${pesos(item.precio)} · EN_STOCK</p>
            </article>
          ))}
          {items.length === 0 ? <p className="text-sm text-zinc-400">No hay líneas en el carrito.</p> : null}
        </section>
        {stock.length > 0 ? (
          <Link href="/thetrip#checkout" className="mt-6 flex min-h-12 items-center justify-center rounded-2xl bg-amber-500 text-sm font-black text-zinc-950">
            Continuar retiro en tienda
          </Link>
        ) : null}
      </div>
    </main>
  );
}
