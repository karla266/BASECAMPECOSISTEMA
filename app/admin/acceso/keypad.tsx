"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "borrar", "0", "entrar"] as const;

function destinoSeguro(valor: string | null, rol: string): string {
  if (rol === "operador_foto") return "/admin/camara";
  if (rol === "cajero") return "/admin";
  if (
    valor &&
    valor.startsWith("/admin") &&
    !valor.startsWith("//") &&
    !valor.startsWith("/admin/login") &&
    !valor.includes("://") &&
    !valor.includes("\\")
  ) {
    return valor;
  }
  return "/admin";
}

export default function KeypadPin() {
  const params = useSearchParams();
  const [pin, setPin] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aceptar(valor = pin) {
    if (valor.length < 4 || enviando) {
      setAviso("El PIN tiene al menos 4 dígitos.");
      return;
    }
    setEnviando(true);
    setAviso("");
    try {
      const respuesta = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: valor }),
      });
      const cuerpo = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        setPin("");
        setAviso(typeof cuerpo?.error === "string" ? cuerpo.error : "PIN incorrecto.");
        setEnviando(false);
        return;
      }
      window.location.assign(destinoSeguro(params.get("siguiente"), String(cuerpo?.rol || "admin")));
    } catch {
      setAviso("No se pudo comprobar el PIN.");
      setEnviando(false);
    }
  }

  function pulsar(tecla: (typeof TECLAS)[number]) {
    if (tecla === "borrar") {
      setPin((actual) => actual.slice(0, -1));
      return;
    }
    if (tecla === "entrar") {
      aceptar().catch(() => setAviso("No se pudo comprobar el PIN."));
      return;
    }
    setPin((actual) => (actual.length >= 8 ? actual : `${actual}${tecla}`));
  }

  useEffect(() => {
    function teclado(evento: KeyboardEvent) {
      if (evento.key >= "0" && evento.key <= "9") pulsar(evento.key as (typeof TECLAS)[number]);
      if (evento.key === "Backspace") pulsar("borrar");
      if (evento.key === "Enter") pulsar("entrar");
    }
    window.addEventListener("keydown", teclado);
    return () => window.removeEventListener("keydown", teclado);
  }, [pin, enviando]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 text-slate-100">
      <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Basecamp 420</p>
      <h1 className="mt-2 text-center text-3xl font-black text-white">Acceso rápido</h1>
      <p className="mt-2 text-center text-sm text-slate-400">PIN de administración, caja o fotos de mostrador.</p>
      <p className="mt-6 min-h-12 text-center font-mono text-3xl tracking-[0.4em] text-white" aria-live="polite">
        {pin ? "•".repeat(pin.length) : "—"}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {TECLAS.map((tecla) => (
          <button
            key={tecla}
            type="button"
            onClick={() => pulsar(tecla)}
            disabled={enviando}
            className="min-h-16 rounded-2xl bg-slate-800 text-xl font-black text-white active:bg-emerald-600 disabled:opacity-40"
          >
            {tecla === "borrar" ? "Borrar" : tecla === "entrar" ? "OK" : tecla}
          </button>
        ))}
      </div>
      {aviso ? <p className="mt-4 text-center text-sm text-amber-200">{aviso}</p> : null}
      <a href="/admin/login" className="mt-6 text-center text-sm font-semibold text-emerald-300">
        Entrar con usuario y contraseña
      </a>
    </main>
  );
}
