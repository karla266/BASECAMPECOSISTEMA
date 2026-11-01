"use client";

import { useMemo, useState } from "react";
import inventario from "@/data/inventario_thetrip.json";
import BotonCompraProducto from "@/components/thetrip/BotonCompraProducto";

const FALLBACK = "/assets/productos/watermarked_img_4565543973787279676.jpg";

type Producto = (typeof inventario.productos)[number];

function avisoLlegada(fecha: string | undefined) {
  if (fecha === "1 de Diciembre") return "🔥 Llega el 1 de Diciembre";
  if (fecha === "Jueves") return "🔥 Llega el Jueves — Aparta tu Sabor Favorito";
  return null;
}

function FotoProducto({ src, alt }: { src: string; alt: string }) {
  const [actual, setActual] = useState(src || FALLBACK);
  return (
    <img
      src={actual}
      alt={alt}
      className="h-40 w-full rounded-xl object-cover"
      onError={() => {
        if (actual !== FALLBACK) setActual(FALLBACK);
      }}
    />
  );
}

export default function CatalogoPreVenta() {
  const categorias = useMemo(() => {
    const presentes = inventario.productos.map((producto) => producto.categoria).filter(Boolean);
    return ["Todos", ...Array.from(new Set([...presentes, "Otros Productos"]))];
  }, []);
  const [categoria, setCategoria] = useState("Otros Productos");
  const lista = useMemo(
    () => inventario.productos.filter((producto) => categoria === "Todos" || producto.categoria === categoria),
    [categoria]
  );

  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-black text-white">Pre-venta The Trip</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Blunt Wrap llega el jueves. Los artículos de Tiara Express salen el 1 de diciembre.
      </p>
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Categorías">
        {categorias.map((nombre) => (
          <button
            key={nombre}
            type="button"
            role="tab"
            aria-selected={categoria === nombre}
            onClick={() => setCategoria(nombre)}
            className={
              categoria === nombre
                ? "min-h-12 rounded-xl bg-amber-500 px-4 text-sm font-bold text-zinc-950"
                : "min-h-12 rounded-xl border border-zinc-700 px-4 text-sm font-semibold text-white"
            }
          >
            {nombre}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((producto) => (
          <Tarjeta key={producto.sku} producto={producto} />
        ))}
      </div>
    </section>
  );
}

function Tarjeta({ producto }: { producto: Producto }) {
  const aviso = avisoLlegada(producto.fecha_llegada);
  const foto = producto.imagenes?.[0] || FALLBACK;
  const extra = producto as Producto & {
    fase_comercial?: string;
    mercadolibre_url?: string;
    link_cobro?: string;
    departamento?: string;
    tags?: string[];
    proveedor?: string;
  };
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3 text-zinc-100">
      <FotoProducto key={foto} src={foto} alt={producto.nombre} />
      {aviso ? (
        <p className="mt-3 inline-flex min-h-12 items-center rounded-full bg-amber-500 px-3 text-xs font-bold text-zinc-950">
          {aviso}
        </p>
      ) : null}
      <h3 className="mt-3 text-sm font-bold text-white">{producto.nombre}</h3>
      <p className="mt-1 text-sm text-amber-300">${producto.precio_mxn.toFixed(2)} MXN</p>
      <p className="text-xs text-zinc-400">{producto.stock_disponible} disponibles · {producto.disponibilidad}</p>
      <BotonCompraProducto
        nombre={producto.nombre}
        sku={producto.sku}
        fase={extra.fase_comercial || producto.disponibilidad}
        categoria={producto.categoria}
        departamento={extra.departamento}
        subcategoria={producto.subcategoria}
        proveedor={extra.proveedor}
        tags={extra.tags}
        precio={producto.precio_mxn}
        imagen_url={foto}
        className="mt-3"
      />
    </article>
  );
}
