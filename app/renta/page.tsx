"use client"

import Link from "next/link"
import { useEffect, useState } from 'react'
import { posApiUrl } from '@/lib/apiBase'

interface ConfigEmpresa {
  ofrece_renta_equipo?: boolean
}

const categorias = [
  {
    title: 'Alta montaña',
    icon: '⛰️',
    items: [
      'Casco de escalada y trekking',
      'Arnés y cintas de seguridad',
      'Mochilas de 30 a 65 L',
      'Pies de gato y cuerdas de 8 a 60 m',
      'Bastones telescópicos',
      'Gafas de sol de montaña',
    ],
  },
  {
    title: 'Camping',
    icon: '🏕️',
    items: [
      'Tiendas de campaña 2 a 4 personas',
      'Sleeping bags de 3 y 4 estaciones',
      'Matracas inflables y aislantes',
      'Linternas frontales y cargadores',
      'Sacos de dormir térmicos',
      'Mesas plegables y sillas de camping',
    ],
  },
  {
    title: 'Trekking y senderismo',
    icon: '🥾',
    items: [
      'Botas de senderismo',
      'Impermeables y capas antiviento',
      'Mochilas de hidratación',
      'Básculas y whiskas',
      'Botiquines de emergencia',
      'Accesorios de campamento',
    ],
  },
]

export default function RentaPage() {
  const [habilitado, setHabilitado] = useState(true)

  useEffect(() => {
    fetch(posApiUrl('/api/v1/config/empresa'))
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ConfigEmpresa | null) => {
        if (data && typeof data.ofrece_renta_equipo === 'boolean') {
          setHabilitado(data.ofrece_renta_equipo)
        }
      })
      .catch(() => setHabilitado(true))
  }, [])

  if (!habilitado) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#020817', color: '#e2e8f0', padding: '24px' }}>
        <div style={{ maxWidth: '620px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⛺</div>
          <h1 style={{ margin: '0 0 12px', fontSize: '2rem' }}>Renta de equipo temporalmente no disponible</h1>
          <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>
            El servicio de alquiler de equipo para alta montaña y camping está desactivado en este momento. Puedes consultar otros servicios de Basecamp 420 o volver a la experiencia de reserva web del sitio.
          </p>
          <div style={{ marginTop: '24px' }}>
            <Link href="/" style={{ display: 'inline-block', background: '#22c55e', color: '#062b12', borderRadius: '12px', padding: '12px 18px', textDecoration: 'none', fontWeight: 800 }}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #020817 0%, #0f172a 100%)', color: '#f8fafc' }}>
      <header style={{ padding: '20px 24px', borderBottom: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: 800, letterSpacing: '1px' }}>BASECAMP 420</Link>
          <nav style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#cbd5e1', fontSize: '0.82rem' }}>
            <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Inicio</Link>
            <Link href="/#parapente" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Parapente</Link>
            <Link href="/checkout" style={{ color: '#86efac', textDecoration: 'none', fontWeight: 700 }}>Ir al checkout</Link>
          </nav>
        </div>
      </header>

      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '72px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'stretch' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(15,23,42,0.9))', border: '1px solid rgba(134,239,172,0.3)', borderRadius: '24px', padding: '28px' }}>
            <span style={{ color: '#86efac', fontSize: '0.78rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800 }}>Renta de equipo</span>
            <h1 style={{ margin: '16px 0 12px', fontSize: 'clamp(2.4rem, 3.2vw, 4rem)', lineHeight: 1.1 }}>Alta montaña y camping</h1>
            <p style={{ margin: 0, color: '#dbeafe', fontSize: '1.06rem', lineHeight: 1.8 }}>
              Alquila equipo confiable para senderismo, camping, montaña y excursiones ligeras. Todo para salir a la aventura con una preparación más segura y funcional.
            </p>
            <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Link href="/reservar" style={{ display: 'inline-block', background: '#22c55e', color: '#062b12', borderRadius: '12px', padding: '12px 18px', textDecoration: 'none', fontWeight: 800 }}>Reservar en sitio</Link>
              <Link href="/" style={{ display: 'inline-block', background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(148,163,184,0.4)', borderRadius: '12px', padding: '12px 18px', textDecoration: 'none', fontWeight: 700 }}>Volver al inicio</Link>
            </div>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '24px', padding: '24px', display: 'grid', gap: '12px' }}>
            <div style={{ fontSize: '2rem' }}>🎒</div>
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.2rem' }}>Incluye</h2>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#dbeafe', lineHeight: 1.9 }}>
                <li>Mochilas y campamento</li>
                <li>Equipo térmico y protección</li>
                <li>Seguridad para la montaña</li>
                <li>Asesoría de uso por experiencia</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '12px 24px 72px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {categorias.map((categoria) => (
            <div key={categoria.title} style={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '18px', padding: '22px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{categoria.icon}</div>
              <h3 style={{ margin: '0 0 14px', color: '#f8fafc' }}>{categoria.title}</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', lineHeight: 1.8 }}>
                {categoria.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#020817', borderTop: '1px solid rgba(148,163,184,0.2)', padding: '32px 24px 64px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(15,118,110,0.12), rgba(15,23,42,0.9))', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '20px', padding: '24px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.6rem' }}>Cotiza tu equipo</h2>
          <p style={{ margin: 0, color: '#dbeafe', lineHeight: 1.8 }}>
            Mándanos el tipo de actividad, número de personas y días requeridos para preparar un presupuesto con equipos confiables para montaña, camping y trekking.
          </p>
          <div style={{ marginTop: '20px' }}>
            <Link href="/reservar" style={{ display: 'inline-block', background: '#14b8a6', color: '#062b12', borderRadius: '12px', padding: '12px 18px', textDecoration: 'none', fontWeight: 800 }}>Solicitar presupuesto</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
