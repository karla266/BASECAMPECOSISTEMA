"use client";

import React from 'react';
import Link from 'next/link';

export default function AdventurePage() {
  const expediciones = [
    {
      id: 'pico-orizaba',
      title: 'Ascenso Pico de Orizaba',
      nivel: 'Extremo',
      duration: '2 Días',
      location: 'Orizaba / Citlaltépetl',
      price: '$4,500 MXN',
      badgeColor: '#e11d48'
    },
    {
      id: 'valle-bravo',
      title: 'Vuelo en Parapente Valle de Bravo',
      nivel: 'Intermedio',
      duration: 'Medio Día',
      location: 'Valle de Bravo',
      price: '$1,800 MXN',
      badgeColor: '#0284c7'
    },
    {
      id: 'mtb-volcanes',
      title: 'Ruta de los Volcanes (MTB)',
      nivel: 'Principiante',
      duration: '1 Día',
      location: 'Paso de Cortés',
      price: '$1,200 MXN',
      badgeColor: '#22c55e'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Enlace Volver */}
        <Link href="/admin" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al Hub
        </Link>

        {/* Encabezado */}
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '24px', marginBottom: '32px' }}>
          <span style={{ color: '#e11d48', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '1px' }}>ADVENTURE</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '8px 0', color: '#fff' }}>Expediciones Extremas</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
            Alta montaña, vuelos en parapente y tours todoterreno diseñados para los verdaderos exploradores.
          </p>
        </div>

        {/* Próximas Salidas */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: '#cbd5e1' }}>Próximas Salidas</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {expediciones.map((exp) => (
            <div key={exp.id} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ backgroundColor: `${exp.badgeColor}20`, color: exp.badgeColor, border: `1px solid ${exp.badgeColor}40`, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {exp.nivel}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: '16px 0 12px' }}>{exp.title}</h3>
                
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                  <span>📅 {exp.duration}</span>
                  <span>📍 {exp.location}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#22c55e' }}>{exp.price}</span>
                <button style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Reservar
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
