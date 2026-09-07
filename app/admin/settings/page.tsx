"use client";

import React, { useState } from 'react';

export default function AdminSettingsPage() {
  const [twoFactor, setTwoFactor] = useState(false);

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
        </div>
      </div>
    </div>
  );
}
