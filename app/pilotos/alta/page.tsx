"use client";

import { FormEvent, useState } from "react";

type AltaLista = {
  nombre: string;
  telefono: string;
  etiqueta: string;
  whatsapp: string;
  yaExistia: boolean;
};

export default function AltaPilotosPage() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [certificacion, setCertificacion] = useState<"tandem_appi" | "en_formacion">("tandem_appi");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [alta, setAlta] = useState<AltaLista | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setError("");
    const respuesta = await fetch("/api/pilotos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, telefono, certificacion }),
    });
    const datos = (await respuesta.json()) as {
      error?: string;
      yaExistia?: boolean;
      whatsapp?: string;
      piloto?: { nombre: string; telefono: string; certificacion_tandem: boolean };
    };
    setEnviando(false);
    if (!respuesta.ok || !datos.piloto || !datos.whatsapp) {
      setError(datos.error || "No se pudo registrar al piloto.");
      return;
    }
    setAlta({
      nombre: datos.piloto.nombre,
      telefono: datos.piloto.telefono.slice(-10),
      etiqueta: datos.piloto.certificacion_tandem ? "Tándem APPI" : "En formación",
      whatsapp: datos.whatsapp,
      yaExistia: Boolean(datos.yaExistia),
    });
    setNombre("");
    setTelefono("");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-neutral-950 px-4 pb-28 pt-8 text-neutral-50">
      <div className="mx-auto max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Cierre de junta</p>
        <h1 className="mt-2 text-3xl font-black">Alta de piloto</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Queda al final de la lista. Salvador Lara sigue siendo la prioridad 1.
        </p>
        {alta ? (
          <section className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5">
            <h2 className="text-xl font-black">{alta.yaExistia ? "Ese WhatsApp ya estaba registrado" : "Piloto guardado"}</h2>
            <p className="mt-2 text-sm text-emerald-100">{alta.nombre} · {alta.telefono} · {alta.etiqueta}</p>
            <a href={alta.whatsapp} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 text-center text-base font-black text-zinc-950">
              Enviar alta por WhatsApp al 2727258748
            </a>
            <button type="button" onClick={() => setAlta(null)} className="mt-3 min-h-12 w-full rounded-xl border border-neutral-700 text-sm">
              Registrar otro piloto
            </button>
          </section>
        ) : (
          <form onSubmit={(evento) => void enviar(evento)} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm">
              Nombre completo
              <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} required minLength={3} autoComplete="name" className="min-h-12 rounded-xl border border-neutral-800 bg-neutral-900 px-4" />
            </label>
            <label className="grid gap-2 text-sm">
              Teléfono (WhatsApp a 10 dígitos)
              <input value={telefono} onChange={(evento) => setTelefono(evento.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" required pattern="\d{10}" className="min-h-12 rounded-xl border border-neutral-800 bg-neutral-900 px-4" />
            </label>
            <fieldset className="grid gap-3">
              <legend className="text-sm">Certificación</legend>
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-neutral-800 px-4">
                <input type="radio" name="certificacion" checked={certificacion === "tandem_appi"} onChange={() => setCertificacion("tandem_appi")} />
                Tándem APPI
              </label>
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-neutral-800 px-4">
                <input type="radio" name="certificacion" checked={certificacion === "en_formacion"} onChange={() => setCertificacion("en_formacion")} />
                En formación
              </label>
            </fieldset>
            {error ? <p className="text-sm text-amber-300">{error}</p> : null}
            <button type="submit" disabled={enviando} className="min-h-12 rounded-xl bg-amber-400 text-base font-black text-slate-950 disabled:opacity-40">
              {enviando ? "Guardando..." : "Guardar piloto"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
