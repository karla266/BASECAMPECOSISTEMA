"use client";

import React from 'react';
import Link from 'next/link';

export default function TrepacerrosPage() {
  const videos = [
    {
      id: 'pico-documental',
      title: 'Ascenso Pico de Orizaba - Documental',
      views: '124K vistas',
      time: 'Hace 2 años',
      duration: '14:20'
    },
    {
      id: 'iztacahuatl-portillos',
      title: 'Iztaccíhuatl Ruta de Portillos',
      views: '89K vistas',
      time: 'Hace 1 año',
      duration: '18:45'
    },
    {
      id: 'nevado-toluca',
      title: 'Nevado de Toluca en Invierno',
      views: '65K vistas',
      time: 'Hace 8 meses',
      duration: '12:10'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Enlace Volver */}
        <Link href="/admin" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al Hub
        </Link>

        {/* Encabezado Canal */}
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '24px', marginBottom: '32px' }}>
          <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '1px' }}>CLUB TREPACERROS</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '8px 0', color: '#fff' }}>Club Trepacerros Orizaba</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0 0 20px 0' }}>
            Más de 130 videos documentando las expediciones más extremas de México. La comunidad oficial de Basecamp 420.
          </p>

          <div style={{ display: 'flex', gap: '20px', color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '20px' }}>
            <span>📺 <strong>50K+</strong> Suscriptores</span>
            <span>🏔️ <strong>40+</strong> Montañas</span>
            <span>👥 <strong>Comunidad</strong> Activa</span>
          </div>

          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noreferrer"
            style={{ backgroundColor: '#ef4444', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'inline-block', fontSize: '0.9rem' }}
          >
            Ver Canal en YouTube
          </a>
        </div>

        {/* Videos Recientes */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: '#cbd5e1' }}>Videos Recientes</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {videos.map((vid) => (
            <div key={vid.id} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ height: '160px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ fontSize: '2.5rem', opacity: 0.8 }}>▶️</span>
                <span style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {vid.duration}
                </span>
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>{vid.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                  {vid.views} • {vid.time}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
