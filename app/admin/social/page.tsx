"use client";

import React, { useState } from 'react';

export default function AdminSocialPage() {
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto', width: '100%', minHeight: '100vh', backgroundColor: '#090d16', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.025em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>📲</span> Redes Sociales
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Distribución de contenido y programación multicanal.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Instagram Card */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(236, 72, 153, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(236, 72, 153, 0.2)', fontSize: '1.5rem' }}>
              📸
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#fff', margin: '0 0 4px 0' }}>Instagram</h2>
              <p style={{ fontSize: '0.875rem', color: instagramConnected ? '#10b981' : '#94a3b8', margin: 0 }}>
                {instagramConnected ? 'Conectado' : 'No conectado'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setInstagramConnected(!instagramConnected)}
            style={{ backgroundColor: instagramConnected ? '#334155' : '#1e293b', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
          >
            {instagramConnected ? 'Desconectar' : 'Conectar'}
          </button>
        </div>

        {/* Facebook Card */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '1.5rem' }}>
              📘
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#fff', margin: '0 0 4px 0' }}>Facebook</h2>
              <p style={{ fontSize: '0.875rem', color: facebookConnected ? '#10b981' : '#94a3b8', margin: 0 }}>
                {facebookConnected ? 'Conectado' : 'No conectado'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setFacebookConnected(!facebookConnected)}
            style={{ backgroundColor: facebookConnected ? '#334155' : '#1e293b', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
          >
            {facebookConnected ? 'Desconectar' : 'Conectar'}
          </button>
        </div>
      </div>
    </div>
  );
}
