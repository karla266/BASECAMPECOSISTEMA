"use client";

import { useEffect, useState } from "react";
import { MULTISERVICIOS, TONOS, type MultiservicioConfig, type TonoMultiservicio } from "@/lib/multiservicios";

const campo = {
  display: "block",
  width: "100%",
  marginTop: "6px",
  background: "#020617",
  color: "#fff",
  border: "1px solid #334155",
  borderRadius: "8px",
  padding: "10px",
} as const;

function copiaInicial(): Record<string, MultiservicioConfig> {
  return Object.fromEntries(
    MULTISERVICIOS.map((item) => [item.id, { ...item.config, strict_guardrails: [...item.config.strict_guardrails] }])
  );
}

export default function MultiserviciosPage() {
  const [elegido, setElegido] = useState(MULTISERVICIOS[0].id);
  const [configs, setConfigs] = useState<Record<string, MultiservicioConfig>>(copiaInicial);
  const [aviso, setAviso] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetch("/api/multiservicios", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.servicios || typeof data.servicios !== "object") return;
        setConfigs((prev) => {
          const siguiente = { ...prev };
          for (const item of MULTISERVICIOS) {
            const guardado = data.servicios[item.id];
            if (guardado && typeof guardado === "object") siguiente[item.id] = guardado;
          }
          return siguiente;
        });
      })
      .catch(() => setAviso("No se pudieron leer las configuraciones guardadas."));
  }, []);

  const servicio = MULTISERVICIOS.find((item) => item.id === elegido) || MULTISERVICIOS[0];
  const config = configs[servicio.id] || servicio.config;

  function cambiar<K extends keyof MultiservicioConfig>(campoConfig: K, valor: MultiservicioConfig[K]) {
    setConfigs((prev) => ({
      ...prev,
      [servicio.id]: { ...(prev[servicio.id] || servicio.config), [campoConfig]: valor },
    }));
  }

  function cambiarLimite(indice: number, valor: string) {
    const lista = [...config.strict_guardrails];
    lista[indice] = valor;
    cambiar("strict_guardrails", lista);
  }

  function quitarLimite(indice: number) {
    cambiar(
      "strict_guardrails",
      config.strict_guardrails.filter((_, actual) => actual !== indice)
    );
  }

  function agregarLimite() {
    cambiar("strict_guardrails", [...config.strict_guardrails, ""]);
  }

  async function guardar() {
    setGuardando(true);
    setAviso("Guardando este multiservicio...");
    const payload: MultiservicioConfig = {
      ...config,
      service_id: config.service_id.trim(),
      strict_guardrails: config.strict_guardrails.map((item) => item.trim()).filter(Boolean),
    };
    try {
      const respuesta = await fetch("/api/multiservicios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || "No se guardó.");
      if (data?.servicios) {
        setConfigs((prev) => {
          const siguiente = { ...prev };
          for (const item of MULTISERVICIOS) {
            if (data.servicios[item.id]) siguiente[item.id] = data.servicios[item.id];
          }
          return siguiente;
        });
      }
      setAviso(`${servicio.titulo} guardado. Este ajuste no cobra ni imprime ticket en el punto de venta.`);
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se guardó la configuración.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ margin: "0 0 8px", fontSize: "1.6rem", fontWeight: 800 }}>Multiservicios</h1>
      <p style={{ margin: "0 0 18px", color: "#94a3b8", maxWidth: "720px", lineHeight: 1.5 }}>
        Seis servicios aparte del cobro del mostrador. Aquí solo se edita cómo responde cada uno. No se manda un cargo ni un ticket.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        {MULTISERVICIOS.map((item) => {
          const activo = item.id === servicio.id;
          const encendido = configs[item.id]?.is_active !== false;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setElegido(item.id);
                setAviso("");
              }}
              style={{
                textAlign: "left",
                background: activo ? "#1e293b" : "#0f172a",
                border: activo ? "1px solid #10b981" : "1px solid #1e293b",
                borderRadius: "14px",
                padding: "16px",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <strong>{item.titulo}</strong>
              <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>{item.texto}</p>
              <p style={{ margin: "10px 0 0", color: encendido ? "#6ee7b7" : "#fca5a5", fontSize: "0.75rem", fontWeight: 800 }}>
                {encendido ? "Activo" : "Apagado"}
              </p>
            </button>
          );
        })}
      </div>

      <section style={{ marginTop: "18px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "18px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "1.15rem" }}>{servicio.titulo}</h2>
        <p style={{ margin: "0 0 14px", color: "#94a3b8", fontSize: "0.85rem" }}>{servicio.texto}</p>
        <div style={{ display: "grid", gap: "14px" }}>
          <label style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>
            Identificador
            <input value={config.service_id} onChange={(evento) => cambiar("service_id", evento.target.value)} style={campo} />
          </label>
          <label style={{ display: "flex", gap: "10px", alignItems: "center", color: "#e2e8f0" }}>
            <input type="checkbox" checked={config.is_active} onChange={(evento) => cambiar("is_active", evento.target.checked)} />
            Servicio activo
          </label>
          <label style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>
            Precio base
            <input
              type="number"
              step="0.01"
              value={config.base_price}
              onChange={(evento) => cambiar("base_price", Number(evento.target.value))}
              style={campo}
            />
          </label>
          <label style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>
            Instrucciones
            <textarea
              value={config.system_prompt}
              rows={5}
              onChange={(evento) => cambiar("system_prompt", evento.target.value)}
              style={{ ...campo, resize: "vertical" }}
            />
          </label>
          <label style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>
            Tono
            <select
              value={config.tone}
              onChange={(evento) => cambiar("tone", evento.target.value as TonoMultiservicio)}
              style={campo}
            >
              {TONOS.map((tono) => (
                <option key={tono} value={tono}>
                  {tono}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", gap: "10px", alignItems: "center", color: "#e2e8f0" }}>
            <input
              type="checkbox"
              checked={config.allow_stock_query}
              onChange={(evento) => cambiar("allow_stock_query", evento.target.checked)}
            />
            Puede consultar existencias
          </label>
          <label style={{ display: "flex", gap: "10px", alignItems: "center", color: "#e2e8f0" }}>
            <input
              type="checkbox"
              checked={config.allow_price_quote}
              onChange={(evento) => cambiar("allow_price_quote", evento.target.checked)}
            />
            Puede cotizar precio
          </label>
          <div>
            <p style={{ margin: "0 0 8px", color: "#cbd5e1", fontSize: "0.85rem" }}>Límites</p>
            <div style={{ display: "grid", gap: "8px" }}>
              {config.strict_guardrails.map((regla, indice) => (
                <div key={`${servicio.id}-${indice}`} style={{ display: "flex", gap: "8px" }}>
                  <input value={regla} onChange={(evento) => cambiarLimite(indice, evento.target.value)} style={{ ...campo, marginTop: 0 }} />
                  <button
                    type="button"
                    onClick={() => quitarLimite(indice)}
                    style={{ background: "#1e293b", color: "#fecaca", border: "1px solid #334155", borderRadius: "8px", padding: "0 12px", cursor: "pointer" }}
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={agregarLimite}
              style={{ marginTop: "8px", background: "transparent", color: "#6ee7b7", border: "1px solid #065f46", borderRadius: "8px", padding: "8px 12px", cursor: "pointer" }}
            >
              Agregar límite
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          style={{ marginTop: "16px", background: "#10b981", color: "#022c22", border: "none", borderRadius: "8px", padding: "10px 14px", fontWeight: 800, cursor: guardando ? "default" : "pointer" }}
        >
          {guardando ? "Guardando..." : "Guardar configuración"}
        </button>
        {aviso && <p style={{ color: "#e2e8f0", margin: "12px 0 0" }}>{aviso}</p>}
      </section>
    </div>
  );
}
