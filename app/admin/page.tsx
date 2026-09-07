"use client"

import { useState } from 'react'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px 24px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>B420</div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>Basecamp 420</h2>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Orquestador Cima Digital</span>
            </div>
          </div>

          <nav style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('overview')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'overview' ? '#0284c7' : 'transparent', color: activeTab === 'overview' ? '#fff' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
            >
              📊 Resumen General
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'inventory' ? '#0284c7' : 'transparent', color: activeTab === 'inventory' ? '#fff' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
            >
              📦 Inventario SICAR Dual
            </button>
            <button 
              onClick={() => setActiveTab('tulio')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'tulio' ? '#0284c7' : 'transparent', color: activeTab === 'tulio' ? '#fff' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
            >
              🤖 Tulio AI (Métricas)
            </button>
            <button 
              onClick={() => setActiveTab('brands')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'brands' ? '#0284c7' : 'transparent', color: activeTab === 'brands' ? '#fff' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
            >
              🏢 Inquilinos / Subdominios
            </button>
          </nav>
        </div>

        <div style={{ padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
          🟢 <strong style={{ color: '#fff' }}>Servidor Local:</strong> Activo<br />
          🔌 <strong style={{ color: '#fff' }}>Puerto SICAR:</strong> 3000 / 3306-3307
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Topbar */}
        <header style={{ height: '70px', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Panel de Control Central</h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Gestión en tiempo real de operaciones físicas y digitales</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Sucursal: <strong>Papelería Madera / Hub 420</strong></span>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
          </div>
        </header>

        {/* Dynamic Body */}
        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          
          {/* TARJETAS DE ESTADÍSTICAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Consultas Atendidas (Tulio AI)</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#38bdf8' }}>1,248</h3>
              <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>↑ 18% esta semana</span>
            </div>

            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Ventas The Trip Smokeshop</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#22c55e' }}>$24,500</h3>
              <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>Sustento Principal Activo</span>
            </div>

            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Inventario SICAR (Papelería)</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#f59e0b' }}>3,420 Pzas</h3>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Puerto 3306 Sincronizado</span>
            </div>

            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Expediciones Trepacerros</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#e11d48' }}>Aniversario</h3>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Próxima: Cerro del Gentil</span>
            </div>
          </div>

          {/* TABLA DE CONSULTAS */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Últimas Consultas de Inventario vía Tulio Local</h3>
              <button style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Refrescar Bases de Datos
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>Producto Buscado</th>
                  <th style={{ padding: '12px' }}>Base de Datos</th>
                  <th style={{ padding: '12px' }}>Existencia</th>
                  <th style={{ padding: '12px' }}>Precio</th>
                  <th style={{ padding: '12px' }}>Respuesta de Voz</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#fff' }}>Sábanas OCB Orgánicas</td>
                  <td style={{ padding: '12px', color: '#cbd5e1' }}>Tienda General (3307)</td>
                  <td style={{ padding: '12px', color: '#22c55e', fontWeight: 'bold' }}>42 pzas</td>
                  <td style={{ padding: '12px' }}>$35.00</td>
                  <td style={{ padding: '12px', color: '#38bdf8' }}>"En Tienda General, quedan 42 piezas..."</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#fff' }}>Cuaderno Profesional SC</td>
                  <td style={{ padding: '12px', color: '#cbd5e1' }}>Papelería Madera (3306)</td>
                  <td style={{ padding: '12px', color: '#22c55e', fontWeight: 'bold' }}>18 pzas</td>
                  <td style={{ padding: '12px' }}>$28.50</td>
                  <td style={{ padding: '12px', color: '#38bdf8' }}>"En Papelería, quedan 18 piezas..."</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#fff' }}>Grinder Metálico 4P</td>
                  <td style={{ padding: '12px', color: '#cbd5e1' }}>Tienda General (3307)</td>
                  <td style={{ padding: '12px', color: '#ef4444', fontWeight: 'bold' }}>Agotado (0)</td>
                  <td style={{ padding: '12px' }}>$180.00</td>
                  <td style={{ padding: '12px', color: '#38bdf8' }}>"El producto está agotado en..."</td>
                </tr>
              </tbody>
            </table>
          </div>

        </main>
      </div>

    </div>
  )
}
