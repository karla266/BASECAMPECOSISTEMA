"use client";

import { useMemo, useState } from "react";
import inventario from "@/data/inventario_thetrip.json";
import BotonCompraProducto from "@/components/thetrip/BotonCompraProducto";

type Variante = (typeof inventario.productos)[number];
type Modo = "PIEZA" | "DISPLAY";

const GALERIA = [
  { src: "/thetrip/blunt-hero.jpg", alt: "Empaque premium de Blunt Wrap 2X en toma vertical", pie: "Portada" },
  { src: "/thetrip/blunt-lifestyle.jpg", alt: "Sobre de Blunt Wrap junto a grinder y cristalería", pie: "Lifestyle" },
  { src: "/thetrip/blunt-sabores.jpg", alt: "Abanico de sobres de colores con los 24 sabores", pie: "24 sabores" },
  { src: "/thetrip/blunt-mostrador.jpg", alt: "Caja display abierta en el mostrador de The Trip", pie: "Mostrador" },
];

function variantesDe(modo: Modo) {
  return inventario.productos.filter((item) => item.tipo === modo && Boolean(item.sabor));
}

export default function BluntWrapSelector() {
  const [modo, setModo] = useState<Modo>("PIEZA");
  const [sabor, setSabor] = useState(inventario.productos[0]?.sabor ?? "");
  const [cantidad, setCantidad] = useState(1);
  const [foto, setFoto] = useState(0);

  const lista = useMemo(() => variantesDe(modo), [modo]);
  const elegido = lista.find((item) => item.sabor === sabor) ?? lista[0];
  const stock = elegido?.stock_disponible ?? 0;

  function cambiarModo(siguiente: Modo) {
    setModo(siguiente);
    const disponible = variantesDe(siguiente).find((item) => item.sabor === sabor)?.stock_disponible ?? 1;
    setCantidad((actual) => Math.min(Math.max(actual, 1), Math.max(disponible, 1)));
  }

  function elegir(item: Variante) {
    if (!item.sabor) return;
    setSabor(item.sabor);
    setCantidad((actual) => Math.min(Math.max(actual, 1), Math.max(item.stock_disponible, 1)));
  }

  if (!elegido) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <article className="rounded-3xl border border-amber-500/40 bg-zinc-900 p-5 text-zinc-100">
        <p className="inline-flex min-h-12 items-center rounded-full bg-amber-500 px-4 text-sm font-bold text-zinc-950">
          🔥 Llega el Jueves — Aparta tu Sabor Favorito
        </p>
        <h2 className="mt-4 text-3xl font-black leading-tight text-white">
          Blunt Wrap 2X Double Platinum (Sobre Individual — 24 Sabores)
        </h2>
        <p className="mt-2 text-2xl font-black text-amber-300">$30.00 MXN</p>
        <p className="mt-1 text-sm text-zinc-300">
          {elegido.sabor} · {elegido.sku} · ${elegido.precio_mxn.toLocaleString("es-MX")} MXN · {stock} disponibles
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,16rem)_1fr] md:items-start">
          <img
            src={
              elegido.imagenes && elegido.imagenes.length > 0
                ? elegido.imagenes[0]
                : GALERIA[foto].src
            }
            alt={elegido.nombre || GALERIA[foto].alt}
            className="h-80 w-full rounded-2xl object-cover"
          />
          <div>
            <div className="grid grid-cols-4 gap-2">
              {GALERIA.map((toma, indice) => (
                <button
                  key={toma.src}
                  type="button"
                  onClick={() => setFoto(indice)}
                  className={
                    indice === foto
                      ? "min-h-12 overflow-hidden rounded-xl border-2 border-amber-400"
                      : "min-h-12 overflow-hidden rounded-xl border border-zinc-700"
                  }
                >
                  <img src={toma.src} alt="" className="h-16 w-full object-cover" />
                  <span className="block px-1 py-1 text-[10px] font-semibold text-zinc-300">{toma.pie}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-200">
              Eleva tu experiencia con el estándar de oro del enrolado. Cada sobre metálico sellado al vacío de Blunt Wrap 2X Double Platinum garantiza frescura absoluta, humedad perfecta y una flexibilidad que evita rasgaduras.
            </p>
            <p className="mt-3 text-sm font-semibold text-white">¿Qué incluye por $30 MXN?</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-300">
              <li>2 sábanas premium de combustión ultra lenta y uniforme.</li>
              <li>Corte dentado para un enrolado rápido.</li>
              <li>Extracción de sabor limpia que complementa, y no opaca, tus hierbas.</li>
            </ul>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Colección completa de 24 perfiles: clásicos frutales como Uva, Cereza y Moras, y mixología como Cognac, Cosmopolitan y Piña Colada.
            </p>
            <button
              type="button"
              onClick={() => cambiarModo("DISPLAY")}
              className="mt-3 min-h-12 text-left text-sm font-semibold text-amber-300"
            >
              Agrega 25 piezas del mismo sabor y llévate el display cerrado a $650 MXN.
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            aria-pressed={modo === "PIEZA"}
            onClick={() => cambiarModo("PIEZA")}
            className={
              modo === "PIEZA"
                ? "min-h-12 rounded-2xl bg-amber-500 px-4 text-sm font-bold text-zinc-950"
                : "min-h-12 rounded-2xl border border-zinc-700 px-4 text-sm font-semibold text-white"
            }
          >
            Por Pieza ($30 MXN)
          </button>
          <button
            type="button"
            aria-pressed={modo === "DISPLAY"}
            onClick={() => cambiarModo("DISPLAY")}
            className={
              modo === "DISPLAY"
                ? "min-h-12 rounded-2xl bg-amber-500 px-4 text-sm font-bold text-zinc-950"
                : "min-h-12 rounded-2xl border border-zinc-700 px-4 text-sm font-semibold text-white"
            }
          >
            Caja Completa 25 pzs ($650 MXN)
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4" role="listbox" aria-label="24 sabores">
          {lista.map((item) => {
            const activo = item.sabor === elegido.sabor;
            return (
              <button
                key={item.sku}
                type="button"
                role="option"
                aria-selected={activo}
                onClick={() => elegir(item)}
                className={
                  activo
                    ? "min-h-12 rounded-xl border border-amber-400 bg-amber-500/15 px-3 py-2 text-left text-sm font-semibold text-amber-200"
                    : "min-h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-sm text-zinc-200"
                }
              >
                <span className="block">{item.sabor}</span>
                <span className="block text-xs font-medium text-zinc-400">{item.stock_disponible} disponibles</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCantidad((actual) => Math.max(1, actual - 1))}
            className="min-h-12 min-w-12 rounded-xl border border-zinc-700 text-xl"
            aria-label="Restar uno"
          >
            −
          </button>
          <p className="min-w-16 text-center text-2xl font-black text-white">{cantidad}</p>
          <button
            type="button"
            onClick={() => setCantidad((actual) => Math.min(stock, actual + 1))}
            disabled={cantidad >= stock}
            className="min-h-12 min-w-12 rounded-xl border border-zinc-700 text-xl disabled:opacity-40"
            aria-label="Sumar uno"
          >
            +
          </button>
        </div>

        {stock > 0 ? (
          <BotonCompraProducto
            nombre={elegido.nombre}
            sku={elegido.sku}
            fase={elegido.disponibilidad}
            categoria={elegido.categoria}
            precio={elegido.precio_mxn}
            imagen_url={GALERIA[foto]?.src}
            cantidad={cantidad}
          />
        ) : (
          <p className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-zinc-800 px-4 text-center text-sm font-bold text-zinc-500">
            Sin piezas para apartar
          </p>
        )}
      </article>
    </section>
  );
}
