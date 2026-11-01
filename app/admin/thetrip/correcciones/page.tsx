"use client";

import { useEffect, useMemo, useState } from "react";

type FotoBlunt = {
  sku: string;
  nombre: string;
  foto_actual: string;
  problema: string;
  foto_sugerida?: string;
};

type Precio3x = {
  sku: string;
  nombre: string;
  costo: number;
  precio_actual: number;
  precio_sugerido: number;
};

type Correcciones = {
  fotos_blunts: FotoBlunt[];
  precios_3x: Precio3x[];
};

const VACIO: Correcciones = { fotos_blunts: [], precios_3x: [] };

function pesos(valor: number) {
  return valor.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export default function CorreccionesTheTrip() {
  const [datos, setDatos] = useState<Correcciones>(VACIO);
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  async function cargar(reauditar = false) {
    setAviso("");
    const respuesta = await fetch(reauditar ? "/api/admin/correcciones?reauditar=1" : "/api/admin/correcciones", {
      cache: "no-store",
    });
    const cuerpo = await respuesta.json();
    if (!respuesta.ok) {
      setAviso(cuerpo.error || "No se pudo leer la auditoría.");
      return;
    }
    setDatos({
      fotos_blunts: Array.isArray(cuerpo.fotos_blunts) ? cuerpo.fotos_blunts : [],
      precios_3x: Array.isArray(cuerpo.precios_3x) ? cuerpo.precios_3x : [],
    });
  }

  useEffect(() => {
    cargar().catch(() => setAviso("No se pudo leer la auditoría."));
  }, []);

  async function aprobar(accion: "foto" | "precio" | "precios", sku = "") {
    const marca = sku || accion;
    setOcupado(marca);
    setAviso("");
    const respuesta = await fetch("/api/admin/correcciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion, sku }),
    });
    const cuerpo = await respuesta.json();
    setOcupado("");
    if (!respuesta.ok) {
      setAviso(cuerpo.error || "No se pudo aprobar.");
      return;
    }
    setDatos({
      fotos_blunts: Array.isArray(cuerpo.fotos_blunts) ? cuerpo.fotos_blunts : [],
      precios_3x: Array.isArray(cuerpo.precios_3x) ? cuerpo.precios_3x : [],
    });
  }

  const consulta = busqueda.trim().toLowerCase();
  const fotos = useMemo(
    () => datos.fotos_blunts.filter((item) => !consulta || `${item.sku} ${item.nombre}`.toLowerCase().includes(consulta)),
    [datos.fotos_blunts, consulta]
  );
  const precios = useMemo(
    () => datos.precios_3x.filter((item) => !consulta || `${item.sku} ${item.nombre}`.toLowerCase().includes(consulta)),
    [datos.precios_3x, consulta]
  );

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">The Trip</p>
            <h1 className="text-3xl font-black">Correcciones de catálogo</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Blunt Wraps sin .webp de fondo transparente y parafernalia, cristalería o accesorios por debajo del margen 3x. El precio y la foto solo cambian al aprobar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => cargar(true).catch(() => setAviso("No se pudo reauditar."))}
            className="min-h-12 rounded-xl border border-zinc-700 px-4 text-sm font-bold"
          >
            Reauditar
          </button>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <p className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">
            Fotos pendientes: <strong>{datos.fotos_blunts.length}</strong>
          </p>
          <p className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">
            Precios 3x pendientes: <strong>{datos.precios_3x.length}</strong>
          </p>
        </div>

        <input
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Filtra por SKU o nombre"
          className="min-h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm"
        />
        {aviso ? <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{aviso}</p> : null}

        <section className="space-y-3">
          <h2 className="text-xl font-black">Blunt Wraps sin foto transparente</h2>
          {fotos.length === 0 ? <p className="text-sm text-zinc-500">No hay fotos pendientes en este filtro.</p> : null}
          <div className="space-y-2">
            {fotos.map((item) => (
              <article key={item.sku} className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-mono text-xs text-zinc-500">{item.sku}</p>
                  <h3 className="font-bold">{item.nombre}</h3>
                  <p className="text-sm text-amber-200">{item.problema}</p>
                  <p className="text-xs text-zinc-500">Actual: {item.foto_actual || "sin archivo"} · Sugerida: {item.foto_sugerida}</p>
                </div>
                <button
                  type="button"
                  disabled={ocupado === item.sku}
                  onClick={() => aprobar("foto", item.sku)}
                  className="min-h-12 rounded-xl bg-amber-500 px-4 text-sm font-black text-zinc-950 disabled:opacity-60"
                >
                  {ocupado === item.sku ? "Aprobando…" : "Aprobar foto"}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">Parafernalia y cristalería bajo la regla 3x</h2>
            <button
              type="button"
              disabled={ocupado === "precios" || datos.precios_3x.length === 0}
              onClick={() => aprobar("precios")}
              className="min-h-12 rounded-xl bg-emerald-500 px-4 text-sm font-black text-zinc-950 disabled:opacity-60"
            >
              {ocupado === "precios" ? "Aprobando…" : "Aprobar todos los precios"}
            </button>
          </div>
          {precios.length === 0 ? <p className="text-sm text-zinc-500">No hay precios pendientes en este filtro.</p> : null}
          <div className="space-y-2">
            {precios.map((item) => (
              <article key={item.sku} className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-mono text-xs text-zinc-500">{item.sku}</p>
                  <h3 className="font-bold">{item.nombre}</h3>
                  <p className="text-sm text-zinc-300">
                    Costo {pesos(item.costo)} · Actual {pesos(item.precio_actual)} · Sugerido {pesos(item.precio_sugerido)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={ocupado === item.sku}
                  onClick={() => aprobar("precio", item.sku)}
                  className="min-h-12 rounded-xl bg-emerald-500 px-4 text-sm font-black text-zinc-950 disabled:opacity-60"
                >
                  {ocupado === item.sku ? "Aprobando…" : "Aprobar precio"}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
