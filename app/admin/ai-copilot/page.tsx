"use client";

import React from 'react';

export default function AICopilotPage() {
  const generatedImages = [
    { id: 1, title: 'Outdoor Adventure', url: 'https://picsum.photos/seed/adventure/800/600', badge: 'Alta Conversión' },
    { id: 2, title: 'Mountain Basecamp', url: 'https://picsum.photos/seed/mountain/800/600', badge: 'A/B Testing' },
    { id: 3, title: 'Zen Smokeshop', url: 'https://picsum.photos/seed/zen/800/600', badge: 'Trending' },
    { id: 4, title: 'Digital Agency', url: 'https://picsum.photos/seed/digital/800/600', badge: 'Nuevo' },
    { id: 5, title: 'High Altitude', url: 'https://picsum.photos/seed/altitude/800/600', badge: 'CTR 8.5%' },
    { id: 6, title: 'B2B SaaS Portal', url: 'https://picsum.photos/seed/saas/800/600', badge: 'Orgánico' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto', width: '100%', minHeight: '100vh', backgroundColor: '#090d16', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Header section en tonos verdes */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #065f46', paddingBottom: '24px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#065f46', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <span>✨</span> Copiloto IA: Galería de Campañas
          </h1>
          <p style={{ color: '#047857', fontSize: '0.875rem', marginTop: '8px', fontWeight: '500', margin: '8px 0 0' }}>
            Selecciona una imagen llamativa generada por DALL-E 3 para tu próxima pauta multicanal.
          </p>
        </div>
        <button style={{ backgroundColor: '#059669', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
          Generar Nueva Imagen
        </button>
      </div>

      {/* Grid de tarjetas para selección */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {generatedImages.map((img) => (
          <div 
            key={img.id} 
            style={{ position: 'relative', backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          >
            {/* Contenedor de Imagen */}
            <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: '#064e3b' }}>
              <img 
                src={img.url} 
                alt={img.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              {/* Badge Flotante */}
              <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'rgba(6, 78, 59, 0.8)', backdropFilter: 'blur(4px)', color: '#6ee7b7', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', uppercase: 'true' }}>
                {img.badge}
              </span>
            </div>

            {/* Detalles de la Tarjeta */}
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 'bold', color: '#065f46', fontSize: '1.125rem', margin: 0 }}>{img.title}</h3>
                <span style={{ color: '#10b981', fontSize: '1.25rem' }}>✓</span>
              </div>
              <p style={{ color: '#047857', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500', margin: '4px 0 0' }}>
                Renderizado en calidad HD (1024x1024)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
