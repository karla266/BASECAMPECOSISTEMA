"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function TheTripPage() {
  const [cartCount, setCartCount] = useState(0);

  const productos = [
    {
      sku: 'SKU-001',
      title: 'Bong Beaker 12" Pyrex',
      price: 850,
      description: 'Cristal de borosilicato de alta resistencia, incluye difusor.'
    },
    {
      sku: 'SKU-002',
      title: 'Grinder Aluminio 4 Piezas',
      price: 350,
      description: 'Dientes de corte de diamante y malla recolectora de polen.'
    },
    {
      sku: 'SKU-003',
      title: 'Pipa Spoon Clásica',
      price: 250,
      description: 'Diseño ergonómico en pyrex soplado a mano.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Bar Superior */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Link href="/admin" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Volver al Hub
          </Link>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem' }}>
            🛒 Carrito: <strong style={{ color: '#22c55e' }}>{cartCount} piezas</strong>
          </div>
        </div>

        {/* Encabezado */}
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '24px', marginBottom: '32px' }}>
          <span style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '1px' }}>THE TRIP SMOKESHOP</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '8px 0', color: '#fff' }}>Parafernalia Premium</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
            Piezas de pyrex, grinders y accesorios legales de la más alta calidad.
          </p>
        </div>

        {/* Catálogo de Productos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {productos.map((prod) => (
            <div key={prod.sku} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>{prod.sku}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '6px 0' }}>{prod.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px 0' }}>{prod.description}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#a855f7' }}>${prod.price} MXN</span>
                <button 
                  onClick={() => setCartCount(cartCount + 1)}
                  style={{ backgroundColor: '#a855f7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
