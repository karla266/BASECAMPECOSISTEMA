"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Estado = "cargando" | "listo" | "error";

export default function AccesoPosPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [configurado, setConfigurado] = useState(false);
  const [estado, setEstado] = useState<Estado>("cargando");
  const [mensaje, setMensaje] = useState("");
  const [mensajeOk, setMensajeOk] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const respuesta = await fetch("/api/pos/acceso", { cache: "no-store" });
        const data = await respuesta.json();
        if (!respuesta.ok) {
          throw new Error(typeof data?.error === "string" ? data.error : "No se pudo leer el acceso.");
        }
        if (!activo) return;
        setUsuario(typeof data.usuario === "string" ? data.usuario : "");
        setConfigurado(Boolean(data.configurado));
        setEstado("listo");
      } catch (error) {
        if (!activo) return;
        setEstado("error");
        setMensajeOk(false);
        setMensaje(error instanceof Error ? error.message : "El punto de venta no está disponible.");
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, []);

  async function guardar(event: React.FormEvent) {
    event.preventDefault();
    setMensaje("");
    setMensajeOk(false);
    const usuarioLimpio = usuario.trim();
    if (password !== confirmacion) {
      setMensaje("La confirmación no coincide.");
      return;
    }
    if (!configurado && password.length === 0) {
      setMensaje("Asigna una contraseña para activar el mostrador.");
      return;
    }
    setGuardando(true);
    try {
      const respuesta = await fetch("/api/pos/acceso", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: usuarioLimpio, password }),
      });
      const data = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "No se pudo guardar.");
      }
      setUsuario(typeof data.usuario === "string" ? data.usuario : usuarioLimpio);
      setConfigurado(true);
      setPassword("");
      setConfirmacion("");
      setMensajeOk(true);
      setMensaje(password ? "Acceso guardado. La contraseña quedó reemplazada y no se vuelve a mostrar." : "Usuario actualizado. La contraseña anterior se mantiene.");
    } catch (error) {
      setMensajeOk(false);
      setMensaje(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ padding: "32px", maxWidth: "760px", margin: "0 auto", width: "100%", minHeight: "100vh", backgroundColor: "#090d16", color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link href="/admin/settings" style={{ color: "#34d399", fontSize: "0.875rem", textDecoration: "none" }}>
          ← Ajustes
        </Link>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.025em", margin: "12px 0 8px" }}>
          Acceso al punto de venta
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>
          Este usuario y esta contraseña son los que pide el mostrador antes de cobrar. El PIN de las terminales de cobro sigue aparte.
        </p>
      </div>

      <form onSubmit={guardar} style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "24px" }}>
        {estado === "cargando" && <p style={{ color: "#94a3b8", margin: 0 }}>Cargando acceso del mostrador...</p>}
        {estado === "error" && (
          <p style={{ color: "#fda4af", margin: 0 }}>{mensaje || "No se pudo conectar con el punto de venta."}</p>
        )}
        {estado === "listo" && (
          <>
            <p style={{ margin: "0 0 16px", color: configurado ? "#6ee7b7" : "#fcd34d", fontSize: "0.875rem", fontWeight: 700 }}>
              {configurado ? "Contraseña asignada. No se muestra." : "Todavía no hay contraseña. Hay que asignarla para que el cajero pueda entrar."}
            </p>
            <label htmlFor="usuario-pos" style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, marginBottom: "6px" }}>
              Usuario del mostrador
            </label>
            <input
              id="usuario-pos"
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              autoComplete="off"
              maxLength={32}
              required
              style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 14px", color: "#fff", marginBottom: "16px" }}
            />
            <label htmlFor="clave-pos" style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, marginBottom: "6px" }}>
              {configurado ? "Nueva contraseña" : "Contraseña"}
            </label>
            <input
              id="clave-pos"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder={configurado ? "Déjala vacía para conservar la actual" : "Mínimo 6 caracteres"}
              style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 14px", color: "#fff", marginBottom: "16px" }}
            />
            <label htmlFor="clave-pos-2" style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, marginBottom: "6px" }}>
              Confirmar contraseña
            </label>
            <input
              id="clave-pos-2"
              type="password"
              value={confirmacion}
              onChange={(event) => setConfirmacion(event.target.value)}
              autoComplete="new-password"
              style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 14px", color: "#fff", marginBottom: "16px" }}
            />
            {mensaje && (
              <p style={{ color: mensajeOk ? "#6ee7b7" : "#fda4af", fontSize: "0.875rem", fontWeight: 600, margin: "0 0 16px" }}>
                {mensaje}
              </p>
            )}
            <button
              type="submit"
              disabled={guardando}
              style={{ backgroundColor: "#10b981", color: "#022c22", padding: "12px 16px", borderRadius: "8px", fontWeight: 800, border: "none", cursor: guardando ? "wait" : "pointer" }}
            >
              {guardando ? "Guardando..." : "Guardar acceso"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
