"use client";

import React from 'react';

export default function AdminProductsPage() {
  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto', width: '100%', minHeight: '100vh', backgroundColor: '#090d16', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.025em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>📦</span> Catálogo de Productos
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Gestión de inventario y sincronización con SICAR y Mercado Libre.
          </p>
        </div>
        <button style={{ backgroundColor: '#10b981', color: '#022c22', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.875rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>+</span> Nuevo Producto
        </button>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'row', gap: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Buscar por SKU, nombre o categoría..." 
            style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 16px', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <button style={{ backgroundColor: '#1e293b', color: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer', fontSize: '0.875rem' }}>
          Filtros
        </button>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', color: '#334155', marginBottom: '16px' }}>📦</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>No hay productos seleccionados</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: '448px', margin: '0 auto 24px' }}>
            El catálogo actual está vacío. Importa un archivo CSV o crea un producto manualmente.
          </p>
        </div>
      </div>
    </div>
  );
}
