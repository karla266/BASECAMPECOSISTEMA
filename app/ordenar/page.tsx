"use client";

import { FormEvent, useState } from "react";
import NavegacionSitio from "@/components/sitio/NavegacionSitio";
import { PUNTOS_ENTREGA, leerMenu, pesosDesdeCentavos } from "@/lib/palapa-menu";

const MENU = leerMenu().filter((producto) => producto.disponible);
const ICONO: Record<string, string> = { bebidas: "🍺", comida: "🌮" };

export default function OrdenarPage() {
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [punto, setPunto] = useState("");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const lineas = MENU.flatMap((producto) => {
    const cantidad = cantidades[producto.id] || 0;
    return cantidad > 0 ? [{ ...producto, cantidad }] : [];
  });
  const totalCentavos = lineas.reduce((total, linea) => total + linea.precio * 100 * linea.cantidad, 0);

  function cambiar(id: string, delta: number) {
    setCantidades((actual) => {
      const siguiente = Math.max(0, Math.min(30, (actual[id] || 0) + delta));
      return { ...actual, [id]: siguiente };
    });
  }

  async function pagar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setError("");
    try {
      const respuesta = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "pedido_palapa",
          nombre,
          telefono,
          punto,
          notas,
          items: lineas.map((linea) => ({ id: linea.id, cantidad: linea.cantidad })),
        }),
      });
      const datos = (await respuesta.json()) as { error?: string; checkoutUrl?: string };
      if (!respuesta.ok || !datos.checkoutUrl) throw new Error(datos.error || "No se pudo abrir Mercado Pago.");
      window.location.href = datos.checkoutUrl;
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo abrir Mercado Pago.");
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 pb-36 pt-20 text-zinc-100">
      <NavegacionSitio />
      <div className="mx-auto max-w-3xl px-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Palapa Basecamp 420</p>
        <h1 className="mt-2 text-3xl font-black">Ordena antes de subir</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Micheladas, hot dogs y tacos para tenerlos listos al aterrizar o al llegar al recorrido. El cobro es con Mercado Pago.</p>
        <div className="mt-6 grid gap-4">
          {MENU.map((producto) => {
            const cantidad = cantidades[producto.id] || 0;
            return (
              <article key={producto.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl" aria-hidden>{producto.id.includes("hot") ? "🌭" : ICONO[producto.categoria] || "🍽️"}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-white">{producto.nombre}</h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">{producto.descripcion}</p>
                    <p className="mt-2 font-semibold text-emerald-300">${producto.precio} MXN</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-3">
                  <button type="button" aria-label={`Quitar ${producto.nombre}`} onClick={() => cambiar(producto.id, -1)} className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-zinc-700 text-xl">−</button>
                  <span className="w-8 text-center text-lg font-semibold">{cantidad}</span>
                  <button type="button" aria-label={`Sumar ${producto.nombre}`} onClick={() => cambiar(producto.id, 1)} className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-emerald-500 text-xl font-black text-zinc-950">+</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {totalCentavos > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Total ${pesosDesdeCentavos(totalCentavos)} MXN</p>
            <button type="button" onClick={() => setAbierto(true)} className="inline-flex min-h-12 items-center rounded-xl bg-emerald-500 px-4 text-sm font-black text-zinc-950">
              Revisar Pedido
            </button>
          </div>
        </div>
      ) : null}

      {abierto ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 sm:items-center sm:justify-center">
          <form onSubmit={(evento) => void pagar(evento)} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-zinc-900 p-5 sm:max-w-lg sm:rounded-3xl">
            <h2 className="text-2xl font-black text-white">Checkout</h2>
            <ul className="mt-3 text-sm text-zinc-300">
              {lineas.map((linea) => (
                <li key={linea.id}>{linea.cantidad} x {linea.nombre}</li>
              ))}
            </ul>
            <label className="mt-4 grid gap-2 text-sm">
              Nombre del cliente
              <input required minLength={3} value={nombre} onChange={(evento) => setNombre(evento.target.value)} className="min-h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4" />
            </label>
            <label className="mt-3 grid gap-2 text-sm">
              WhatsApp a 10 dígitos
              <input required inputMode="numeric" pattern="\d{10}" value={telefono} onChange={(evento) => setTelefono(evento.target.value.replace(/\D/g, "").slice(0, 10))} className="min-h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4" />
            </label>
            <fieldset className="mt-4 grid gap-2">
              <legend className="text-sm">Punto y momento de entrega</legend>
              {PUNTOS_ENTREGA.map((opcion) => (
                <label key={opcion.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-zinc-800 px-3 text-sm">
                  <input type="radio" name="punto" required checked={punto === opcion.id} onChange={() => setPunto(opcion.id)} />
                  {opcion.etiqueta}
                </label>
              ))}
            </fieldset>
            <label className="mt-4 grid gap-2 text-sm">
              Notas o especificaciones
              <textarea value={notas} onChange={(evento) => setNotas(evento.target.value)} maxLength={240} placeholder="Tacos sin cebolla, michelada sin picante" className="min-h-24 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3" />
            </label>
            {error ? <p className="mt-3 text-sm text-amber-300">{error}</p> : null}
            <button type="submit" disabled={enviando} className="mt-4 min-h-12 w-full rounded-xl bg-emerald-500 text-base font-black text-zinc-950 disabled:opacity-40">
              {enviando ? "Abriendo Mercado Pago..." : `Pagar $${pesosDesdeCentavos(totalCentavos)} MXN`}
            </button>
            <button type="button" onClick={() => setAbierto(false)} className="mt-3 min-h-12 w-full rounded-xl border border-zinc-700 text-sm">
              Seguir editando
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
