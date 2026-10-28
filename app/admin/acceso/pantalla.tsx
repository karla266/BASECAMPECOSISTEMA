"use client";

import { FormEvent, useEffect, useState } from "react";

type Usuario = {
  usuario: string;
  nombre: string;
  rol?: string;
  horario?: string;
  creadoEn: string;
};

function etiquetaRol(rol: string | undefined) {
  if (rol === "admin") return "Administrador";
  if (rol === "mostrador") return "Mostrador";
  if (rol === "trabajador") return "Trabajador";
  return "Cajero";
}

function etiquetaHorario(horario: string | undefined) {
  if (horario === "matutino") return "Matutino";
  if (horario === "vespertino") return "Vespertino";
  return "Completo";
}

const campo =
  "w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500";

export default function PantallaAcceso() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmaClave, setConfirmaClave] = useState("");
  const [usuarioNuevo, setUsuarioNuevo] = useState("");
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [rolNuevo, setRolNuevo] = useState("cajero");
  const [horarioNuevo, setHorarioNuevo] = useState("completo");
  const [claveNueva, setClaveNueva] = useState("");
  const [confirmaUsuario, setConfirmaUsuario] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sesion, setSesion] = useState("");
  const [avisoClave, setAvisoClave] = useState("");
  const [claveOk, setClaveOk] = useState(false);
  const [avisoUsuario, setAvisoUsuario] = useState("");
  const [usuarioOk, setUsuarioOk] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardandoClave, setGuardandoClave] = useState(false);
  const [creando, setCreando] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  async function cargar() {
    const respuesta = await fetch("/api/admin/usuarios", { cache: "no-store" });
    const data = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      throw new Error(typeof data?.error === "string" ? data.error : "No se pudo cargar.");
    }
    setSesion(typeof data?.actual?.usuario === "string" ? data.actual.usuario : "");
    setUsuarios(Array.isArray(data?.usuarios) ? data.usuarios : []);
  }

  useEffect(() => {
    let vivo = true;
    cargar()
      .catch((error) => {
        if (!vivo) return;
        setAvisoUsuario(error instanceof Error ? error.message : "No se pudo cargar.");
        setUsuarioOk(false);
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  async function guardarClave(evento: FormEvent) {
    evento.preventDefault();
    setClaveOk(false);
    if (nueva !== confirmaClave) {
      setAvisoClave("La confirmación no coincide con la contraseña nueva.");
      return;
    }
    setGuardandoClave(true);
    setAvisoClave("");
    try {
      const respuesta = await fetch("/api/admin/clave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual, nueva }),
      });
      const data = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        setAvisoClave(typeof data?.error === "string" ? data.error : "No se pudo guardar.");
        return;
      }
      setActual("");
      setNueva("");
      setConfirmaClave("");
      setClaveOk(true);
      setAvisoClave("Contraseña actualizada. La anterior ya no sirve para entrar.");
    } catch {
      setAvisoClave("No se pudo guardar.");
    } finally {
      setGuardandoClave(false);
    }
  }

  async function crear(evento: FormEvent) {
    evento.preventDefault();
    setUsuarioOk(false);
    if (claveNueva !== confirmaUsuario) {
      setAvisoUsuario("La confirmación no coincide con la contraseña del usuario.");
      return;
    }
    setCreando(true);
    setAvisoUsuario("");
    try {
      const respuesta = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: usuarioNuevo,
          nombre: nombreNuevo,
          clave: claveNueva,
          rol: rolNuevo,
          horario: horarioNuevo,
        }),
      });
      const data = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        setAvisoUsuario(typeof data?.error === "string" ? data.error : "No se pudo crear.");
        return;
      }
      setUsuarioNuevo("");
      setNombreNuevo("");
      setRolNuevo("cajero");
      setHorarioNuevo("completo");
      setClaveNueva("");
      setConfirmaUsuario("");
      setUsuarioOk(true);
      setAvisoUsuario("Usuario creado. Ya puede entrar al panel con su usuario y contraseña.");
      await cargar();
    } catch {
      setAvisoUsuario("No se pudo crear.");
    } finally {
      setCreando(false);
    }
  }

  async function salir() {
    setSaliendo(true);
    try {
      await fetch("/api/admin/salir", { method: "POST" });
    } finally {
      window.location.assign("/admin/login");
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Usuarios y contraseña</h1>
          <p className="text-sm text-slate-400 mt-2">
            Cambia la contraseña de quien está en sesión
            {sesion ? ` (${sesion})` : ""} y da de alta personas sin borrar a las que ya existen.
          </p>
        </div>
        <button
          type="button"
          onClick={salir}
          disabled={saliendo}
          className="shrink-0 rounded-xl border border-red-500/40 text-red-300 hover:bg-red-500/10 px-4 py-2 text-sm font-bold disabled:opacity-60"
        >
          {saliendo ? "Saliendo..." : "Salir"}
        </button>
      </div>

      <form
        onSubmit={guardarClave}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6"
      >
        <h2 className="text-xl font-bold text-white mb-1">Cambiar contraseña</h2>
        <p className="text-sm text-slate-400 mb-5">
          Pide la contraseña actual y la nueva. Al guardar, la anterior deja de servir.
        </p>
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="clave-actual">
          Contraseña actual
        </label>
        <input
          id="clave-actual"
          type="password"
          autoComplete="current-password"
          value={actual}
          onChange={(evento) => setActual(evento.target.value)}
          className={`${campo} mb-4`}
          required
        />
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="clave-nueva">
          Contraseña nueva
        </label>
        <input
          id="clave-nueva"
          type="password"
          autoComplete="new-password"
          value={nueva}
          onChange={(evento) => setNueva(evento.target.value)}
          className={`${campo} mb-4`}
          required
        />
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="clave-confirma">
          Confirmar contraseña nueva
        </label>
        <input
          id="clave-confirma"
          type="password"
          autoComplete="new-password"
          value={confirmaClave}
          onChange={(evento) => setConfirmaClave(evento.target.value)}
          className={`${campo} mb-5`}
          required
        />
        {avisoClave ? (
          <p className={`mb-4 text-sm ${claveOk ? "text-emerald-300" : "text-red-300"}`} role="status">
            {avisoClave}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={guardandoClave}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold px-5 py-3"
        >
          {guardandoClave ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>

      <form onSubmit={crear} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Nuevo usuario</h2>
        <p className="text-sm text-slate-400 mb-5">
          Nombre, usuario, rol y horario. Crear uno nuevo lo suma a la lista. Solo el rol administrador abre el botón Panel Admin del mostrador. La contraseña no se vuelve a mostrar.
        </p>
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="usuario-nuevo">
          Usuario
        </label>
        <input
          id="usuario-nuevo"
          autoComplete="off"
          value={usuarioNuevo}
          onChange={(evento) => setUsuarioNuevo(evento.target.value)}
          className={`${campo} mb-4`}
          required
        />
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="nombre-nuevo">
          Nombre
        </label>
        <input
          id="nombre-nuevo"
          autoComplete="name"
          value={nombreNuevo}
          onChange={(evento) => setNombreNuevo(evento.target.value)}
          className={`${campo} mb-4`}
          required
        />
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="rol-nuevo">
          Rol
        </label>
        <select
          id="rol-nuevo"
          value={rolNuevo}
          onChange={(evento) => setRolNuevo(evento.target.value)}
          className={`${campo} mb-4`}
        >
          <option value="admin">Administrador</option>
          <option value="cajero">Cajero</option>
        </select>
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="horario-nuevo">
          Horario
        </label>
        <select
          id="horario-nuevo"
          value={horarioNuevo}
          onChange={(evento) => setHorarioNuevo(evento.target.value)}
          className={`${campo} mb-4`}
        >
          <option value="matutino">Matutino</option>
          <option value="vespertino">Vespertino</option>
          <option value="completo">Completo</option>
        </select>
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="clave-usuario">
          Contraseña
        </label>
        <input
          id="clave-usuario"
          type="password"
          autoComplete="new-password"
          value={claveNueva}
          onChange={(evento) => setClaveNueva(evento.target.value)}
          className={`${campo} mb-4`}
          required
        />
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="confirma-usuario">
          Confirmar contraseña
        </label>
        <input
          id="confirma-usuario"
          type="password"
          autoComplete="new-password"
          value={confirmaUsuario}
          onChange={(evento) => setConfirmaUsuario(evento.target.value)}
          className={`${campo} mb-5`}
          required
        />
        {avisoUsuario ? (
          <p className={`mb-4 text-sm ${usuarioOk ? "text-emerald-300" : "text-red-300"}`} role="status">
            {avisoUsuario}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={creando}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold px-5 py-3"
        >
          {creando ? "Creando..." : "Crear usuario"}
        </button>
      </form>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Usuarios con acceso</h2>
        {cargando ? (
          <p className="text-sm text-slate-400">Cargando...</p>
        ) : usuarios.length === 0 ? (
          <p className="text-sm text-slate-400">Todavía no hay usuarios.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {usuarios.map((item) => (
              <li key={item.usuario} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-white">{item.nombre}</p>
                  <p className="text-sm text-slate-400">{item.usuario}</p>
                  <p className="text-xs text-slate-500">
                    {etiquetaRol(item.rol)} · {etiquetaHorario(item.horario)}
                    {item.rol === "admin" ? " · abre Panel Admin del mostrador" : " · no abre Panel Admin del mostrador"}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {Number.isNaN(Date.parse(item.creadoEn))
                    ? ""
                    : new Date(item.creadoEn).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
