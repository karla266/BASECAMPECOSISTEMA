"use client";

import { useCart } from "@/context/CartContext";

function pesos(valor: number): string {
  return valor.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CartDrawer() {
  const { items, abierto, closeCart, totalItems, subtotal, hasPreorderItems, updateQuantity, removeItem } = useCart();
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Cerrar carrito" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCart} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
        <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
          <h2 className="text-lg font-black text-white">Carrito ({totalItems})</h2>
          <button type="button" onClick={closeCart} className="min-h-12 min-w-12 rounded-xl border border-zinc-700 text-sm font-bold">
            Cerrar
          </button>
        </header>
        {hasPreorderItems ? (
          <p className="mx-4 mt-4 rounded-xl bg-amber-500 px-3 py-3 text-sm font-bold text-zinc-950">
            ⏳ Contiene artículos en Pre-venta. El despacho se programa al arribar a tienda
          </p>
        ) : null}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {items.length === 0 ? <p className="text-sm text-zinc-400">El carrito está vacío.</p> : null}
          {items.map((item) => (
            <article key={item.sku} className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
              <img src={item.imagen_url || "/assets/productos/watermarked_img_4565543973787279676.jpg"} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{item.nombre}</p>
                {item.disponibilidad === "PREVENTA" ? (
                  <p className="mt-1 text-xs font-bold text-amber-300">PREVENTA</p>
                ) : null}
                <p className="mt-1 text-sm text-amber-300">${pesos(item.precio)} MXN</p>
                <div className="mt-2 flex items-center gap-2">
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
              </div>
            </article>
          ))}
        </div>
        <footer className="space-y-3 border-t border-zinc-800 px-4 py-4">
          <p className="flex items-center justify-between text-sm font-bold">
            <span>Subtotal</span>
            <span>${pesos(subtotal)} MXN</span>
          </p>
          <a href="/checkout" className="flex min-h-12 items-center justify-center rounded-2xl bg-amber-500 text-sm font-black text-zinc-950">
            Proceder al Pago
          </a>
        </footer>
      </aside>
    </div>
  );
}
