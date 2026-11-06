"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { posApiUrl } from "@/lib/apiBase";

type ActivoContrato = { id: string; numero_serie: string; nombre: string; dias: number };
type Garantia = { metodo: string; estado: string; monto: number };
type Contrato = {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  fecha_retorno_programada: string;
  estado: string;
  activos: ActivoContrato[];
  garantia?: Garantia;
  inspecciones_checkout_fotos?: string[];
};

type Activo = { id: string; estado: string };

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

async function compressToWebp(file: File): Promise<File> {
  const imgUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const tag = new Image();
      tag.onload = () => resolve(tag);
      tag.onerror = reject;
      tag.src = imgUrl;
    });
    const maxW = 1200;
    const scale = img.width > maxW ? maxW / img.width : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.8));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}

function numeroWhatsApp(raw: string): string {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("52") ? digits : `52${digits}`;
}

export default function AdminRentasPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState<Contrato | null>(null);
  const [fotosCheckin, setFotosCheckin] = useState<File[]>([]);
  const [firmadoPor, setFirmadoPor] = useState("Mostrador");
  const [observaciones, setObservaciones] = useState("");
  const [resolucion, setResolucion] = useState<"SIN_DANO" | "CON_DANO">("SIN_DANO");
  const [penalizacion, setPenalizacion] = useState("0");

  const contratosActivos = useMemo(() => contratos.filter((c) => c.estado === "ACTIVO"), [contratos]);

  const kpis = useMemo(() => {
    const enRenta = activos.filter((a) => a.estado === "EN_RENTA").length;
    const disponibles = activos.filter((a) => a.estado === "DISPONIBLE").length;
    let mp = 0;
    let caja = 0;
    for (const contrato of contratosActivos) {
      const garantia = contrato.garantia;
      if (!garantia || garantia.estado !== "RETENIDO") continue;
      if (garantia.metodo === "TARJETA_PREAUTORIZACION") mp += Number(garantia.monto || 0);
      if (garantia.metodo === "EFECTIVO_MOSTRADOR") caja += Number(garantia.monto || 0);
    }
    const now = new Date();
    let vencenHoy = 0;
    let vencidos = 0;
    for (const contrato of contratosActivos) {
      const retorno = new Date(contrato.fecha_retorno_programada);
      if (retorno.toDateString() === now.toDateString()) vencenHoy += 1;
      if (retorno < now) vencidos += 1;
    }
    return { enRenta, disponibles, mp, caja, vencenHoy, vencidos };
  }, [activos, contratosActivos]);

  async function cargar() {
    setLoading(true);
    setError("");
    try {
      const [activosRes, contratosRes] = await Promise.all([fetch(posApiUrl("/api/v1/renta/activos")), fetch(posApiUrl("/api/v1/renta/contratos"))]);
      const activosData = (await activosRes.json()) as { items?: Activo[]; detail?: string };
      const contratosData = (await contratosRes.json()) as { items?: Contrato[]; detail?: string };
      if (!activosRes.ok) throw new Error(activosData.detail || "No se pudieron cargar activos.");
      if (!contratosRes.ok) throw new Error(contratosData.detail || "No se pudieron cargar contratos.");
      setActivos(Array.isArray(activosData.items) ? activosData.items : []);
      setContratos(Array.isArray(contratosData.items) ? contratosData.items : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de carga.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  async function manejarFotos(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const compactadas = await Promise.all(files.map((f) => compressToWebp(f)));
    setFotosCheckin(compactadas);
  }

  function abrirModal(contrato: Contrato) {
    setContratoSeleccionado(contrato);
    setFotosCheckin([]);
    setFirmadoPor("Mostrador");
    setObservaciones("");
    setResolucion("SIN_DANO");
    setPenalizacion("0");
    setModalOpen(true);
  }

  async function procesarCheckin() {
    if (!contratoSeleccionado) return;
    if (!fotosCheckin.length) {
      setError("Carga al menos una foto de check-in.");
      return;
    }
    setError("");
    setMsg("");
    try {
      const urls: string[] = [];
      for (let i = 0; i < fotosCheckin.length; i += 1) {
        const foto = fotosCheckin[i];
        for (const activo of contratoSeleccionado.activos) {
          const form = new FormData();
          form.set("contrato_id", contratoSeleccionado.id);
          form.set("tipo", "checkin");
          form.set("numero_serie", activo.numero_serie);
          form.set("indice", String(i + 1));
          form.set("archivo", foto);
          const upRes = await fetch(posApiUrl("/api/v1/renta/uploads"), { method: "POST", body: form });
          const upData = (await upRes.json()) as { url?: string; detail?: string };
          if (!upRes.ok || !upData.url) throw new Error(upData.detail || "No se pudo subir evidencia de check-in.");
          urls.push(upData.url);
          const inspRes = await fetch(posApiUrl("/api/v1/renta/inspecciones"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contrato_id: contratoSeleccionado.id,
              activo_id: activo.id,
              tipo: "CHECK_IN",
              fotos_urls: [upData.url],
              observaciones: observaciones || (resolucion === "CON_DANO" ? `Penalización aplicada: ${penalizacion}` : ""),
              firmado_por: firmadoPor,
            }),
          });
          if (!inspRes.ok) {
            const inspData = (await inspRes.json()) as { detail?: string };
            throw new Error(inspData.detail || "No se pudo registrar inspección.");
          }
        }
      }
      const accion = resolucion === "SIN_DANO" ? "LIBERAR" : "COBRAR_DANO";
      const estadoFinal = resolucion === "SIN_DANO" ? "CONCLUIDO" : "RECLAMADO_POR_DANO";
      const checkinRes = await fetch(posApiUrl(`/api/v1/renta/contratos/${contratoSeleccionado.id}/checkin`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firmado_por: firmadoPor,
          observaciones: resolucion === "CON_DANO" ? `Penalización: ${penalizacion}. ${observaciones}`.trim() : observaciones,
          estado_final: estadoFinal,
          accion_garantia: accion,
        }),
      });
      const checkinData = (await checkinRes.json()) as { detail?: string };
      if (!checkinRes.ok) throw new Error(checkinData.detail || "No se pudo cerrar el contrato.");
      setMsg(`Retorno procesado (${urls.length} evidencias).`);
      setModalOpen(false);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo procesar retorno.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 text-zinc-100">
      <h1 className="text-2xl font-bold">Tablero Operativo de Rentas</h1>
      {(error || msg) && <div className={`rounded-lg border p-3 text-sm ${error ? "border-red-600 bg-red-950/40" : "border-emerald-600 bg-emerald-950/40"}`}>{error || msg}</div>}
      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs uppercase text-zinc-400">Activos en calle</p>
          <p className="mt-2 text-2xl font-semibold">
            {kpis.enRenta} / {kpis.disponibles}
          </p>
        </article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs uppercase text-zinc-400">Garantías retenidas</p>
          <p className="mt-2 text-lg font-semibold">{money.format(kpis.mp + kpis.caja)}</p>
          <p className="text-xs text-zinc-400">MP: {money.format(kpis.mp)} · Caja: {money.format(kpis.caja)}</p>
        </article>
        <article className={`rounded-xl border p-4 ${kpis.vencidos > 0 ? "border-red-700 bg-red-950/40" : "border-amber-700 bg-amber-950/30"}`}>
          <p className="text-xs uppercase text-zinc-300">Retornos</p>
          <p className="mt-2 text-lg font-semibold">Vencen hoy: {kpis.vencenHoy}</p>
          <p className="text-sm">Vencidos: {kpis.vencidos}</p>
        </article>
      </section>
      <section className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-800/80 text-left text-xs uppercase text-zinc-300">
            <tr>
              <th className="px-3 py-2">Folio</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Equipos</th>
              <th className="px-3 py-2">Retorno programado</th>
              <th className="px-3 py-2">Garantía</th>
              <th className="px-3 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {contratosActivos.map((contrato) => (
              <tr key={contrato.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 font-mono text-xs">{contrato.id}</td>
                <td className="px-3 py-2">
                  <div>{contrato.cliente_nombre}</div>
                  <a className="text-cyan-400 hover:underline" href={`/checkout${numeroWhatsApp(contrato.cliente_telefono)}`} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </td>
                <td className="px-3 py-2">{contrato.activos.map((a) => a.numero_serie).join(", ")}</td>
                <td className="px-3 py-2">{new Date(contrato.fecha_retorno_programada).toLocaleString("es-MX")}</td>
                <td className="px-3 py-2">
                  {contrato.garantia ? (
                    <div>
                      <div>{money.format(contrato.garantia.monto)}</div>
                      <div className="text-xs text-zinc-400">{contrato.garantia.estado}</div>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-3 py-2">
                  <button className="rounded-md bg-cyan-600 px-3 py-1 text-xs font-semibold hover:bg-cyan-500" onClick={() => abrirModal(contrato)}>
                    Procesar Retorno (Check-in)
                  </button>
                </td>
              </tr>
            ))}
            {!contratosActivos.length && !loading && (
              <tr>
                <td colSpan={6} className="px-3 py-5 text-center text-zinc-400">
                  No hay contratos activos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {modalOpen && contratoSeleccionado && (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl border border-zinc-700 bg-zinc-950 p-4">
            <h2 className="text-lg font-semibold">Check-in · {contratoSeleccionado.id}</h2>
            <p className="mb-4 text-xs text-zinc-400">Compara evidencias de salida y carga la inspección de retorno.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold">Fotos check-out</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(contratoSeleccionado.inspecciones_checkout_fotos || []).slice(0, 8).map((src, idx) => (
                    <img key={`${src}-${idx}`} src={src} alt={`checkout-${idx}`} className="h-28 w-full rounded border border-zinc-800 object-cover" />
                  ))}
                  {!contratoSeleccionado.inspecciones_checkout_fotos?.length && <p className="text-xs text-zinc-500">Sin evidencias previas.</p>}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Dropzone check-in</h3>
                <label className="block rounded-lg border border-dashed border-zinc-600 p-4 text-center text-sm text-zinc-300">
                  Cargar fotos WebP
                  <input type="file" accept="image/*" multiple className="mt-2 block w-full text-xs" onChange={manejarFotos} />
                </label>
                {!!fotosCheckin.length && <p className="text-xs text-zinc-400">{fotosCheckin.length} evidencia(s) lista(s).</p>}
                <div>
                  <label className="mb-1 block text-xs uppercase text-zinc-400">Resolución</label>
                  <select className="w-full rounded border border-zinc-700 bg-zinc-900 p-2 text-sm" value={resolucion} onChange={(e) => setResolucion(e.target.value as "SIN_DANO" | "CON_DANO")}>
                    <option value="SIN_DANO">Sin daño (liberar garantía)</option>
                    <option value="CON_DANO">Con daño (cobrar garantía)</option>
                  </select>
                </div>
                {resolucion === "CON_DANO" && (
                  <div>
                    <label className="mb-1 block text-xs uppercase text-zinc-400">Penalización (MXN)</label>
                    <input className="w-full rounded border border-zinc-700 bg-zinc-900 p-2 text-sm" value={penalizacion} onChange={(e) => setPenalizacion(e.target.value)} />
                  </div>
                )}
                <input className="w-full rounded border border-zinc-700 bg-zinc-900 p-2 text-sm" placeholder="Firmado por" value={firmadoPor} onChange={(e) => setFirmadoPor(e.target.value)} />
                <textarea className="h-20 w-full rounded border border-zinc-700 bg-zinc-900 p-2 text-sm" placeholder="Observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded border border-zinc-700 px-4 py-2 text-sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500" onClick={() => void procesarCheckin()}>
                Confirmar retorno
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

