"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getTenantConfig } from "@/lib/tenant";
import BotonWhatsappVuelo from "@/components/vuelos/BotonWhatsappVuelo";

const SLOT_OPTIONS = ["10:00", "12:00", "14:00", "16:00"];
const tenantConfig = getTenantConfig();
const FLIGHT_PRICE = tenantConfig.pricing.flightDepositCents / 100;

export default function ReservarPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("10:00");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [weightKg, setWeightKg] = useState(75);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cupos, setCupos] = useState<Record<string, { disponible: boolean; piloto: string }>>({});
  const [exito, setExito] = useState<{ horario: string; piloto: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fecha = params.get("fecha") || "";
    const horario = params.get("horario") || "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) setSelectedDate(fecha);
    if (SLOT_OPTIONS.includes(horario)) setSelectedSlot(horario);
  }, []);

  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) return;
    void fetch(`/api/vuelos/disponibilidad?fecha=${selectedDate}`)
      .then((respuesta) => respuesta.json())
      .then((datos: { slots?: Array<{ horario: string; disponible: boolean; piloto: string }> }) => {
        const mapa: Record<string, { disponible: boolean; piloto: string }> = {};
        for (const slot of datos.slots || []) mapa[slot.horario] = { disponible: slot.disponible, piloto: slot.piloto };
        setCupos(mapa);
      })
      .catch(() => setCupos({}));
  }, [selectedDate]);

  const exceedsLimit = useMemo(() => Number(weightKg) > 95, [weightKg]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/vuelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pasajero: fullName,
          telefono: phone,
          fecha: selectedDate,
          horario: selectedSlot,
          pesoKg: Number(weightKg),
        }),
      });

      const data = (await response.json()) as { error?: string; reserva?: { horario: string; piloto: string } };
      if (!response.ok || !data.reserva) {
        throw new Error(data.error || "No se pudo confirmar la reserva.");
      }
      setExito({ horario: data.reserva.horario, piloto: data.reserva.piloto });
      const cupo = await fetch(`/api/vuelos/disponibilidad?fecha=${selectedDate}`);
      const mapaCupo = (await cupo.json()) as { slots?: Array<{ horario: string; disponible: boolean; piloto: string }> };
      const mapa: Record<string, { disponible: boolean; piloto: string }> = {};
      for (const slot of mapaCupo.slots || []) mapa[slot.horario] = { disponible: slot.disponible, piloto: slot.piloto };
      setCupos(mapa);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "No se pudo procesar la reserva.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-neutral-950 px-4 pb-28 pt-8 text-neutral-50">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-neutral-800 bg-neutral-900 p-6 shadow-2xl md:p-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">{tenantConfig.brandName}</p>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">Reservar vuelo tándem</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Pago anticipado desde {new Intl.NumberFormat("es-MX", { style: "currency", currency: tenantConfig.currency, maximumFractionDigits: 0 }).format(FLIGHT_PRICE)} o canje con folio Mercado Libre por{" "}
            {new Intl.NumberFormat("es-MX", { style: "currency", currency: tenantConfig.currency, maximumFractionDigits: 0 }).format(tenantConfig.pricing.flightTotalCents / 100)}.
          </p>
        </div>

        {exito ? (
          <section className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center">
            <h2 className="text-2xl font-black text-white">Reserva confirmada</h2>
            <p className="mt-2 text-sm text-emerald-100">
              Slot de las {exito.horario} con {exito.piloto}.
            </p>
            <a href="/checkout" className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 text-base font-black text-zinc-950">
              Continuar al checkout de pago
            </a>
            <a href="/ordenar" className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-emerald-400/40 px-4 text-sm font-semibold text-emerald-100">
              Pide tus micheladas y tacos para cuando toques tierra
            </a>
            <button type="button" onClick={() => setExito(null)} className="mt-3 min-h-12 w-full rounded-xl border border-neutral-700 text-sm">
              Hacer otra reserva
            </button>
          </section>
        ) : null}
        <form onSubmit={handleSubmit} className={`grid gap-6 md:grid-cols-2 ${exito ? "hidden" : ""}`}>
          <div className="space-y-5 md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-300">
              Fecha del vuelo
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-300">Horario de despegue</label>
            <div className="grid grid-cols-2 gap-4">
              {SLOT_OPTIONS.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  disabled={selectedDate !== "" && cupos[slot]?.disponible === false}
                  className={`min-h-12 rounded-2xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    selectedSlot === slot
                      ? "border-amber-400 bg-amber-500/15 text-amber-200"
                      : "border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  <div className="text-sm font-bold">{slot}</div>
                  <div className="text-[11px] text-neutral-400">
                    {cupos[slot]?.disponible === false ? "Slot saturado" : cupos[slot]?.piloto || "Slot oficial"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm font-semibold text-neutral-300">
            Nombre completo
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
              placeholder="Juan Pérez"
            />
          </label>

          <label className="block text-sm font-semibold text-neutral-300">
            WhatsApp
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
              placeholder="2721234567"
            />
          </label>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-300">
              Peso aproximado (kg)
              <input
                type="number"
                min={40}
                max={120}
                value={weightKg}
                onChange={(event) => setWeightKg(Number(event.target.value || 0))}
                required
                className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
              />
            </label>
            {exceedsLimit ? (
              <p className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                Advertencia: la operación tándem requiere peso máximo de 95 kg para este vuelo.
              </p>
            ) : (
              <p className="mt-2 text-sm text-emerald-300">Peso dentro del rango operativo recomendado.</p>
            )}
          </div>

          <div className="md:col-span-2 rounded-2xl border border-neutral-700 bg-neutral-950/70 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-neutral-400">Monto a pagar</span>
              <span className="text-2xl font-black text-amber-300">{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(FLIGHT_PRICE)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || exceedsLimit || (selectedDate !== "" && cupos[selectedSlot]?.disponible === false)}
            className="md:col-span-2 min-h-12 w-full rounded-xl bg-amber-400 px-6 text-base font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Asignando piloto..." : "Confirmar reserva"}
          </button>

          {message ? (
            <div className="md:col-span-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {message}
            </div>
          ) : null}
        </form>
      </div>
      <BotonWhatsappVuelo />
    </main>
  );
}
