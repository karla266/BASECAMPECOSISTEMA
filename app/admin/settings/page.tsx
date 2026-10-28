"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type ProductoEtiqueta = {
  sku: string;
  nombre: string;
  precio: number;
  codigo_barras: string;
};

type ImpresoraLocal = {
  name: string;
  portName: string;
  isDefault: boolean;
};

export default function AdminSettingsPage() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [aviso, setAviso] = useState("");
  const [impresoras, setImpresoras] = useState<ImpresoraLocal[]>([]);
  const [ticketPrinter, setTicketPrinter] = useState("");
  const [labelPrinter, setLabelPrinter] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [origen, setOrigen] = useState("local");
  const [productos, setProductos] = useState<ProductoEtiqueta[]>([]);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [avisoImpresion, setAvisoImpresion] = useState("");
  const [preview, setPreview] = useState("");
  const [auditoriaFoto, setAuditoriaFoto] = useState(false);
  const [avisoAuditoria, setAvisoAuditoria] = useState("");

  useEffect(() => {
    void cargarImpresoras();
    void cargarAuditoria();
  }, []);

  async function cargarAuditoria() {
    try {
      const respuesta = await fetch("/api/pos/auditoria-foto", { cache: "no-store" });
      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || "No se pudo leer la auditoría.");
      setAuditoriaFoto(Boolean(data.activa));
    } catch (error) {
      setAvisoAuditoria(error instanceof Error ? error.message : "No se pudo leer la auditoría de foto.");
    }
  }

  async function cambiarAuditoria(activa: boolean) {
    const anterior = auditoriaFoto;
    setAuditoriaFoto(activa);
    setAvisoAuditoria("Guardando la casilla...");
    try {
      const respuesta = await fetch("/api/pos/auditoria-foto", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa }),
      });
      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || "No se guardó la auditoría.");
      setAuditoriaFoto(Boolean(data.activa));
      setAvisoAuditoria(data.activa
        ? "Auditoría activa. El mostrador pide foto en cada venta, aunque el producto ya tenga foto."
        : "Auditoría apagada. Si el producto ya tiene foto, el mostrador no pide otra al cobrar.");
    } catch (error) {
      setAuditoriaFoto(anterior);
      setAvisoAuditoria(error instanceof Error ? error.message : "No se guardó la auditoría de foto.");
    }
  }

  async function cargarImpresoras() {
    try {
      const respuesta = await fetch("/api/impresoras", { cache: "no-store" });
      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || "No se pudieron leer las impresoras.");
      const lista = Array.isArray(data.printers)
        ? data.printers.filter((item: ImpresoraLocal) => item && typeof item.name === "string")
        : [];
      setImpresoras(lista);
      setTicketPrinter(typeof data.ticketPrinter === "string" ? data.ticketPrinter : "");
      setLabelPrinter(typeof data.labelPrinter === "string" ? data.labelPrinter : "");
      setAvisoImpresion(lista.length ? "" : "No hay impresoras instaladas en este equipo.");
    } catch (error) {
      setAvisoImpresion(error instanceof Error ? error.message : "No se pudieron leer las impresoras.");
    }
  }

  function opcionesImpresora(actual: string, prefijo: string) {
    const lista = [...impresoras];
    if (actual && !lista.some((item) => item.name === actual)) {
      lista.unshift({ name: actual, portName: "", isDefault: false });
    }
    return lista.map((impresora) => ({
      ...impresora,
      key: `${prefijo}-${impresora.name}`,
      etiqueta: `${impresora.name}${impresora.portName ? ` (${impresora.portName})` : ""}${impresora.isDefault ? " · predeterminada" : ""}`,
    }));
  }

  async function guardarImpresoras() {
    setAvisoImpresion("Guardando impresoras...");
    try {
      const respuesta = await fetch("/api/impresoras", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketPrinter, labelPrinter }),
      });
      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || "No se guardaron las impresoras.");
      setTicketPrinter(typeof data.ticketPrinter === "string" ? data.ticketPrinter : ticketPrinter);
      setLabelPrinter(typeof data.labelPrinter === "string" ? data.labelPrinter : labelPrinter);
      setAvisoImpresion("Impresoras guardadas. El mostrador usa la de tickets y la de etiquetas por separado, sin que el cajero las cambie.");
    } catch (error) {
      setAvisoImpresion(error instanceof Error ? error.message : "No se guardaron las impresoras.");
    }
  }

  async function buscarProductos() {
    setAvisoImpresion("Buscando productos...");
    try {
      const respuesta = await fetch(`/api/pos/impresion?q=${encodeURIComponent(busqueda)}&source=${encodeURIComponent(origen)}`, { cache: "no-store" });
      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || "No se pudieron leer los productos.");
      setProductos(Array.isArray(data.items) ? data.items : []);
      setElegidos([]);
      setAvisoImpresion("");
    } catch (error) {
      setAvisoImpresion(error instanceof Error ? error.message : "No se pudieron leer los productos.");
    }
  }

  function alternar(sku: string) {
    setElegidos((actual) => actual.includes(sku) ? actual.filter((item) => item !== sku) : [...actual, sku]);
  }

  async function imprimirEtiquetas() {
    if (!elegidos.length) {
      setAvisoImpresion("Elige al menos un producto.");
      return;
    }
    setAvisoImpresion("Preparando la tira de etiquetas...");
    setPreview("");
    try {
      const respuesta = await fetch("/api/pos/impresion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skus: elegidos, source: origen }),
      });
      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || "No se pudieron imprimir las etiquetas.");
      setAvisoImpresion(data.message || "Listo.");
      setPreview(data.preview_url || "");
    } catch (error) {
      setAvisoImpresion(error instanceof Error ? error.message : "No se pudieron imprimir las etiquetas.");
    }
  }

  const abrirAplicacion = async () => {
    setAviso("Abriendo la ventana de la aplicación...");
    try {
      const respuesta = await fetch("/api/pos/ventana", { method: "POST" });
      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || "No se pudo abrir.");
      setAviso("Mostrador abierto como aplicación.");
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se pudo abrir.");
    }
  };

  const abrirPanelAplicacion = async () => {
    setAviso("Abriendo el panel en su propia ventana...");
    try {
      const respuesta = await fetch("/api/admin/ventana", { method: "POST" });
      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || "No se pudo abrir el panel.");
      setAviso("El panel quedó abierto como aplicación, en una ventana distinta a la del mostrador.");
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se pudo abrir el panel.");
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto', width: '100%', minHeight: '100vh', backgroundColor: '#090d16', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.025em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>⚙️</span> Ajustes
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Configuración global del entorno operativo.
        </p>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🛡️</span> Seguridad y Accesos
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 4px 0' }}>Autenticación 2FA</h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Requerir verificación de dos pasos para este tenant.</p>
            </div>
            
            <button 
              onClick={() => setTwoFactor(!twoFactor)}
              style={{
                width: '48px',
                height: '24px',
                backgroundColor: twoFactor ? '#10b981' : '#334155',
                borderRadius: '9999px',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <div 
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#fff',
                  borderRadius: '9999px',
                  position: 'absolute',
                  top: '4px',
                  left: twoFactor ? '28px' : '4px',
                  transition: 'left 0.2s'
                }}
              />
            </button>
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px", backgroundColor: "#020617", borderRadius: "8px", border: "1px solid #1e293b", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={auditoriaFoto}
              onChange={(evento) => cambiarAuditoria(evento.target.checked)}
              style={{ width: "18px", height: "18px", marginTop: "2px" }}
            />
            <span>
              <span style={{ display: "block", fontSize: "1rem", fontWeight: "bold", color: "#fff" }}>Auditoría foto de venta</span>
              <span style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginTop: "4px" }}>
                Si está marcada, el punto de venta pide foto al cobrar aunque el producto ya tenga foto. Si está desmarcada, solo pide foto cuando todavía no tiene.
              </span>
            </span>
          </label>
          {avisoAuditoria && <p style={{ color: "#e2e8f0", margin: 0 }}>{avisoAuditoria}</p>}
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>
          Acceso al punto de venta
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 16px 0' }}>
          Asigna el usuario y la contraseña con los que el cajero entra al mostrador.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/admin/acceso-pos"
            style={{ display: 'inline-block', backgroundColor: '#10b981', color: '#022c22', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.875rem', textDecoration: 'none' }}
          >
            Asignar usuario y contraseña
          </Link>
          <button type="button" onClick={abrirAplicacion} style={{ backgroundColor: '#0ea5e9', color: '#fff', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
            Abrir mostrador como aplicación
          </button>
          <button type="button" onClick={abrirPanelAplicacion} style={{ backgroundColor: '#f59e0b', color: '#1c1917', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
            Abrir panel como aplicación
          </button>
        </div>
        {aviso && <p style={{ color: '#6ee7b7', margin: '14px 0 0' }}>{aviso}</p>}
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>Impresoras del mostrador</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 16px 0' }}>
          El cajero no elige impresora. Aquí se guarda la de tickets y, si hace falta, otra para etiquetas de 27 x 13 mm.
        </p>
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Impresora de tickets
            <select value={ticketPrinter} onChange={(evento) => setTicketPrinter(evento.target.value)} style={{ display: 'block', width: '100%', marginTop: '6px', background: '#020617', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px' }}>
              <option value="">Sin impresora de tickets</option>
              {opcionesImpresora(ticketPrinter, "ticket").map((impresora) => <option key={impresora.key} value={impresora.name}>{impresora.etiqueta}</option>)}
            </select>
          </label>
          <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Impresora de etiquetas
            <select value={labelPrinter} onChange={(evento) => setLabelPrinter(evento.target.value)} style={{ display: 'block', width: '100%', marginTop: '6px', background: '#020617', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px' }}>
              <option value="">Sin impresora de etiquetas</option>
              {opcionesImpresora(labelPrinter, "etiqueta").map((impresora) => <option key={impresora.key} value={impresora.name}>{impresora.etiqueta}</option>)}
            </select>
          </label>
        </div>
        <button type="button" onClick={guardarImpresoras} style={{ marginTop: '14px', backgroundColor: '#10b981', color: '#022c22', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          Guardar impresoras
        </button>

        <h3 style={{ fontSize: '1rem', margin: '22px 0 8px' }}>Imprimir códigos de barras</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 12px' }}>
          Tira de tres etiquetas de 27 x 13 mm: código, nombre corto y precio. En este equipo suelen verse 108Label Printer y GD-41 LABEL.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select value={origen} onChange={(evento) => setOrigen(evento.target.value)} style={{ background: '#020617', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px' }}>
            <option value="local">Catálogo local</option>
            <option value="sicar">SICAR</option>
          </select>
          <input value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Nombre, SKU o código" style={{ flex: '1 1 220px', background: '#020617', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px' }} />
          <button type="button" onClick={buscarProductos} style={{ backgroundColor: '#1e293b', color: '#fff', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #334155', cursor: 'pointer' }}>Buscar</button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0', maxHeight: '280px', overflow: 'auto' }}>
          {productos.map((item) => (
            <li key={item.sku} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
              <input type="checkbox" checked={elegidos.includes(item.sku)} onChange={() => alternar(item.sku)} />
              <span style={{ flex: 1 }}>{item.nombre}</span>
              <span style={{ color: '#6ee7b7', fontFamily: 'monospace' }}>${Number(item.precio || 0).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={imprimirEtiquetas} style={{ backgroundColor: '#f59e0b', color: '#1c1917', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          Imprimir códigos de barras
        </button>
        {avisoImpresion && <p style={{ color: '#e2e8f0', margin: '14px 0 0' }}>{avisoImpresion}</p>}
        {preview && <p style={{ margin: '8px 0 0' }}><a href={preview} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>Abrir la tira de prueba</a></p>}
      </div>
    </div>
  );
}
