"use client";

import { FormEvent, useState } from "react";

const GIROS = ["Smoke Shop / Growshop", "Hotel / Hospedaje", "Agencia / Guía de Turismo", "Tienda Retail / Conveniencia"];
const ALIANZAS = ["Distribución Mayorista Parafernalia", "Vitrina a Consignación con Llave", "Convenio Comisiones Vuelos Parapente"];
const campo = "min-h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-zinc-100 outline-none focus:border-emerald-400";

export default function FormularioAliados() {
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
    const respuesta = await fetch("/api/aliados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa: datos.get("empresa"),
        representante: datos.get("representante"),
        telefono: datos.get("telefono"),
        correo: datos.get("correo"),
        giro: datos.get("giro"),
        ciudad: datos.get("ciudad"),
        estado: datos.get("estado"),
        tipoAlianza: datos.get("tipoAlianza"),
        mensaje: datos.get("mensaje"),
      }),
    });
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    setEnviando(false);
    if (!respuesta.ok) {
      setError(cuerpo?.message || "No se pudo enviar la solicitud.");
      return;
    }
    setExito(cuerpo?.message || "Alianza registrada correctamente");
    formulario.reset();
  }

  return (
    <form onSubmit={(evento) => void enviar(evento)} className="mt-8 grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-xl font-black text-white">Registro de empresas y aliados</h2>
      <label className="grid gap-2 text-sm">
        Nombre de la empresa o marca
        <input name="empresa" required minLength={2} className={campo} />
      </label>
      <label className="grid gap-2 text-sm">
        Nombre del representante / contacto
        <input name="representante" required minLength={3} autoComplete="name" className={campo} />
      </label>
      <label className="grid gap-2 text-sm">
        Teléfono WhatsApp directo
        <input name="telefono" required inputMode="tel" autoComplete="tel" placeholder="+52 272 000 0000" className={campo} />
      </label>
      <label className="grid gap-2 text-sm">
        Correo electrónico corporativo
        <input name="correo" type="email" required autoComplete="email" className={campo} />
      </label>
      <label className="grid gap-2 text-sm">
        Giro comercial
        <select name="giro" required className={campo} defaultValue={GIROS[0]}>
          {GIROS.map((opcion) => (
            <option key={opcion}>{opcion}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          Ciudad
          <input name="ciudad" required minLength={2} className={campo} />
        </label>
        <label className="grid gap-2 text-sm">
          Estado
          <input name="estado" required minLength={2} className={campo} />
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        Tipo de alianza de interés
        <select name="tipoAlianza" required className={campo} defaultValue={ALIANZAS[0]}>
          {ALIANZAS.map((opcion) => (
            <option key={opcion}>{opcion}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        Mensaje / notas adicionales
        <textarea name="mensaje" rows={4} className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-emerald-400" />
      </label>
      {error ? <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      {exito ? <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{exito}</p> : null}
      <button type="submit" disabled={enviando} className="min-h-12 rounded-xl bg-emerald-500 text-base font-black text-zinc-950 disabled:opacity-50">
        {enviando ? "Enviando solicitud..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
