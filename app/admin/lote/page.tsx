"use client";

import { useEffect, useState } from "react";

type Producto = {
  art_id: string;
  clave: string;
  descripcion: string;
  depto: string;
  tipo: string;
  existencia: number;
  precio_sicar: number;
  precio_ml: number;
  precio_web: number;
  imagenes: Record<string, string | null>;
  descripcion_generada?: string;
  textos?: string[];
  tomas: string[];
  video: string[];
  mercado_libre: string;
  sitio_web: string;
};

const ROLES = [
  ["frente", "Frente"],
  ["detalle", "Detalle"],
  ["lifestyle", "Lifestyle"],
  ["ml", "Cuadrada ML"],
] as const;

function dinero(valor: number) {
  return valor.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export default function LotePage() {
  const [prueba, setPrueba] = useState<Producto[]>([]);
  const [decisiones, setDecisiones] = useState<Record<string, string>>({});
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/sicar/panel", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.conectado) throw new Error(data.error || "SICAR no respondió");
        setPrueba(data.prueba || []);
      })
      .catch((err: Error) => setError(err.message));
    fetch("/api/sicar/lote", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setDecisiones(data.decisiones || {});
        setNotas(data.notas || {});
      })
      .catch(() => {
        setDecisiones({});
        setNotas({});
      });
  }, []);

  const decidir = async (artId: string, estado: "APROBADO" | "RECHAZADO" | "PENDIENTE") => {
    const res = await fetch("/api/sicar/lote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ art_id: artId, estado, nota: notas[artId] || "" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "No se guardó la nota.");
      return;
    }
    setError("");
    setDecisiones(data.decisiones || {});
    setNotas((prev) => ({ ...prev, [artId]: data.notas?.[artId] ?? prev[artId] ?? "" }));
  };

  const estadoGuardado = (artId: string): "APROBADO" | "RECHAZADO" | "PENDIENTE" => {
    const estado = decisiones[artId];
    return estado === "APROBADO" || estado === "RECHAZADO" || estado === "PENDIENTE" ? estado : "PENDIENTE";
  };

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 8px" }}>Lote de prueba: 5 productos</h1>
      <p style={{ color: "#94a3b8", marginTop: 0, lineHeight: 1.5 }}>
        Salen de SICAR. Aprobar o rechazar no publica en Mercado Libre ni en el sitio web. El siguiente paso, cuando este lote quede aprobado, será un lote de 50.
      </p>
      {error && <p style={{ color: "#fecaca" }}>{error}</p>}
      <div style={{ display: "grid", gap: "18px" }}>
        {prueba.map((item) => (
          <article key={item.art_id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.15rem" }}>{item.descripcion}</h2>
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                  {item.clave} · {item.depto} · {item.tipo} · existencia {item.existencia}
                </p>
              </div>
              <strong style={{ color: decisiones[item.art_id] === "APROBADO" ? "#6ee7b7" : decisiones[item.art_id] === "RECHAZADO" ? "#fca5a5" : "#cbd5e1" }}>
                {decisiones[item.art_id] || "PENDIENTE"}
              </strong>
            </div>
            <p style={{ margin: "12px 0" }}>
              SICAR {dinero(item.precio_sicar)} · Mercado Libre {dinero(item.precio_ml)} · Sitio web {dinero(item.precio_web)}
            </p>
            <p style={{ margin: "0 0 12px", color: "#94a3b8", fontSize: "0.85rem" }}>
              SICAR: origen · Mercado Libre: {item.mercado_libre} · Sitio web: {item.sitio_web}
            </p>
            <div style={{ background: "#020617", border: "1px solid #1e293b", borderRadius: "12px", padding: "12px", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "0.9rem", margin: "0 0 6px" }}>Descripción</h3>
              <p style={{ margin: 0, color: "#e2e8f0", fontSize: "0.88rem", lineHeight: 1.45 }}>{item.descripcion_generada || item.descripcion}</p>
              <h3 style={{ fontSize: "0.9rem", margin: "12px 0 6px" }}>Textos</h3>
              <ul style={{ margin: 0, paddingLeft: "18px", color: "#cbd5e1", fontSize: "0.84rem" }}>
                {(item.textos || []).map((texto) => <li key={texto}>{texto}</li>)}
              </ul>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
              {ROLES.map(([rol, etiqueta]) => (
                <figure key={rol} style={{ margin: 0, background: "#020617", borderRadius: "12px", overflow: "hidden", border: "1px solid #1e293b" }}>
                  {item.imagenes?.[rol] ? (
                    <img src={item.imagenes[rol] || ""} alt={`${item.descripcion} ${etiqueta}`} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ height: "140px", display: "grid", placeItems: "center", color: "#64748b", fontSize: "0.8rem" }}>Toma pendiente</div>
                  )}
                  <figcaption style={{ padding: "8px 10px", fontSize: "0.75rem", color: "#cbd5e1" }}>{etiqueta}</figcaption>
                </figure>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "14px" }}>
              <div>
                <h3 style={{ fontSize: "0.9rem", margin: "0 0 6px" }}>Paquete de imágenes</h3>
                <ul style={{ margin: 0, paddingLeft: "18px", color: "#cbd5e1", fontSize: "0.82rem" }}>
                  {item.tomas.map((toma) => <li key={toma}>{toma}</li>)}
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: "0.9rem", margin: "0 0 6px" }}>Guion del video</h3>
                <ol style={{ margin: 0, paddingLeft: "18px", color: "#cbd5e1", fontSize: "0.82rem" }}>
                  {item.video.map((plano) => <li key={plano}>{plano}</li>)}
                </ol>
              </div>
            </div>
            <label style={{ display: "block", marginTop: "14px", fontSize: "0.85rem", color: "#cbd5e1" }}>
              Nota de la foto
              <textarea
                value={notas[item.art_id] || ""}
                onChange={(evento) => setNotas((prev) => ({ ...prev, [item.art_id]: evento.target.value.slice(0, 500) }))}
                placeholder={/sleeping/i.test(item.descripcion) ? "Ejemplo: no se aprueba porque los sleeping son negros." : "Por qué se aprueba o no. Ejemplo: no se aprueba porque los sleeping son negros."}
                rows={3}
                style={{ display: "block", width: "100%", marginTop: "6px", background: "#020617", color: "#fff", border: "1px solid #334155", borderRadius: "8px", padding: "10px", resize: "vertical" }}
              />
            </label>
            <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
              <button type="button" onClick={() => decidir(item.art_id, "APROBADO")} style={{ background: "#10b981", color: "#022c22", border: "none", borderRadius: "8px", padding: "8px 12px", fontWeight: 800, cursor: "pointer" }}>Aprobar</button>
              <button type="button" onClick={() => decidir(item.art_id, "RECHAZADO")} style={{ background: "#7f1d1d", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 12px", fontWeight: 800, cursor: "pointer" }}>Rechazar</button>
              <button type="button" onClick={() => decidir(item.art_id, estadoGuardado(item.art_id))} style={{ background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "8px", padding: "8px 12px", fontWeight: 800, cursor: "pointer" }}>Guardar nota</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
