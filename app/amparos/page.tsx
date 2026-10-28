"use client";

import { FormEvent, useEffect, useState } from "react";
import { posApiUrl } from "@/lib/apiBase";

const SEDES = [
  { value: "orizaba", label: "Orizaba (Jurisdicción Sanitaria VII)" },
  { value: "xalapa", label: "Xalapa (Dirección de Regulación Sanitaria)" },
  { value: "cdmx", label: "CDMX (Sede Central COFEPRIS)" },
] as const;

const PASOS = ["Sede", "Datos", "Consentimiento", "Expediente"] as const;

type Sede = (typeof SEDES)[number]["value"];

type Formulario = {
  sede: Sede | "";
  nombre: string;
  domicilio: string;
  curp: string;
  rfc: string;
  email: string;
  consentimiento: boolean;
};

const INICIAL: Formulario = {
  sede: "",
  nombre: "",
  domicilio: "",
  curp: "",
  rfc: "",
  email: "",
  consentimiento: false,
};

const CURP = /^[A-ZÑ]{4}\d{6}[HM][A-ZÑ]{5}[A-Z0-9Ñ]\d$/;
const RFC = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function GeneradorPermisosCofepris() {
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState<Formulario>(INICIAL);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [generando, setGenerando] = useState(false);
  const [sinCitas, setSinCitas] = useState(false);
  const [radarActivo, setRadarActivo] = useState(false);

  useEffect(() => {
    document.title = "Generador de Permisos COFEPRIS | Cima Digital";
  }, []);

  function actualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setDatos((actual) => ({ ...actual, [campo]: valor }));
    setError("");
  }

  function validarPaso(indice: number): string {
    if (indice === 0 && !datos.sede) {
      return "Elige la sede donde vas a entregar el escrito.";
    }
    if (indice === 1) {
      const nombre = datos.nombre.trim();
      const domicilio = datos.domicilio.trim();
      const curp = datos.curp.trim().toUpperCase();
      const rfc = datos.rfc.trim().toUpperCase().replace(/[\s-]/g, "");
      const email = datos.email.trim();
      if (nombre.length < 5) return "Escribe el nombre completo.";
      if (domicilio.length < 8) return "Escribe el domicilio exacto, con calle y número.";
      if (!CURP.test(curp)) return "La CURP debe tener 18 caracteres, como en la constancia oficial.";
      if (rfc && !RFC.test(rfc)) return "El RFC, si lo indicas, debe tener 12 o 13 caracteres.";
      if (!EMAIL.test(email)) return "Escribe un correo válido.";
    }
    if (indice === 2 && !datos.consentimiento) {
      return "Para continuar hay que aceptar la cuenta global del ecosistema.";
    }
    return "";
  }

  function continuar() {
    const mensaje = validarPaso(paso);
    if (mensaje) {
      setError(mensaje);
      return;
    }
    setError("");
    setPaso((actual) => Math.min(actual + 1, PASOS.length - 1));
  }

  async function generarExpediente(evento: FormEvent) {
    evento.preventDefault();
    for (let indice = 0; indice < 3; indice += 1) {
      const mensaje = validarPaso(indice);
      if (mensaje) {
        setPaso(indice);
        setError(mensaje);
        return;
      }
    }
    setGenerando(true);
    setError("");
    setAviso("");
    try {
      const respuesta = await fetch(posApiUrl("/api/v1/legal/generar"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/pdf" },
        body: JSON.stringify({
          sede: datos.sede,
          nombre: datos.nombre.trim(),
          domicilio: datos.domicilio.trim(),
          curp: datos.curp.trim().toUpperCase(),
          rfc: datos.rfc.trim().toUpperCase(),
          email: datos.email.trim(),
          consentimiento: true,
        }),
      });
      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => ({}));
        throw new Error(cuerpo.detail || "No pude generar el expediente.");
      }
      const blob = await respuesta.blob();
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `expediente-cofepris-${datos.sede}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
      setAviso("Expediente descargado. Es un escrito libre para entregar en la sede. No es un permiso de COFEPRIS.");
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No pude generar el expediente.");
    } finally {
      setGenerando(false);
    }
  }

  async function activarRadar() {
    setError("");
    setAviso("");
    try {
      const respuesta = await fetch(posApiUrl("/api/v1/legal/radar-citas"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: datos.email.trim(), ciudad: datos.sede }),
      });
      const cuerpo = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) {
        throw new Error(cuerpo.detail || "No pude activar el radar de citas.");
      }
      setRadarActivo(true);
      setAviso(cuerpo.mensaje || "Te avisaremos por correo cuando haya una cita.");
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No pude activar el radar de citas.");
    }
  }

  return (
    <main className="m-0 min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.22em] text-cyan-300">CIMA DIGITAL</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Generador de Permisos COFEPRIS</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Arma el escrito libre de autorización de autoconsumo para el Movimiento Canábico Orizaba.
          La descarga no es un permiso otorgado por COFEPRIS.
        </p>

        <ol className="mt-8 grid grid-cols-4 gap-2">
          {PASOS.map((nombre, indice) => {
            const activo = indice === paso;
            const hecho = indice < paso;
            return (
              <li
                key={nombre}
                aria-current={activo ? "step" : undefined}
                className={`rounded-md border px-2 py-2 text-center text-xs font-medium ${
                  activo
                    ? "border-cyan-300 bg-cyan-400/10 text-cyan-100"
                    : hecho
                      ? "border-emerald-500/50 text-emerald-200"
                      : "border-slate-800 text-slate-500"
                }`}
              >
                {indice + 1}. {nombre}
              </li>
            );
          })}
        </ol>

        <form
          onSubmit={(evento) => {
            if (paso < 3) {
              evento.preventDefault();
              continuar();
              return;
            }
            void generarExpediente(evento);
          }}
          className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-[0_0_40px_rgba(8,47,73,0.35)]"
        >
          {paso === 0 && (
            <div>
              <label htmlFor="sede" className="text-sm font-medium text-white">
                Sede de entrega
              </label>
              <select
                id="sede"
                value={datos.sede}
                onChange={(evento) => {
                  actualizar("sede", evento.target.value as Sede | "");
                  setSinCitas(false);
                  setRadarActivo(false);
                }}
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-300"
              >
                <option value="">Selecciona una sede</option>
                {SEDES.map((sede) => (
                  <option key={sede.value} value={sede.value}>
                    {sede.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {paso === 1 && (
            <div className="space-y-4">
              <Campo id="nombre" label="Nombre completo" value={datos.nombre} onChange={(valor) => actualizar("nombre", valor)} autoComplete="name" />
              <Campo id="domicilio" label="Domicilio exacto" value={datos.domicilio} onChange={(valor) => actualizar("domicilio", valor)} autoComplete="street-address" />
              <Campo id="curp" label="CURP" value={datos.curp} onChange={(valor) => actualizar("curp", valor.toUpperCase())} autoComplete="off" maxLength={18} />
              <Campo id="rfc" label="RFC (opcional)" value={datos.rfc} onChange={(valor) => actualizar("rfc", valor.toUpperCase())} autoComplete="off" maxLength={13} />
              <Campo id="email" label="Email" value={datos.email} onChange={(valor) => actualizar("email", valor)} type="email" autoComplete="email" />
            </div>
          )}

          {paso === 2 && (
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-200">
              <input
                type="checkbox"
                checked={datos.consentimiento}
                onChange={(evento) => actualizar("consentimiento", evento.target.checked)}
                className="mt-1 h-4 w-4 accent-cyan-400"
              />
              <span>Acepto que mis datos generen mi cuenta global en el ecosistema Basecamp 420 y The Trip Smoke Shop.</span>
            </label>
          )}

          {paso === 3 && (
            <div className="space-y-3">
              <p className="text-sm leading-6 text-slate-300">
                Sede: {SEDES.find((sede) => sede.value === datos.sede)?.label}. Al generar, el escrito queda
                registrado con el correo {datos.email.trim()}.
              </p>
              <button
                type="submit"
                disabled={generando}
                className="w-full rounded-md bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-wait disabled:opacity-70"
              >
                {generando ? "Generando expediente..." : "Generar Expediente"}
              </button>
              {datos.sede === "cdmx" && (
                <>
                  <a
                    href="https://www.gob.mx/cofepris"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-md border border-white/80 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Agendar Cita en COFEPRIS
                  </a>
                  <button
                    type="button"
                    onClick={() => setSinCitas(true)}
                    className="w-full rounded-md border border-slate-700 px-4 py-3 text-sm text-slate-200 hover:border-slate-500"
                  >
                    No hay citas disponibles
                  </button>
                  {sinCitas && (
                    <button
                      type="button"
                      onClick={activarRadar}
                      disabled={radarActivo}
                      className="w-full rounded-md border border-emerald-400/70 px-4 py-3 text-sm font-semibold text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.18)] hover:bg-emerald-400/10 disabled:opacity-70"
                    >
                      {radarActivo ? "Radar de citas activo" : "Activar Radar de Citas (Te avisaremos por correo)"}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
          {aviso && <p className="mt-4 text-sm text-emerald-300">{aviso}</p>}

          <div className="mt-6 flex justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setError("");
                setPaso((actual) => Math.max(actual - 1, 0));
              }}
              disabled={paso === 0}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:opacity-40"
            >
              Atrás
            </button>
            {paso < 3 && (
              <button type="button" onClick={continuar} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                Continuar
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

function Campo({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={(evento) => onChange(evento.target.value)}
        className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-300"
      />
    </div>
  );
}
