"use client"

import React, { useState } from 'react'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px 24px', borderBottom: '1px solid #1e293b', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>B420</div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>Basecamp 420 Hub</h2>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'overview', name: '📊 Panel General' },
            { id: 'ai', name: '🤖 Piloto IA: Campañas' },
            { id: 'csv', name: '📦 Carga Masiva SICAR' },
            { id: 'products', name: '🛍️ Catálogo Productos' },
            { id: 'social', name: '📲 Redes Sociales' },
            { id: 'settings', name: '⚙️ Ajustes Globales' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: 'none', 
                backgroundColor: activeTab === tab.id ? '#0284c7' : 'transparent', 
                color: activeTab === tab.id ? '#fff' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '0.95rem'
              }}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Topbar */}
        <header style={{ height: '70px', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Panel de Control Central</h1>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Sincronización en vivo con sucursal física Papelería Madera &amp; The Trip Smokeshop</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: '#cbd5e1' }}>
            🔌 <strong style={{ color: '#fff' }}>Servidor SICAR DUAL (3000):</strong> Activo
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
          </div>
        </header>

        {/* Dynamic Body */}
        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Consultas Atendidas Tulio AI</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#38bdf8' }}>1,248</h3>
            </div>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Ventas The Trip Smokeshop</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#22c55e' }}>$24,500</h3>
            </div>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Items Papelería Madera</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#f59e0b' }}>3,420</h3>
            </div>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Expediciones Trepacerros</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#e11d48' }}>Gentil</h3>
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', marginBottom: '20px' }}>Últimas Consultas de Inventario vía Tulio Local</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>Producto</th>
                  <th style={{ padding: '12px' }}>Base SICAR</th>
                  <th style={{ padding: '12px' }}>Existencia</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px', color: '#fff' }}>Sábanas OCB Orgánicas</td>
                  <td style={{ padding: '12px' }}>Tienda General (3307)</td>
                  <td style={{ padding: '12px', color: '#22c55e', fontWeight: 'bold' }}>42 pzas</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', color: '#fff' }}>Cuaderno Profesional SC</td>
                  <td style={{ padding: '12px' }}>Papelería Madera (3306)</td>
                  <td style={{ padding: '12px', color: '#22c55e', fontWeight: 'bold' }}>18 pzas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>

    </div>
  )
}
