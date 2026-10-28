"use client";

import React, { useRef, useState } from 'react';

export default function AdminCsvPage() {
  const archivoRef = useRef<HTMLInputElement>(null);
  const [nombre, setNombre] = useState("");
  const [filas, setFilas] = useState(0);
  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto', width: '100%', minHeight: '100vh', backgroundColor: '#090d16', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.025em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>📄</span> Carga Masiva CSV
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Importación y actualización de inventarios (SICAR).
        </p>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#064e3b', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontSize: '2rem' }}>
          ☁️
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
          Arrastra tu archivo CSV aquí
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '32px', maxWidth: '448px' }}>
          Sube la plantilla oficial exportada desde SICAR para actualizar precios, stock y nuevos artículos automáticamente.
        </p>
        <input
          ref={archivoRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const texto = await file.text();
            const lineas = texto.split(/\r?\n/).filter((linea) => linea.trim().length > 0);
            setNombre(file.name);
            setFilas(Math.max(0, lineas.length - 1));
          }}
        />
        <button type="button" onClick={() => archivoRef.current?.click()} style={{ backgroundColor: '#10b981', color: '#022c22', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
          Seleccionar Archivo
        </button>
        {nombre && (
          <p style={{ color: '#6ee7b7', marginTop: '18px' }}>{nombre}: {filas} filas de datos listas para revisar.</p>
        )}
      </div>
    </div>
  );
}
