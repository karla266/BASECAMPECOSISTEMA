"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { hayHuellaEnEsteNavegador, hayNfcEnEsteNavegador, leerHuellaEnEquipo, leerTarjetaNfc, mensajeHuella } from "@/lib/lectorNavegador";

function destinoTrasEntrar(valor: string | null): string {
  if (
    !valor ||
    !valor.startsWith("/admin") ||
    valor.startsWith("//") ||
    valor.startsWith("/admin/login") ||
    valor.includes("://") ||
    valor.includes("\\")
  ) {
    return "/admin";
  }
  return valor;
}

function Formulario() {
  const params = useSearchParams();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [nfcActivo, setNfcActivo] = useState(false);
  const [huellaActiva, setHuellaActiva] = useState(false);
  const [uid, setUid] = useState("");
  const [hayHuella, setHayHuella] = useState(true);
  const [hayNfc, setHayNfc] = useState(false);

  useEffect(() => {
    setHayHuella(hayHuellaEnEsteNavegador());
    setHayNfc(hayNfcEnEsteNavegador());
    let vivo = true;
    fetch("/api/admin/lectores/estado", { cache: "no-store" })
      .then((respuesta) => respuesta.json())
      .then((data) => {
        if (!vivo || !data) return;
        const destinosNfc = Array.isArray(data.nfc?.destinos) ? data.nfc.destinos : [];
        const destinosHuella = Array.isArray(data.huella?.destinos) ? data.huella.destinos : [];
        setNfcActivo(data.nfc?.activo === true && destinosNfc.includes("admin"));
        setHuellaActiva(data.huella?.activo === true && destinosHuella.includes("admin"));
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, []);

  async function entrarConLector(url: string, body: unknown) {
    setMensaje("");
    setEnviando(true);
    try {
      const respuesta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        setMensaje(typeof data?.error === "string" ? data.error : "No se pudo entrar al panel.");
        setEnviando(false);
        return;
      }
      window.location.assign(destinoTrasEntrar(params.get("siguiente")));
    } catch {
      setMensaje("No se pudo entrar al panel.");
      setEnviando(false);
    }
  }

  async function entrarNfc(valor?: string) {
    const tarjeta = (valor ?? uid).trim();
    if (!tarjeta) {
      setMensaje("Acerca la tarjeta o escribe su identificador.");
      return;
    }
    await entrarConLector("/api/admin/login/nfc", { uid: tarjeta });
  }

  async function entrarHuella() {
    if (!hayHuellaEnEsteNavegador()) {
      setMensaje("Este navegador no tiene lector de huellas. Entra con usuario y contraseña.");
      return;
    }
    setMensaje("Esperando la huella en este equipo...");
    try {
      const credentialId = await leerHuellaEnEquipo();
      await entrarConLector("/api/admin/login/huella", { credentialId, destino: "admin" });
    } catch (error) {
      setMensaje(mensajeHuella(error));
      setEnviando(false);
    }
  }

  async function leerNfc() {
    setMensaje("Acerca la tarjeta al lector NFC...");
    try {
      const leido = await leerTarjetaNfc();
      setUid(leido);
      await entrarNfc(leido);
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudo leer la tarjeta.");
    }
  }

  async function entrar(evento: FormEvent) {
    evento.preventDefault();
    setMensaje("");
    setEnviando(true);
    try {
      const respuesta = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, clave }),
      });
      const data = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        setMensaje(
          typeof data?.error === "string" ? data.error : "No se pudo entrar al panel."
        );
        setEnviando(false);
        return;
      }
      window.location.assign(destinoTrasEntrar(params.get("siguiente")));
    } catch {
      setMensaje("No se pudo entrar al panel.");
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-4">
      <form
        onSubmit={entrar}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl"
      >
        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-3">
          Basecamp 420
        </p>
        <h1 className="text-2xl font-extrabold text-white mb-2">Entrar al panel</h1>
        <p className="text-sm text-slate-400 mb-8">
          Acceso de administración. El mostrador del punto de venta usa otra entrada.
        </p>

        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="usuario-panel">
          Usuario
        </label>
        <input
          id="usuario-panel"
          name="usuario"
          autoComplete="username"
          value={usuario}
          onChange={(evento) => setUsuario(evento.target.value)}
          className="w-full mb-5 rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
          required
        />

        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="clave-panel">
          Contraseña
        </label>
        <input
          id="clave-panel"
          name="clave"
          type="password"
          autoComplete="current-password"
          value={clave}
          onChange={(evento) => setClave(evento.target.value)}
          className="w-full mb-6 rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
          required
        />

        {mensaje ? (
          <p className="mb-4 text-sm text-red-300" role="alert">
            {mensaje}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold py-3 transition-colors"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        {nfcActivo ? (
          <div className="mt-6 border-t border-slate-800 pt-6">
            <p className="text-sm text-slate-400 mb-3">
              Chrome de escritorio a menudo no trae Web NFC; un lector en modo teclado sirve igual.
            </p>
            <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="uid-panel">
              Tarjeta NFC
            </label>
            <input
              id="uid-panel"
              value={uid}
              onChange={(evento) => setUid(evento.target.value)}
              onKeyDown={(evento) => {
                if (evento.key === "Enter") {
                  evento.preventDefault();
                  void entrarNfc();
                }
              }}
              autoComplete="off"
              placeholder="Identificador de la tarjeta"
              className="w-full mb-3 rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
            />
            <div className="flex flex-col gap-3">
              {hayNfc ? (
                <button
                  type="button"
                  onClick={() => void leerNfc()}
                  disabled={enviando}
                  className="w-full rounded-xl border border-slate-700 text-white font-bold py-3 disabled:opacity-60"
                >
                  Leer tarjeta NFC
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void entrarNfc()}
                disabled={enviando}
                className="w-full rounded-xl bg-slate-100 text-slate-950 font-extrabold py-3 disabled:opacity-60"
              >
                Entrar con NFC
              </button>
            </div>
          </div>
        ) : null}

        {huellaActiva ? (
          <div className="mt-6 border-t border-slate-800 pt-6">
            {!hayHuella ? (
              <p className="mb-3 text-sm text-amber-200" role="status">
                Este navegador no tiene lector de huellas. Entra con usuario y contraseña.
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void entrarHuella()}
              disabled={enviando || !hayHuella}
              className="w-full rounded-xl border border-emerald-500/40 text-emerald-300 font-extrabold py-3 disabled:opacity-60"
            >
              Entrar con huella
            </button>
          </div>
        ) : null}
      </form>
    </main>
  );
}

export default function FormularioIngreso() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-emerald-400 flex items-center justify-center">
          Cargando acceso...
        </main>
      }
    >
      <Formulario />
    </Suspense>
  );
}
