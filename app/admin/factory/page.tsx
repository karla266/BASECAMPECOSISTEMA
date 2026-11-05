"use client";

import { useEffect, useMemo, useState } from "react";
import { posApiUrl } from "@/lib/apiBase";

type DistribuidorInfo = {
  id: string;
  nombre: string;
  categorias: string[];
};

type ViableItem = {
  sku_distribuidor: string;
  nombre: string;
  categoria: string;
  costo_mayoreo: number;
  precio_venta_cents: number;
  margen_bruto_pct: number;
  especificaciones: Record<string, unknown>;
  normalizado: {
    codigo_barras: string;
    clave_articulo: string;
    nombre: string;
    precio_costo: number;
    stock_minimo: number;
    imagenes: string[];
    especificaciones: string;
  };
};

type DescItem = {
  sku_distribuidor: string;
  nombre: string;
  categoria: string;
  costo_mayoreo: number;
  especificaciones: Record<string, unknown>;
  imagen_url: string;
  motivo: string;
};

type CrawlResponse = {
  ok: boolean;
  distribuidor_id: string;
  categoria: string | null;
  extraidos: number;
  viables: number;
  descartados: number;
  items_viables: ViableItem[];
  items_descartados: DescItem[];
};

type ConversionResult = {
  ok: boolean;
  producto_crudo: Record<string, unknown>;
  producto_normalizado: {
    codigo_barras: string;
    clave_articulo: string;
    nombre: string;
    precio_costo: number;
    precio_venta: number;
    precio_venta_cents: number;
    margen_bruto_pct: number;
    imagenes: string[];
    especificaciones: string;
  };
  ficha_catalogo_borrador: {
    titulo: string;
    bullets: string[];
    descripcion_corta: string;
    fotos_webp_requeridas: string[];
  };
};

type ToastState = { type: "ok" | "error"; text: string } | null;
type FilterTab = "all" | "viable" | "discarded";

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

function isPedimentoRequired(specs: Record<string, unknown> | undefined): boolean {
  return Boolean(specs && specs.requiere_pedimento === true);
}

export default function AdminFactoryPage() {
  const [distribuidores, setDistribuidores] = useState<DistribuidorInfo[]>([]);
  const [selectedDist, setSelectedDist] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [limite, setLimite] = useState(20);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [result, setResult] = useState<CrawlResponse | null>(null);
  const [tab, setTab] = useState<FilterTab>("all");
  const [sessionInjected, setSessionInjected] = useState(0);
  const [selectedItem, setSelectedItem] = useState<ViableItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [loadingConversion, setLoadingConversion] = useState(false);
  const [injecting, setInjecting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(posApiUrl("/api/v1/factory/distribuidores"));
        const data = (await res.json()) as { ok?: boolean; distribuidores?: DistribuidorInfo[]; detail?: string };
        if (!res.ok || !data.ok) throw new Error(data.detail || "No se pudieron cargar distribuidores.");
        const items = Array.isArray(data.distribuidores) ? data.distribuidores : [];
        if (mounted) {
          setDistribuidores(items);
          setSelectedDist(items[0]?.id || "");
        }
      } catch (e) {
        if (mounted) setToast({ type: "error", text: e instanceof Error ? e.message : "Error cargando distribuidores." });
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const selectedDistMeta = useMemo(
    () => distribuidores.find((d) => d.id === selectedDist) || null,
    [distribuidores, selectedDist],
  );
  const categories = useMemo(() => selectedDistMeta?.categorias || [], [selectedDistMeta]);

  const viabilityRate = useMemo(() => {
    if (!result || result.extraidos <= 0) return 0;
    return Math.round((result.viables / result.extraidos) * 100);
  }, [result]);

  const rows = useMemo(() => {
    const all = [
      ...(result?.items_viables.map((x) => ({ kind: "viable" as const, item: x })) || []),
      ...(result?.items_descartados.map((x) => ({ kind: "discarded" as const, item: x })) || []),
    ];
    if (tab === "viable") return all.filter((x) => x.kind === "viable");
    if (tab === "discarded") return all.filter((x) => x.kind === "discarded");
    return all;
  }, [result, tab]);

  async function ejecutarRastreo() {
    if (!selectedDist) return;
    setLoading(true);
    setToast(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategoria) params.set("categoria", selectedCategoria);
      params.set("limite", String(limite));
      const res = await fetch(posApiUrl(`/api/v1/factory/crawl/${selectedDist}?${params.toString()}`), { method: "POST" });
      const data = (await res.json()) as CrawlResponse & { detail?: string };
      if (!res.ok || !data.ok) throw new Error(data.detail || "El crawler no respondió correctamente.");
      setResult(data);
      setToast({ type: "ok", text: `Rastreo completado: ${data.extraidos} prospectos, ${data.viables} viables.` });
    } catch (e) {
      setToast({ type: "error", text: e instanceof Error ? e.message : "No se pudo ejecutar el rastreo mayorista." });
    } finally {
      setLoading(false);
    }
  }

  async function abrirRevision(item: ViableItem) {
    setSelectedItem(item);
    setConversion(null);
    setDrawerOpen(true);
    setLoadingConversion(true);
    try {
      const body = {
        producto: {
          sku: item.sku_distribuidor,
          nombre: item.nombre,
          categoria: item.categoria,
          categoria_proveedor: String(item.especificaciones?.categoria_proveedor || item.categoria),
          costo_compra_cents: Math.round(item.costo_mayoreo * 100),
          imagen_url: item.normalizado?.imagenes?.[0] || "",
          especificaciones: item.especificaciones || {},
        },
      };
      const res = await fetch(posApiUrl("/api/v1/factory/convertir-producto"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as ConversionResult & { detail?: string };
      if (!res.ok || !data.ok) throw new Error(data.detail || "No se pudo convertir el prospecto.");
      setConversion(data);
    } catch (e) {
      setToast({ type: "error", text: e instanceof Error ? e.message : "Error de conversión." });
    } finally {
      setLoadingConversion(false);
    }
  }

  async function inyectarSeleccionado() {
    if (!selectedItem || !conversion || !selectedDistMeta) return;
    setInjecting(true);
    try {
      const body = {
        producto: {
          sku: selectedItem.sku_distribuidor,
          nombre: selectedItem.nombre,
          categoria: selectedItem.categoria,
          categoria_proveedor: String(selectedItem.especificaciones?.categoria_proveedor || selectedItem.categoria),
          costo_compra_cents: Math.round(selectedItem.costo_mayoreo * 100),
          imagen_url: selectedItem.normalizado?.imagenes?.[0] || "",
          especificaciones: selectedItem.especificaciones || {},
        },
        proveedor_nombre: selectedDistMeta.nombre,
        url_proveedor: "",
        en_stock: 1,
      };
      const res = await fetch(posApiUrl("/api/v1/factory/inyectar-producto"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; detail?: string };
      if (!res.ok || !data.ok) throw new Error(data.detail || "No se pudo inyectar el producto.");
      setSessionInjected((prev) => prev + 1);
      setToast({ type: "ok", text: "Producto inyectado al catálogo local (SICAR/Micro-POS)." });
      setDrawerOpen(false);
    } catch (e) {
      setToast({ type: "error", text: e instanceof Error ? e.message : "No se pudo inyectar el producto." });
    } finally {
      setInjecting(false);
    }
  }

  return (
    <main className="space-y-6">
      {toast && (
        <div className={`fixed right-5 top-24 z-50 rounded-lg border px-4 py-3 text-sm ${toast.type === "ok" ? "border-emerald-600 bg-emerald-900/90 text-emerald-100" : "border-red-600 bg-red-950/90 text-red-100"}`}>
          {toast.text}
        </div>
      )}

      <header>
        <h1 className="text-2xl font-bold text-white">Consola de Factoría IA</h1>
        <p className="text-sm text-slate-400">Scraping mayorista, auditoría de margen e inyección al catálogo local en 1 clic.</p>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <KpiCard title="Distribuidores Conectados" value={String(distribuidores.length)} subtitle="Adaptadores activos" />
        <KpiCard title="Total Extraídos" value={String(result?.extraidos ?? 0)} subtitle="Última corrida" />
        <KpiCard title="Productos Viables" value={`${result?.viables ?? 0} · ${viabilityRate}%`} subtitle="Margen bruto >= 50%" accent="emerald" />
        <KpiCard title="Descartados (< 50%)" value={String(result?.descartados ?? 0)} subtitle={`Inyectados sesión: ${sessionInjected}`} accent="red" />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-slate-100">Consola de Rastreo Mayorista</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs uppercase text-slate-400">Distribuidor</label>
            <select className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm" value={selectedDist} onChange={(e) => setSelectedDist(e.target.value)}>
              {distribuidores.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre} ({d.id})
                </option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-1">
              {(selectedDistMeta?.categorias || []).map((c) => (
                <span key={c} className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase text-slate-400">Categoría (opcional)</label>
            <select className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm" value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)}>
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase text-slate-400">Límite</label>
            <input type="number" min={1} max={500} value={limite} onChange={(e) => setLimite(Number(e.target.value || 20))} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={() => void ejecutarRastreo()} disabled={loading || !selectedDist} className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Ejecutando...
                </span>
              ) : (
                "Ejecutar Rastreo Mayorista"
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>
            Todos
          </TabButton>
          <TabButton active={tab === "viable"} onClick={() => setTab("viable")}>
            Solo Viables (Margen &gt;= 50%)
          </TabButton>
          <TabButton active={tab === "discarded"} onClick={() => setTab("discarded")}>
            Descartados (&lt; 50%)
          </TabButton>
        </div>

        <div className="space-y-2">
          {rows.map((row, idx) => {
            if (row.kind === "viable") {
              const item = row.item;
              const pedimento = isPedimentoRequired(item.especificaciones || {});
              const imageUrl = item.normalizado?.imagenes?.[0] || "";
              const costo = Number(item.costo_mayoreo || 0);
              const precio = Number(item.precio_venta_cents || 0) / 100;
              const margen = Number(item.margen_bruto_pct || 0);
              return (
                <article key={`${item.sku_distribuidor}-${idx}`} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="flex gap-3">
                    <div className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-slate-700 bg-slate-900">
                      {imageUrl ? <img src={imageUrl} alt={item.nombre} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
                      {imageUrl && <img src={imageUrl} alt={`${item.nombre}-preview`} className="pointer-events-none absolute left-16 top-0 hidden h-36 w-36 rounded border border-slate-700 bg-slate-950 object-cover group-hover:block" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-100">{item.nombre}</h3>
                        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300">{item.categoria}</span>
                        {pedimento && <span className="rounded-full border border-amber-700 bg-amber-900/30 px-2 py-0.5 text-[11px] text-amber-300">Pedimento Requerido (Pyrex)</span>}
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] ${margen >= 50 ? "border-emerald-700 bg-emerald-900/30 text-emerald-300" : "border-red-700 bg-red-900/30 text-red-300"}`}>Margen {margen.toFixed(1)}%</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">SKU distribuidor: {item.sku_distribuidor}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-300">
                        <span>Costo: {money.format(costo)}</span>
                        <span>Precio sugerido: {money.format(precio)}</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <button onClick={() => void abrirRevision(item)} className="rounded-md bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-600">
                        Revisar y Convertir
                      </button>
                    </div>
                  </div>
                </article>
              );
            }
            const item = row.item;
            const pedimento = isPedimentoRequired(item.especificaciones || {});
            const imageUrl = item.imagen_url || "";
            const costo = Number(item.costo_mayoreo || 0);
            return (
              <article key={`${item.sku_distribuidor}-${idx}`} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="flex gap-3">
                  <div className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-slate-700 bg-slate-900">
                    {imageUrl ? <img src={imageUrl} alt={item.nombre} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
                    {imageUrl && <img src={imageUrl} alt={`${item.nombre}-preview`} className="pointer-events-none absolute left-16 top-0 hidden h-36 w-36 rounded border border-slate-700 bg-slate-950 object-cover group-hover:block" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-100">{item.nombre}</h3>
                      <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300">{item.categoria}</span>
                      {pedimento && <span className="rounded-full border border-amber-700 bg-amber-900/30 px-2 py-0.5 text-[11px] text-amber-300">Pedimento Requerido (Pyrex)</span>}
                      <span className="rounded-full border border-red-700 bg-red-900/30 px-2 py-0.5 text-[11px] text-red-300">No viable</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">SKU distribuidor: {item.sku_distribuidor}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-300">
                      <span>Costo: {money.format(costo)}</span>
                      <span>Precio sugerido: -</span>
                      <span className="text-red-300">{item.motivo}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {!rows.length && <p className="py-8 text-center text-sm text-slate-500">Sin resultados. Ejecuta un rastreo para ver prospectos.</p>}
        </div>
      </section>

      {drawerOpen && (
        <aside className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div className="h-full w-full max-w-2xl overflow-auto border-l border-slate-700 bg-slate-950 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Revisión e Inyección</h2>
              <button className="rounded border border-slate-700 px-3 py-1 text-sm text-slate-300" onClick={() => setDrawerOpen(false)}>
                Cerrar
              </button>
            </div>
            {loadingConversion && <p className="text-sm text-slate-400">Generando ficha comercial...</p>}
            {!loadingConversion && conversion && (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <p className="text-xs uppercase text-slate-400">Título</p>
                  <p className="text-sm font-semibold text-slate-100">{conversion.ficha_catalogo_borrador.titulo}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Info label="Clave SICAR sugerida" value={conversion.producto_normalizado.clave_articulo} />
                  <Info label="Código de barras" value={conversion.producto_normalizado.codigo_barras} />
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <p className="mb-2 text-xs uppercase text-slate-400">Bullets comerciales</p>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-slate-200">
                    {conversion.ficha_catalogo_borrador.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <p className="mb-2 text-xs uppercase text-slate-400">Suite de 4 imágenes WebP</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    {conversion.ficha_catalogo_borrador.fotos_webp_requeridas.map((f) => (
                      <span key={f} className="rounded border border-slate-700 px-2 py-1">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => void inyectarSeleccionado()} disabled={injecting} className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {injecting ? "Inyectando..." : "Inyectar a Catálogo SICAR / Micro-POS"}
                </button>
              </div>
            )}
          </div>
        </aside>
      )}
    </main>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  accent = "slate",
}: {
  title: string;
  value: string;
  subtitle: string;
  accent?: "slate" | "emerald" | "red";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-300"
      : accent === "red"
        ? "text-red-300"
        : "text-white";
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${accentClass}`}>{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </article>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-3 py-1 text-xs ${active ? "border-emerald-600 bg-emerald-900/30 text-emerald-300" : "border-slate-700 text-slate-300"}`}>
      {children}
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}
