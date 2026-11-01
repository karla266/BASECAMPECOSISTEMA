"use client";

import { FormEvent, useEffect, useState } from "react";

type Producto = {
  sku: string;
  nombre: string;
  costo: number;
  precio_venta: number;
  precio_ecommerce?: number;
  precio_mercadolibre?: number;
  stock: number;
  imagen_url: string;
  mercadolibre_url: string;
  fase_comercial: string;
  categoria: string;
};

type Sugerencia = {
  precio_preventa?: number;
  precio_en_stock?: number;
  precio_ecommerce?: number;
  precio_mercadolibre?: number;
  titulo_ml?: string;
  titulo_seo?: string;
  copy_preventa?: string;
};

const HEADERS = { "Content-Type": "application/json", "X-Tenant-ID": "basecamp_420" };

const VACIO: Producto = {
  sku: "",
  nombre: "",
  costo: 0,
  precio_venta: 0,
  stock: 0,
  imagen_url: "",
  mercadolibre_url: "",
  fase_comercial: "PREVENTA",
  categoria: "Otros Productos",
};

export default function CatalogoOtrosProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<Producto>(VACIO);
  const [skuOriginal, setSkuOriginal] = useState("");
  const [copiloto, setCopiloto] = useState(false);
  const [sugerencia, setSugerencia] = useState<Sugerencia | null>(null);
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function cargar() {
    const respuesta = await fetch("/api/v1/products", { headers: HEADERS, cache: "no-store" });
    const cuerpo = await respuesta.json();
    if (!respuesta.ok) {
      setAviso(cuerpo.detail || "No se pudo leer el catálogo.");
      return;
    }
    setProductos(cuerpo.productos || []);
  }

  useEffect(() => {
    cargar().catch(() => setAviso("No se pudo leer el catálogo."));
  }, []);

  function elegir(producto: Producto) {
    setForm(producto);
    setSkuOriginal(producto.sku);
    setSugerencia(null);
  }

  async function guardar(evento: FormEvent) {
    evento.preventDefault();
    if (!skuOriginal) return;
    setOcupado(true);
    setAviso("");
    const respuesta = await fetch(`/api/v1/products/${encodeURIComponent(skuOriginal)}`, {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify({
        sku: form.sku,
        nombre: form.nombre,
        costo: Number(form.costo),
        precio_venta: Number(form.precio_venta),
        stock: Number(form.stock),
        imagen_url: form.imagen_url,
        mercadolibre_url: form.mercadolibre_url,
      }),
    });
    const cuerpo = await respuesta.json();
    setOcupado(false);
    if (!respuesta.ok) {
      setAviso(cuerpo.detail || "No se guardó la ficha.");
      return;
    }
    setAviso("Ficha guardada. Tiara y carpetas protegidas no se modifican desde este panel.");
    setSkuOriginal(cuerpo.sku || form.sku);
    await cargar();
  }

  async function cambiarFase(fase: "PREVENTA" | "EN_STOCK") {
    setOcupado(true);
    setAviso("");
    const respuesta = await fetch("/api/v1/products/cambiar-fase", {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify({ fase }),
    });
    const cuerpo = await respuesta.json();
    setOcupado(false);
    if (!respuesta.ok) {
      setAviso(cuerpo.detail || "No se cambió la fase.");
      return;
    }
    const tocados = Array.isArray(cuerpo.actualizados) ? cuerpo.actualizados.length : 0;
    const fuera = Array.isArray(cuerpo.omitidos) ? cuerpo.omitidos.length : 0;
    const sicar = cuerpo.sicar?.motivo === "inalcanzable" ? " SICAR no estaba disponible; el catálogo local sí se actualizó." : "";
    setAviso(`Fase ${cuerpo.fase}: ${tocados} precios en alcance. ${fuera} artículos omitidos (Tiara, carpeta protegida o sin costo).${sicar}`);
    await cargar();
  }

  async function scrapear() {
    setOcupado(true);
    setAviso("Buscando fotos oficiales de Blunt Wrap…");
    const respuesta = await fetch("/api/v1/scraper/bluntwrap", { method: "POST", headers: HEADERS });
    const cuerpo = await respuesta.json();
    setOcupado(false);
    if (!respuesta.ok) {
      setAviso(cuerpo.detail || "El scraping no pudo completarse.");
      return;
    }
    const fotos = Array.isArray(cuerpo.actualizados) ? cuerpo.actualizados.length : 0;
    setAviso(`Fotos actualizadas por SKU exacto: ${fotos}. Los precios no se tocaron.`);
  }

  async function pedirSugerencia(producto: Producto) {
    if (!copiloto || !producto.sku) {
      setSugerencia(null);
      return;
    }
    const respuesta = await fetch("/api/v1/products/ai-optimize", {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        sku: producto.sku,
        nombre: producto.nombre,
        costo: Number(producto.costo),
        fase: producto.fase_comercial || "PREVENTA",
      }),
    });
    const cuerpo = await respuesta.json();
    if (!respuesta.ok) {
      setSugerencia(null);
      setAviso(cuerpo.detail || "El copiloto no sugiere precios fuera de Otros Productos.");
      return;
    }
    setSugerencia(cuerpo);
  }

  return (
    <div className="space-y-6 text-slate-100">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Otros Productos y Otros Smoke Shop</p>
          <h1 className="mt-2 text-3xl font-black text-white">Catálogo de preventa</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Preventa a 2x el costo. Al llegar, 3x. E-commerce lleva 10% y Mercado Libre 25% sobre el mostrador. Tiara, blunts, conos, cristalería, bongs, pipas, sedas y outdoor no entran.
          </p>
        </div>
        <button type="button" onClick={scrapear} disabled={ocupado} className="min-h-12 rounded-xl bg-slate-800 px-4 text-sm font-bold text-white disabled:opacity-50">
          🔄 Scraping Fotos Blunt Wrap
        </button>
      </header>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => cambiarFase("PREVENTA")} disabled={ocupado} className="min-h-12 rounded-xl bg-amber-500 px-4 text-sm font-bold text-zinc-950 disabled:opacity-50">
          ⏳ ACTIVAR PREVENTA (2x)
        </button>
        <button type="button" onClick={() => cambiarFase("EN_STOCK")} disabled={ocupado} className="min-h-12 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-zinc-950 disabled:opacity-50">
          📦 ACTIVAR LLEGADA (3x)
        </button>
        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-700 px-4 text-sm font-semibold">
          <input
            type="checkbox"
            checked={copiloto}
            onChange={(evento) => {
              setCopiloto(evento.target.checked);
              if (evento.target.checked) pedirSugerencia(form);
              else setSugerencia(null);
            }}
          />
          Copiloto IA
        </label>
      </div>

      {aviso ? <p className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-amber-200">{aviso}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Nombre</th>
                <th className="px-3 py-3">Costo</th>
                <th className="px-3 py-3">Venta</th>
                <th className="px-3 py-3">E-commerce</th>
                <th className="px-3 py-3">ML</th>
                <th className="px-3 py-3">Fase</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.sku} onClick={() => elegir(producto)} className="cursor-pointer border-t border-slate-800 hover:bg-slate-900">
                  <td className="px-3 py-3 font-mono text-xs">{producto.sku}</td>
                  <td className="px-3 py-3">{producto.nombre}</td>
                  <td className="px-3 py-3">${Number(producto.costo).toFixed(2)}</td>
                  <td className="px-3 py-3">${Number(producto.precio_venta).toFixed(2)}</td>
                  <td className="px-3 py-3">${Number(producto.precio_ecommerce || 0).toFixed(2)}</td>
                  <td className="px-3 py-3">${Number(producto.precio_mercadolibre || 0).toFixed(2)}</td>
                  <td className="px-3 py-3">{producto.fase_comercial || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={guardar} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-lg font-black text-white">Ficha</h2>
          {(["sku", "nombre", "costo", "precio_venta", "stock", "imagen_url", "mercadolibre_url"] as const).map((campo) => (
            <label key={campo} className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
              {etiqueta(campo)}
              <input
                value={String(form[campo] ?? "")}
                onChange={(evento) => setForm((prev) => ({ ...prev, [campo]: evento.target.value }))}
                className="mt-1 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm font-medium normal-case text-white"
              />
            </label>
          ))}
          <button type="submit" disabled={ocupado || !skuOriginal} className="min-h-12 w-full rounded-xl bg-white text-sm font-bold text-slate-950 disabled:opacity-40">
            Guardar ficha
          </button>
          {copiloto && sugerencia ? (
            <div className="space-y-2 rounded-xl border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-100">
              <p>Mostrador preventa ${Number(sugerencia.precio_preventa).toFixed(2)} · llegada ${Number(sugerencia.precio_en_stock).toFixed(2)}</p>
              <p>E-commerce ${Number(sugerencia.precio_ecommerce).toFixed(2)}</p>
              <p>Mercado Libre ${Number(sugerencia.precio_mercadolibre).toFixed(2)}</p>
              <p>{sugerencia.titulo_ml}</p>
              <p>{sugerencia.titulo_seo}</p>
              <p>{sugerencia.copy_preventa}</p>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

function etiqueta(campo: string): string {
  const nombres: Record<string, string> = {
    sku: "SKU",
    nombre: "Nombre",
    costo: "Costo",
    precio_venta: "Precio Venta",
    stock: "Stock",
    imagen_url: "Imagen",
    mercadolibre_url: "URL Publicación Mercado Libre (Preventa)",
  };
  return nombres[campo] || campo;
}
