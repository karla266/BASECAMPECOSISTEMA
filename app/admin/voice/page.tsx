"use client";

import React, { useState } from 'react';

export default function AdminVoicePage() {
  const [aviso, setAviso] = useState("");
  const [prompt, setPrompt] = useState(
    "Eres un agente de ventas experto para la marca Basecamp 420, The Trip Smokeshop y Papelería Madera. Respondes con amabilidad, consultas existencias en SICAR y agendas tours."
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto', width: '100%', minHeight: '100vh', backgroundColor: '#090d16', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.025em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>🎙️</span> Agente de Voz IA (Tulio)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Configuración de respuestas automatizadas y manejo de leads.
        </p>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '1.5rem' }}>
            ⚙️
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', margin: '0 0 4px 0' }}>Configuración del Agente</h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Entrenamiento y directrices del sistema.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '8px' }}>
              Prompt Base del Sistema
            </label>
            <textarea 
              rows={4} 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', fontSize: '0.875rem', color: '#cbd5e1', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <button 
            onClick={() => setAviso("Prompt de Tulio guardado en esta sesión.")}
            style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.875rem', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}
          >
            Guardar Configuración
          </button>
          {aviso && <p style={{ color: '#6ee7b7', margin: 0 }}>{aviso}</p>}
        </div>
      </div>
    </div>
  );
}
