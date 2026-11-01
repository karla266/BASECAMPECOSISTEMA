"use client";

import { FormEvent, useState } from "react";

const ORGANISMOS = ["APPI", "FALP", "Libre"] as const;
const NIVELES = ["APPI 1", "APPI 2", "APPI 3", "Tandem Pro Comercial"] as const;

const campo = "min-h-12 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-zinc-100 outline-none focus:border-amber-400";

export default function AltaPilotosPage() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    setEnviando(true);
    setError("");
    setExito("");
    const datos = new FormData(formulario);
    const respuesta = await fetch("/api/pilotos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: datos.get("nombre"),
        telefono: datos.get("telefono"),
        correo: datos.get("correo"),
        licenciaNumero: datos.get("licenciaNumero"),
        licenciaOrganismo: datos.get("licenciaOrganismo"),
        nivel: datos.get("nivel"),
        horas: datos.get("horas"),
        equipo: datos.get("equipo"),
        ciudad: datos.get("ciudad"),
      }),
    });
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    setEnviando(false);
    if (!respuesta.ok) {
      setError(cuerpo?.message || "No se pudo registrar al piloto.");
      return;
    }
    setExito("Tu registro fue recibido; nos comunicaremos para validación de bitácora");
    formulario.reset();
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
      <form onSubmit={(evento) => void enviar(evento)} className="mx-auto grid max-w-xl gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Bitácora</p>
        <h1 className="text-3xl font-black text-white">Registro de pilotos</h1>
        <p className="text-sm text-zinc-400">El alta queda en revisión hasta validar licencia y horas de vuelo.</p>
        <label className="grid gap-2 text-sm">
          Nombre completo
          <input name="nombre" required minLength={3} autoComplete="name" className={campo} />
        </label>
        <label className="grid gap-2 text-sm">
          Teléfono WhatsApp (con lada)
          <input name="telefono" required inputMode="tel" autoComplete="tel" placeholder="+52 272 000 0000" className={campo} />
        </label>
        <label className="grid gap-2 text-sm">
          Correo electrónico
          <input name="correo" type="email" required autoComplete="email" className={campo} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">
            Número de licencia
            <input name="licenciaNumero" required className={campo} />
          </label>
          <label className="grid gap-2 text-sm">
            Organismo
            <select name="licenciaOrganismo" required className={campo} defaultValue="APPI">
              {ORGANISMOS.map((opcion) => (
                <option key={opcion}>{opcion}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-2 text-sm">
          Nivel de certificación
          <select name="nivel" required className={campo} defaultValue="APPI 2">
            {NIVELES.map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Horas de vuelo en bitácora
          <input name="horas" type="number" required min={0} step="0.1" inputMode="decimal" className={campo} />
        </label>
        <label className="grid gap-2 text-sm">
          Modelo y marca de vela / equipo propio
          <input name="equipo" required minLength={2} className={campo} />
        </label>
        <label className="grid gap-2 text-sm">
          Ciudad base
          <input name="ciudad" required minLength={2} className={campo} />
        </label>
        {error ? <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
        {exito ? <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{exito}</p> : null}
        <button type="submit" disabled={enviando} className="min-h-12 rounded-xl bg-amber-400 text-base font-black text-zinc-950 disabled:opacity-50">
          {enviando ? "Enviando registro..." : "Enviar registro"}
        </button>
      </form>
    </main>
  );
}
