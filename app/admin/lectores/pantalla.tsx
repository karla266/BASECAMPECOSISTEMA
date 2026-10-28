"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  enrolarHuellaEnEquipo,
  hayHuellaEnEsteNavegador,
  hayNfcEnEsteNavegador,
  leerTarjetaNfc,
  mensajeHuella,
} from "@/lib/lectorNavegador";

type Destino = "mostrador" | "admin" | "ambos";

type Huella = { id: string; registradoEn: string };

type UsuarioLectores = {
  usuario: string;
  nombre: string;
  rol: string;
  nfcUids: string[];
  huellas: Huella[];
};

type Lectores = {
  nfc: { activo: boolean; destinos: string[] };
  huella: { activo: boolean; destinos: string[]; origen: string };
};

const campo =
  "w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500";

function destinoDe(destinos: string[]): Destino {
  const mostrador = destinos.includes("mostrador");
  const admin = destinos.includes("admin");
  if (mostrador && admin) return "ambos";
  if (admin) return "admin";
  return "mostrador";
}

function destinosDe(valor: Destino): Destino[] {
  if (valor === "ambos") return ["mostrador", "admin"];
  if (valor === "admin") return ["admin"];
  return ["mostrador"];
}

function etiquetaRol(rol: string) {
  if (rol === "admin") return "Administrador";
  if (rol === "mostrador") return "Mostrador";
  if (rol === "trabajador") return "Trabajador";
  return "Cajero";
}

function fechaCorta(valor: string) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "fecha no disponible";
  return fecha.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

export default function PantallaLectores() {
  const [nfcActivo, setNfcActivo] = useState(false);
  const [nfcDestino, setNfcDestino] = useState<Destino>("mostrador");
  const [huellaActivo, setHuellaActivo] = useState(false);
  const [huellaDestino, setHuellaDestino] = useState<Destino>("mostrador");
  const [origenHuella, setOrigenHuella] = useState("");
  const [usuarios, setUsuarios] = useState<UsuarioLectores[]>([]);
  const [usuarioNfc, setUsuarioNfc] = useState("");
  const [uid, setUid] = useState("");
  const [usuarioHuella, setUsuarioHuella] = useState("");
  const [aviso, setAviso] = useState("");
  const [avisoOk, setAvisoOk] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [hayHuella, setHayHuella] = useState(true);
  const [hayNfc, setHayNfc] = useState(false);

  function aplicar(lectores: Lectores, lista: UsuarioLectores[]) {
    setNfcActivo(lectores.nfc.activo);
    setNfcDestino(destinoDe(lectores.nfc.destinos));
    setHuellaActivo(lectores.huella.activo);
    setHuellaDestino(destinoDe(lectores.huella.destinos));
    setOrigenHuella(lectores.huella.origen || "");
    setUsuarios(lista);
    setUsuarioNfc((actual) => actual || lista[0]?.usuario || "");
    setUsuarioHuella((actual) => actual || lista[0]?.usuario || "");
  }

  async function cargar() {
    const respuesta = await fetch("/api/admin/lectores", { cache: "no-store" });
    const data = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      throw new Error(typeof data?.error === "string" ? data.error : "No se pudo cargar.");
    }
    aplicar(data.lectores, Array.isArray(data.usuarios) ? data.usuarios : []);
  }

  useEffect(() => {
    setHayHuella(hayHuellaEnEsteNavegador());
    setHayNfc(hayNfcEnEsteNavegador());
    let vivo = true;
    cargar()
      .catch((error) => {
        if (!vivo) return;
        setAvisoOk(false);
        setAviso(error instanceof Error ? error.message : "No se pudo cargar.");
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  async function guardar(evento: FormEvent) {
    evento.preventDefault();
    setGuardando(true);
    setAviso("");
    setAvisoOk(false);
    try {
      const respuesta = await fetch("/api/admin/lectores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nfc: { activo: nfcActivo, destinos: destinosDe(nfcDestino) },
          huella: { activo: huellaActivo, destinos: destinosDe(huellaDestino), origen: origenHuella },
        }),
      });
      const data = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        setAviso(typeof data?.error === "string" ? data.error : "No se pudo guardar.");
        return;
      }
      setAvisoOk(true);
      setAviso("Configuración guardada. Sigue igual si recargas esta pantalla.");
      await cargar();
    } catch {
      setAviso("No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function leerNfc() {
    setAviso("");
    setAvisoOk(false);
    try {
      const leido = await leerTarjetaNfc();
      setUid(leido);
      setAvisoOk(true);
      setAviso("Tarjeta leída. Confirma el usuario y enrola.");
    } catch (error) {
      setAvisoOk(false);
      setAviso(error instanceof Error ? error.message : "No se pudo leer la tarjeta.");
    }
  }

  async function enrolarTarjeta(evento: FormEvent) {
    evento.preventDefault();
    setAviso("");
    setAvisoOk(false);
    try {
      const respuesta = await fetch("/api/admin/lectores/nfc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "enrolar", usuario: usuarioNfc, uid }),
      });
      const data = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        setAviso(typeof data?.error === "string" ? data.error : "No se pudo enrolar la tarjeta.");
        return;
      }
      setUid("");
      setAvisoOk(true);
      setAviso("Tarjeta enrolada. No es la contraseña: solo abre el acceso elegido si el lector está activo.");
      await cargar();
    } catch {
      setAviso("No se pudo enrolar la tarjeta.");
    }
  }

  async function quitarTarjeta(usuario: string, tarjeta: string) {
    setAviso("");
    setAvisoOk(false);
    const respuesta = await fetch("/api/admin/lectores/nfc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "quitar", usuario, uid: tarjeta }),
    });
    const data = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      setAviso(typeof data?.error === "string" ? data.error : "No se pudo quitar la tarjeta.");
      return;
    }
    setAvisoOk(true);
    setAviso("Tarjeta quitada. La contraseña de esa persona no cambió.");
    await cargar();
  }

  async function enrolarDedo(evento: FormEvent) {
    evento.preventDefault();
    setAviso("");
    setAvisoOk(false);
    const persona = usuarios.find((item) => item.usuario === usuarioHuella);
    if (!persona) {
      setAviso("Elige un usuario existente.");
      return;
    }
    try {
      const credentialId = await enrolarHuellaEnEquipo(persona.usuario, persona.nombre);
      const respuesta = await fetch("/api/admin/lectores/huella", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "enrolar",
          usuario: persona.usuario,
          credentialId,
          origen: window.location.origin,
        }),
      });
      const data = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        setAviso(typeof data?.error === "string" ? data.error : "No se pudo enrolar la huella.");
        return;
      }
      setAvisoOk(true);
      setAviso("Huella enrolada en este equipo. No sustituye la contraseña.");
      await cargar();
    } catch (error) {
      setAvisoOk(false);
      setAviso(mensajeHuella(error));
    }
  }

  async function quitarDedo(usuario: string, id: string) {
    setAviso("");
    setAvisoOk(false);
    const respuesta = await fetch("/api/admin/lectores/huella", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "quitar", usuario, credentialId: id }),
    });
    const data = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      setAviso(typeof data?.error === "string" ? data.error : "No se pudo quitar la huella.");
      return;
    }
    setAvisoOk(true);
    setAviso("Huella quitada. La contraseña de esa persona no cambió.");
    await cargar();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold text-white tracking-tight">Lectores de acceso</h1>
      <p className="text-sm text-slate-400 mt-2 mb-8">
        Activa el lector NFC o el de huellas para entrar al mostrador, al administrador, o a ambos. El usuario y la
        contraseña siguen disponibles.
      </p>

      {cargando ? <p className="text-emerald-300 mb-6">Cargando lectores...</p> : null}
      {aviso ? (
        <p className={`mb-6 text-sm ${avisoOk ? "text-emerald-300" : "text-red-300"}`} role="status">
          {aviso}
        </p>
      ) : null}

      <form onSubmit={guardar} className="space-y-6">
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-1">Lector NFC</h2>
          <p className="text-sm text-slate-400 mb-5">
            Chrome de escritorio a menudo no trae Web NFC; un lector en modo teclado sirve igual.
          </p>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-200 mb-4">
            <input
              type="checkbox"
              checked={nfcActivo}
              onChange={(evento) => setNfcActivo(evento.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
            Activar lector NFC
          </label>
          <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="destino-nfc">
            Sirve para
          </label>
          <select
            id="destino-nfc"
            value={nfcDestino}
            onChange={(evento) => setNfcDestino(evento.target.value as Destino)}
            className={campo}
          >
            <option value="mostrador">Entrar al mostrador</option>
            <option value="admin">Entrar al administrador</option>
            <option value="ambos">Ambos</option>
          </select>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-1">Lector de huellas</h2>
          <p className="text-sm text-slate-400 mb-5">
            Usa la huella de este equipo (Windows Hello o el lector integrado). Si el navegador no la ofrece, el acceso
            con contraseña no se interrumpe.
          </p>
          {!hayHuella ? (
            <p className="mb-4 text-sm text-amber-200" role="status">
              Este navegador no tiene Web Authentication. No se puede enrolar una huella aquí. Entra con usuario y
              contraseña.
            </p>
          ) : null}
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-200 mb-4">
            <input
              type="checkbox"
              checked={huellaActivo}
              onChange={(evento) => setHuellaActivo(evento.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
            Activar lector de huellas
          </label>
          <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="destino-huella">
            Sirve para
          </label>
          <select
            id="destino-huella"
            value={huellaDestino}
            onChange={(evento) => setHuellaDestino(evento.target.value as Destino)}
            className={campo}
          >
            <option value="mostrador">Entrar al mostrador</option>
            <option value="admin">Entrar al administrador</option>
            <option value="ambos">Ambos</option>
          </select>
        </section>

        <button
          type="submit"
          disabled={guardando || cargando}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold px-5 py-3"
        >
          {guardando ? "Guardando..." : "Guardar lectores"}
        </button>
      </form>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-bold text-white mb-1">Enrolar tarjeta o tag NFC</h2>
        <p className="text-sm text-slate-400 mb-5">
          La vincula a un usuario que ya existe. El identificador no es la contraseña.
        </p>
        <form onSubmit={enrolarTarjeta} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300" htmlFor="usuario-nfc">
            Usuario
          </label>
          <select
            id="usuario-nfc"
            value={usuarioNfc}
            onChange={(evento) => setUsuarioNfc(evento.target.value)}
            className={campo}
            required
          >
            {usuarios.map((item) => (
              <option key={item.usuario} value={item.usuario}>
                {item.nombre} ({item.usuario}) · {etiquetaRol(item.rol)}
              </option>
            ))}
          </select>
          <label className="block text-sm font-semibold text-slate-300" htmlFor="uid-nfc">
            Identificador de la tarjeta
          </label>
          <input
            id="uid-nfc"
            value={uid}
            onChange={(evento) => setUid(evento.target.value)}
            autoComplete="off"
            placeholder="Pega el UID o acércala si el lector escribe como teclado"
            className={campo}
            required
          />
          <div className="flex flex-wrap gap-3">
            {hayNfc ? (
              <button
                type="button"
                onClick={leerNfc}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
              >
                Leer tarjeta NFC
              </button>
            ) : null}
            <button type="submit" className="rounded-xl bg-slate-100 text-slate-950 font-extrabold px-4 py-3 text-sm">
              Enrolar tarjeta
            </button>
          </div>
        </form>
        <ul className="mt-5 space-y-2">
          {usuarios.flatMap((item) =>
            item.nfcUids.map((tarjeta) => (
              <li key={`${item.usuario}-${tarjeta}`} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-300">
                  {item.nombre}: <span className="font-mono text-white">{tarjeta}</span>
                </span>
                <button
                  type="button"
                  onClick={() => quitarTarjeta(item.usuario, tarjeta)}
                  className="text-red-300 font-bold"
                >
                  Quitar
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-bold text-white mb-1">Enrolar huella</h2>
        <p className="text-sm text-slate-400 mb-5">
          Pide la huella en este equipo y la deja ligada al usuario. Un cajero entra al mostrador; solo un
          administrador entra al panel.
        </p>
        <form onSubmit={enrolarDedo} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300" htmlFor="usuario-huella">
            Usuario
          </label>
          <select
            id="usuario-huella"
            value={usuarioHuella}
            onChange={(evento) => setUsuarioHuella(evento.target.value)}
            className={campo}
            required
          >
            {usuarios.map((item) => (
              <option key={item.usuario} value={item.usuario}>
                {item.nombre} ({item.usuario}) · {etiquetaRol(item.rol)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!hayHuella}
            className="rounded-xl bg-slate-100 text-slate-950 font-extrabold px-4 py-3 text-sm disabled:opacity-50"
          >
            Enrolar huella en este equipo
          </button>
        </form>
        <ul className="mt-5 space-y-2">
          {usuarios.flatMap((item) =>
            item.huellas.map((huella) => (
              <li key={huella.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-300">
                  {item.nombre}: huella del {fechaCorta(huella.registradoEn)}
                </span>
                <button type="button" onClick={() => quitarDedo(item.usuario, huella.id)} className="text-red-300 font-bold">
                  Quitar
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
