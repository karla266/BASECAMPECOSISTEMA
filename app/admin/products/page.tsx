"use client";

import React, { useEffect, useState } from "react";
import PosPhotoCaptureModal from "@/components/PosPhotoCaptureModal";

type Producto = {
  art_id: string;
  clave: string;
  descripcion: string;
  depto: string;
  categoria: string;
  existencia: number;
  tipo: string;
  precio_sicar: number;
  precio_ml: number;
  precio_web: number;
  imagenes?: Record<string, string | null>;
};

function fotoDe(item: Producto) {
  const imagenes = item.imagenes || {};
  return imagenes.frente || imagenes.detalle || imagenes.lifestyle || imagenes.ml || "";
}

function dinero(valor: number) {
  return valor.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export default function AdminProductsPage() {
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);
  const [fotoRota, setFotoRota] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [dismissedSkus, setDismissedSkus] = useState<string[]>([]);
  const [capturedBySku, setCapturedBySku] = useState<Record<string, string>>({});

  function skuDe(item: Producto): string {
    return String(item.clave || item.art_id).trim().toUpperCase();
  }

  function fotoEfectiva(item: Producto): string {
    const sku = skuDe(item);
    return capturedBySku[sku] || fotoDe(item);
  }

  useEffect(() => {
    if (!seleccionado) {
      setShowCaptureModal(false);
      return;
    }
    const sku = skuDe(seleccionado);
    const sinFoto = !fotoEfectiva(seleccionado) || fotoRota;
    if (sinFoto && !dismissedSkus.includes(sku)) {
      setShowCaptureModal(true);
    } else {
      setShowCaptureModal(false);
    }
  }, [seleccionado, fotoRota, capturedBySku, dismissedSkus]);

  useEffect(() => {
    const control = new AbortController();
    const timer = setTimeout(() => {
      setCargando(true);
      const query = busqueda.trim() ? `?q=${encodeURIComponent(busqueda.trim())}` : "";
      fetch(`/api/sicar/panel${query}`, { cache: "no-store", signal: control.signal })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok || !data.conectado) throw new Error(data.error || "SICAR no respondió");
          setProductos(data.productos || []);
          setError("");
        })
        .catch((err: Error) => {
          if (err.name === "AbortError") return;
          setError(err.message || "No se pudo leer SICAR");
          setProductos([]);
        })
        .finally(() => setCargando(false));
    }, 200);
    return () => {
      clearTimeout(timer);
      control.abort();
    };
  }, [busqueda]);

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 8px" }}>Catálogo SICAR</h1>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.9rem" }}>
          Precio de venta en SICAR. Mercado Libre es 15% más. El sitio web es 15% menos que Mercado Libre. Nada de esta lista está publicado.
        </p>
      </div>
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar en SICAR por nombre, clave o departamento"
        style={{ width: "100%", maxWidth: "520px", background: "#020617", color: "#fff", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}
      />
      {error && <p style={{ color: "#fecaca" }}>{error}</p>}
      {cargando && <p style={{ color: "#94a3b8" }}>Leyendo SICAR...</p>}
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, overflowX: "auto", border: "1px solid #1e293b", borderRadius: "14px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ color: "#94a3b8", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Producto</th>
                <th style={{ padding: "12px" }}>Foto</th>
                <th style={{ padding: "12px" }}>Tipo</th>
                <th style={{ padding: "12px" }}>Existencia</th>
                <th style={{ padding: "12px" }}>SICAR</th>
                <th style={{ padding: "12px" }}>Mercado Libre</th>
                <th style={{ padding: "12px" }}>Sitio web</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((item) => {
                const activo = seleccionado?.art_id === item.art_id;
                const conFoto = Boolean(fotoEfectiva(item));
                return (
                  <tr
                    key={item.art_id}
                    onClick={() => {
                      setSeleccionado(item);
                      setFotoRota(false);
                    }}
                    style={{ borderTop: "1px solid #1e293b", cursor: "pointer", background: activo ? "#1e293b" : "transparent" }}
                  >
                    <td style={{ padding: "12px" }}>
                      <strong>{item.descripcion}</strong>
                      <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{item.clave} · {item.depto}</div>
                    </td>
                    <td style={{ padding: "12px", color: conFoto ? "#6ee7b7" : "#fca5a5", fontWeight: 700 }}>
                      {conFoto ? "Con foto" : "Sin foto"}
                    </td>
                    <td style={{ padding: "12px" }}>{item.tipo}</td>
                    <td style={{ padding: "12px" }}>{item.existencia}</td>
                    <td style={{ padding: "12px" }}>{dinero(item.precio_sicar)}</td>
                    <td style={{ padding: "12px", color: "#fbbf24" }}>{dinero(item.precio_ml)}</td>
                    <td style={{ padding: "12px", color: "#6ee7b7" }}>{dinero(item.precio_web)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <aside style={{ width: "280px", flexShrink: 0, position: "sticky", top: "16px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "14px" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: "0.95rem" }}>Foto del producto</h2>
          {seleccionado ? (
            <>
              <div style={{ height: "220px", borderRadius: "12px", overflow: "hidden", background: "#020617", border: "1px solid #1e293b", display: "grid", placeItems: "center" }}>
                {fotoEfectiva(seleccionado) && !fotoRota ? (
                  <img
                    src={fotoEfectiva(seleccionado)}
                    alt={seleccionado.descripcion}
                    onError={() => setFotoRota(true)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ color: "#fca5a5", fontWeight: 800 }}>Sin foto</span>
                )}
              </div>
              <p style={{ margin: "12px 0 4px", fontWeight: 800 }}>{seleccionado.descripcion}</p>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.8rem" }}>{seleccionado.clave} · {seleccionado.depto}</p>
              <p style={{ margin: "10px 0", color: fotoEfectiva(seleccionado) && !fotoRota ? "#6ee7b7" : "#fca5a5", fontWeight: 700 }}>
                {fotoEfectiva(seleccionado) && !fotoRota ? "Ya tiene foto" : "Falta sacarle foto"}
              </p>
              <button
                type="button"
                onClick={() => setShowCaptureModal(true)}
                style={{ display: "inline-block", background: "#10b981", color: "#022c22", borderRadius: "8px", padding: "8px 12px", fontWeight: 800, textDecoration: "none", border: "none", cursor: "pointer" }}
              >
                Abrir captura en mostrador
              </button>
            </>
          ) : (
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>Selecciona un producto para ver si ya tiene foto y cuál falta por tomar.</p>
          )}
        </aside>
      </div>
      {showCaptureModal && seleccionado ? (
        <PosPhotoCaptureModal
          sku={skuDe(seleccionado)}
          productName={seleccionado.descripcion}
          onClose={() => {
            const sku = skuDe(seleccionado);
            setDismissedSkus((current) => [...new Set([...current, sku])]);
            setShowCaptureModal(false);
          }}
          onSaved={(url) => {
            const sku = skuDe(seleccionado);
            setCapturedBySku((current) => ({ ...current, [sku]: url }));
            setFotoRota(false);
            setShowCaptureModal(false);
          }}
        />
      ) : null}
    </div>
  );
}
