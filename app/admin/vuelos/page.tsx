"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HojaRutaPiloto from "@/components/vuelos/HojaRutaPiloto";
import type { PilotoVuelo, ReservaVuelo } from "@/lib/vuelos";

export default function TableroVuelosPage() {
  const [reservas, setReservas] = useState<ReservaVuelo[]>([]);
  const [pilotos, setPilotos] = useState<PilotoVuelo[]>([]);
  const [activa, setActiva] = useState<ReservaVuelo | null>(null);
  const [aviso, setAviso] = useState("");
  const [reiniciando, setReiniciando] = useState(false);

  async function cargar() {
    const respuesta = await fetch("/api/vuelos", { cache: "no-store" });
    const datos = (await respuesta.json()) as { reservas?: ReservaVuelo[]; pilotos?: PilotoVuelo[]; error?: string };
    if (!respuesta.ok) {
      setAviso(datos.error || "No se pudo abrir el tablero.");
      return;
    }
    setReservas(datos.reservas || []);
    setPilotos(datos.pilotos || []);
  }

  useEffect(() => {
    void cargar();
  }, []);

  async function reiniciarDemo() {
    if (!window.confirm("¿Vaciar todas las reservas de la demo?")) return;
    setReiniciando(true);
    const respuesta = await fetch("/api/vuelos", { method: "DELETE" });
    setReiniciando(false);
    if (!respuesta.ok) {
      setAviso("No se pudo reiniciar la demo.");
      return;
    }
    setReservas([]);
    setActiva(null);
    setAviso("");
  }

  function enDemo(reserva: ReservaVuelo) {
    if (reserva.pilotoDemo) return true;
    const piloto = pilotos.find((item) => item.id === reserva.pilotoId);
    return Boolean(piloto && (piloto.certificacion_tandem === false || piloto.estado === "demo_presentacion"));
  }

  return (
    <div className="text-zinc-100">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Operación de pista</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold text-white">Tablero de reservas</h1>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/pilotos/alta" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-700 px-4 text-sm font-semibold text-white">
            Alta de pilotos
          </Link>
          <button type="button" onClick={() => void reiniciarDemo()} disabled={reiniciando} className="min-h-12 rounded-xl border border-amber-500/50 px-4 text-sm font-semibold text-amber-200">
            {reiniciando ? "Vaciando..." : "Reiniciar Demo (Vaciar Reservas)"}
          </button>
        </div>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Salvador Lara cubre primero cada horario. Si su lugar ya está tomado, la reserva queda con el piloto de respaldo disponible.
      </p>
      {aviso ? <p className="mt-4 text-sm text-amber-300">{aviso}</p> : null}
      <div className="mt-6 grid gap-3 md:hidden">
        {reservas.map((reserva) => (
          <article key={reserva.id} className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-xs text-zinc-400">{reserva.fecha} · {reserva.horario}</p>
            <h2 className="mt-1 text-lg font-semibold text-white">{reserva.pasajero}</h2>
            <p className="mt-1 text-sm text-zinc-300">{reserva.pesoKg} kg · Anticipo {reserva.anticipo}</p>
            <p className="mt-2 text-sm font-medium text-white">Piloto: {reserva.piloto}</p>
            {enDemo(reserva) ? (
              <p className="mt-2 inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-200">Piloto en formación / Demo</p>
            ) : null}
            <button type="button" onClick={() => setActiva(reserva)} className="mt-4 min-h-12 w-full rounded-xl border border-zinc-700 text-sm">
              Hoja de ruta
            </button>
          </article>
        ))}
      </div>
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr>
              <th className="py-2">Slot</th>
              <th>Pasajero</th>
              <th>Peso</th>
              <th>Piloto</th>
              <th>Anticipo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id} className="border-t border-zinc-800">
                <td className="py-3">{reserva.fecha} {reserva.horario}</td>
                <td>{reserva.pasajero}</td>
                <td>{reserva.pesoKg} kg</td>
                <td>
                  <span className="font-medium text-white">{reserva.piloto}</span>
                  {enDemo(reserva) ? (
                    <span className="ml-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200">
                      Piloto en formación / Demo
                    </span>
                  ) : null}
                </td>
                <td>{reserva.anticipo}</td>
                <td>
                  <button type="button" onClick={() => setActiva(reserva)} className="rounded-full border border-zinc-700 px-3 py-1 text-xs">
                    Hoja de ruta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reservas.length === 0 ? <p className="mt-4 text-sm text-zinc-500">Todavía no hay reservas en los slots de hoy.</p> : null}
      </div>
      {activa ? (
        <HojaRutaPiloto
          reserva={{ ...activa, pilotoDemo: activa.pilotoDemo || enDemo(activa) }}
          onCerrar={() => setActiva(null)}
          onCambio={(reserva) => {
            setActiva(reserva);
            setReservas((lista) => lista.map((item) => (item.id === reserva.id ? reserva : item)));
          }}
        />
      ) : null}
    </div>
  );
}
