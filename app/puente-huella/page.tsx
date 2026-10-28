"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { hayHuellaEnEsteNavegador, leerHuellaEnEquipo, mensajeHuella } from "@/lib/lectorNavegador";

function volverSeguro(valor: string | null): string | null {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    if (url.protocol !== "http:") return null;
    if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") return null;
    if (url.port !== "8110") return null;
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}

function Puente() {
  const params = useSearchParams();
  const volver = volverSeguro(params.get("volver"));
  const [mensaje, setMensaje] = useState("");
  const [leyendo, setLeyendo] = useState(false);
  const hayHuella = hayHuellaEnEsteNavegador();

  async function leer() {
    if (!volver) {
      setMensaje("El mostrador no indicó una dirección válida de regreso.");
      return;
    }
    if (!hayHuella) {
      setMensaje("Este navegador no tiene lector de huellas. Vuelve al mostrador y entra con usuario y contraseña.");
      return;
    }
    setLeyendo(true);
    setMensaje("Esperando la huella en este equipo...");
    try {
      const credentialId = await leerHuellaEnEquipo();
      const respuesta = await fetch("/api/admin/login/huella", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId, destino: "mostrador" }),
      });
      const data = await respuesta.json().catch(() => null);
      if (!respuesta.ok || typeof data?.ticket !== "string") {
        setMensaje(typeof data?.error === "string" ? data.error : "No se pudo entrar con la huella.");
        setLeyendo(false);
        return;
      }
      window.location.assign(`${volver}?ticket=${encodeURIComponent(data.ticket)}`);
    } catch (error) {
      setMensaje(mensajeHuella(error));
      setLeyendo(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-3">Mostrador</p>
        <h1 className="text-2xl font-extrabold text-white mb-2">Entrar con huella</h1>
        <p className="text-sm text-slate-400 mb-6">
          La huella se comprueba en este equipo y, si está enrolada a alguien que puede estar en caja, abre el
          mostrador.
        </p>
        {!hayHuella ? (
          <p className="mb-4 text-sm text-amber-200" role="status">
            Este navegador no tiene Web Authentication. El acceso con usuario y contraseña sigue disponible en el
            mostrador.
          </p>
        ) : null}
        {mensaje ? (
          <p className="mb-4 text-sm text-slate-300" role="status">
            {mensaje}
          </p>
        ) : null}
        <button
          type="button"
          onClick={leer}
          disabled={leyendo || !hayHuella || !volver}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold py-3"
        >
          {leyendo ? "Leyendo huella..." : "Leer huella"}
        </button>
        {volver ? (
          <a href={volver} className="block text-center text-sm text-slate-400 mt-4">
            Volver al mostrador
          </a>
        ) : null}
      </section>
    </main>
  );
}

export default function PaginaPuenteHuella() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-emerald-400 flex items-center justify-center">
          Cargando lector de huellas...
        </main>
      }
    >
      <Puente />
    </Suspense>
  );
}
