"use client";

import { useRef, useState } from "react";
import type { ReservaVuelo } from "@/lib/vuelos";

const PUNTOS = [
  { clave: "arnes", texto: "Arnés copiloto inspeccionado" },
  { clave: "casco", texto: "Casco" },
  { clave: "radio", texto: "Radio en canal operativo" },
  { clave: "paracaidas", texto: "Paracaídas de emergencia verificado" },
] as const;

type Clave = (typeof PUNTOS)[number]["clave"];

export default function HojaRutaPiloto({
  reserva,
  onCerrar,
  onCambio,
}: {
  reserva: ReservaVuelo;
  onCerrar: () => void;
  onCambio: (reserva: ReservaVuelo) => void;
}) {
  const archivoRef = useRef<HTMLInputElement>(null);
  const [vista, setVista] = useState("");
  const [nombreFoto, setNombreFoto] = useState(reserva.fotoInspeccion || "");
  const [confirmada, setConfirmada] = useState(Boolean(reserva.fotoInspeccion));

  async function guardar(parcial: Partial<Pick<ReservaVuelo, "anticipo" | "checklist" | "fotoInspeccion">>) {
    const respuesta = await fetch("/api/vuelos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reserva.id, ...parcial }),
    });
    const datos = (await respuesta.json()) as { reserva?: ReservaVuelo; error?: string };
    if (respuesta.ok && datos.reserva) onCambio(datos.reserva);
  }

  function marcar(clave: Clave) {
    void guardar({ checklist: { ...reserva.checklist, [clave]: !reserva.checklist[clave] } });
  }

  function elegirFoto(archivo: File | undefined) {
    if (!archivo) return;
    if (vista) URL.revokeObjectURL(vista);
    setVista(URL.createObjectURL(archivo));
    setNombreFoto(archivo.name);
    setConfirmada(false);
  }

  function quitarFoto() {
    if (vista) URL.revokeObjectURL(vista);
    setVista("");
    setNombreFoto("");
    setConfirmada(false);
    if (archivoRef.current) archivoRef.current.value = "";
    void guardar({ fotoInspeccion: "" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <section className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-100">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Hoja de ruta del piloto</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Piloto asignado: {reserva.piloto}</h2>
        {reserva.pilotoDemo ? (
          <p className="mt-2 inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200">
            Piloto en formación / Demo
          </p>
        ) : null}
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-zinc-400">Slot</dt><dd>{reserva.fecha} · {reserva.horario}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-zinc-400">Pasajero</dt><dd>{reserva.pasajero}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-zinc-400">Peso aproximado</dt><dd>{reserva.pesoKg} kg</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-zinc-400">Anticipo</dt><dd>{reserva.anticipo}</dd></div>
        </dl>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => void guardar({ anticipo: "Pagado" })} className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-zinc-950">Marcar pagado</button>
          <button type="button" onClick={() => void guardar({ anticipo: "Pendiente" })} className="rounded-full border border-zinc-700 px-3 py-2 text-xs">Marcar pendiente</button>
        </div>
        <ul className="mt-6 space-y-2">
          {PUNTOS.map((punto) => (
            <li key={punto.clave}>
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-zinc-800 px-3 text-sm">
                <input type="checkbox" checked={reserva.checklist[punto.clave]} onChange={() => marcar(punto.clave)} />
                {punto.texto}
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <button type="button" onClick={() => archivoRef.current?.click()} className="min-h-12 w-full rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-950">
            📸 Adjuntar Foto de Inspección / Comprobante
          </button>
          <input
            ref={archivoRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(evento) => elegirFoto(evento.target.files?.[0])}
          />
          {vista || confirmada ? (
            <div className="mt-3 rounded-xl border border-zinc-800 p-3">
              {vista ? <img src={vista} alt="Vista previa de la inspección" className="h-36 w-full rounded-lg object-cover" /> : null}
              <p className="mt-2 text-xs text-zinc-400">{confirmada ? "Foto confirmada" : "Vista previa"} · {nombreFoto}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => { setConfirmada(true); void guardar({ fotoInspeccion: nombreFoto }); }} className="min-h-12 flex-1 rounded-xl bg-emerald-500 text-sm font-semibold text-zinc-950">
                  Confirmar
                </button>
                <button type="button" onClick={quitarFoto} className="min-h-12 flex-1 rounded-xl border border-zinc-700 text-sm">
                  Eliminar
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <button type="button" onClick={onCerrar} className="mt-6 min-h-12 w-full rounded-xl border border-zinc-700 text-sm">Cerrar</button>
      </section>
    </div>
  );
}
