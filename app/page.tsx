"use client"

import { useEffect, useState } from 'react'
import { posApiUrl } from '@/lib/apiBase'

interface CursoParapente {
  id: number
  titulo: string
  fecha_inicio: string
  fecha_fin: string
  instructor: string
  cupo_total: number
  cupo_disponible: number
  precio_total: number
  precio_anticipo: number
  link_cobro_anticipo: string
  link_cobro_total: string
}

export default function Home() {
  const [cursos, setCursos] = useState<CursoParapente[]>([])
  const [servicios, setServicios] = useState({ ofrece_tours: true, ofrece_vuelos: true, ofrece_renta_equipo: true })

  useEffect(() => {
    fetch(posApiUrl('/api/v1/config/empresa'))
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setServicios({
            ofrece_tours: data.ofrece_tours !== undefined ? Boolean(data.ofrece_tours) : true,
            ofrece_vuelos: data.ofrece_vuelos !== undefined ? Boolean(data.ofrece_vuelos) : true,
            ofrece_renta_equipo: data.ofrece_renta_equipo !== undefined ? Boolean(data.ofrece_renta_equipo) : true,
          })
        }
      })
      .catch(() => setServicios({ ofrece_tours: true, ofrece_vuelos: true, ofrece_renta_equipo: true }))

    fetch(posApiUrl('/api/v1/cursos/proximos'))
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setCursos(Array.isArray(data) ? data : []))
      .catch(() => setCursos([]))
  }, [])

  const paraglidingJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Vuelo en Parapente Tándem en Orizaba y Fortín",
    "description": "Vuelo en parapente tándem con piloto certificado despegando en Cerro de las Antenas y aterrizando en Coapichapa. Salidas desde Basecamp 420 en Orizaba, Veracruz.",
    "sku": "TOUR-PARAPENTE-001",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "MXN",
      "price": "1650.00",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Basecamp 420",
        "url": "https://www.Basecamp420.com"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(paraglidingJsonLd) }}
      />
      <style dangerouslySetInnerHTML={{__html: `
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; margin: 0; background-color: #0f172a; color: #fff; }
        
        /* Navegación Fija */
        header { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; position: fixed; width: 100%; z-index: 50; box-sizing: border-box; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); }
        header h1 { margin: 0; font-size: 1.5rem; letter-spacing: 2px; text-transform: uppercase; }
        .nav-links a { color: #cbd5e1; text-decoration: none; margin-left: 20px; font-weight: 600; transition: color 0.3s; }
        .nav-links a:hover { color: #38bdf8; }
        .nav-links a[href="#aniversario"] { display: none; }
        
        /* Hero Video */
        .hero { position: relative; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden; padding: 20px; }
        .hero-video { position: absolute; top: 50%; left: 50%; width: 100vw; height: 56.25vw; min-height: 100vh; min-width: 177.77vh; transform: translate(-50%, -50%); pointer-events: none; z-index: 0; border: none; }
        .hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1; }
        .hero-content { position: relative; z-index: 2; max-width: 900px; }
        .hero-content h2 { font-size: 4.2rem; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 5px; font-weight: 800; text-shadow: 2px 4px 15px rgba(0,0,0,0.8); }
        .hero-content p { font-size: 1.25rem; color: #f1f5f9; margin: 0 auto 35px; line-height: 1.6; text-shadow: 1px 2px 8px rgba(0,0,0,0.9); }
        
        /* Botones */
        .btn-primary { background-color: #0284c7; color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 1.1rem; display: inline-block; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #0284c7; box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
        .btn-primary:hover { background-color: transparent; border: 2px solid #fff; transform: translateY(-3px); }
        
        /* Secciones */
        .section-padding { padding: 90px 20px; max-width: 1100px; margin: 0 auto; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-top: 40px; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
        
        .card { background: #1e293b; padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); }
        .tag { color: #38bdf8; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 0.85rem; margin-bottom: 10px; display: block; }
        h3 { font-size: 2.2rem; margin-top: 0; color: #fff; margin-bottom: 20px; }
        p { color: #94a3b8; line-height: 1.8; font-size: 1rem; }
        
        /* Footer */
        footer { border-top: 1px solid rgba(255,255,255,0.1); padding: 40px 20px; text-align: center; color: #64748b; font-size: 0.9rem; background: #0b0f19; }
      `}} />
      
      {/* Header */}
      <header>
          <h1>Basecamp 420</h1>
          <div className="nav-links">
              <a href="#historia">Nuestra Historia</a>
              <a href="#ecosistema">Ecosistema</a>
              <a href="/explore">Vuelos y Cursos</a>
              <a href="/blog">Blog</a>
              <a href="/movimiento-canabico/podcasts">Podcast</a>
              <a href="/thetrip">The Trip Smoke Shop</a>
              {servicios.ofrece_renta_equipo && <a href="/renta">Renta de equipo</a>}
              <a href="#contacto">Local Físico</a>
          </div>
      </header>

      {/* Hero Video */}
      <section className="hero">
          <iframe className="hero-video" 
              src="https://www.youtube.com/embed/cqxPXm6j_Cs?autoplay=1&mute=1&loop=1&playlist=cqxPXm6j_Cs&controls=0&showinfo=0&modestbranding=1" 
              allow="autoplay; fullscreen">
          </iframe>
          <div className="hero-overlay"></div>
          
          <div className="hero-content">
              <h2>BASECAMP 420</h2>
              <p>Experiencias de montaña, vuelos en parapente, Smokeshop, renta de equipo e innovación digital. Nacidos en la cima, respaldados por la tradición.</p>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <a href="https://wa.me/522727258748?text=Hola%20Basecamp%20420,%20deseo%20m%C3%A1s%20informaci%C3%B3n" target="_blank" rel="noopener noreferrer" className="btn-primary">
                      CONTACTAR POR WHATSAPP
                  </a>
                  {servicios.ofrece_renta_equipo && (
                    <a href="/renta" className="btn-primary" style={{ background: 'transparent', borderColor: '#38bdf8', color: '#e0f2fe' }}>
                        Ver renta de equipo
                    </a>
                  )}
              </div>
          </div>
      </section>

      {servicios.ofrece_vuelos && (
      <section id="parapente" className="section-padding" style={{ background: 'linear-gradient(135deg, rgba(14,116,144,0.18), rgba(2,6,23,0.2))' }}>
        <div className="grid-2" style={{ alignItems: 'stretch' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a, #082f49)', border: '1px solid rgba(125,211,252,0.4)', boxShadow: '0 25px 45px rgba(14,116,144,0.25)' }}>
            <span className="tag" style={{ color: '#7dd3fc' }}>Experiencia Destacada · Salidas desde Basecamp 420</span>
            <h3 style={{ marginBottom: '18px' }}>Vuelo en Parapente Tándem sobre el Valle de Orizaba y Fortín</h3>
            <p style={{ color: '#dbeafe', marginBottom: '18px' }}>
              Vive una experiencia de alto impacto con despegue en Cerro de las Antenas (Fortín) y aterrizaje en Coapichapa, con vistas panorámicas del Valle de Orizaba y la región montañosa más emblemática del Estado.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px', color: '#e2e8f0' }}>
              <li><strong>Despegue:</strong> Cerro de las Antenas (Fortín)</li>
              <li><strong>Aterrizaje:</strong> Coapichapa</li>
              <li><strong>Duración en el aire:</strong> 15 a 20 minutos de vuelo libre</li>
              <li><strong>Incluye:</strong> Piloto tándem certificado, equipo de vuelo homologado, plática de seguridad y traslado local al despegue</li>
              <li><strong>Precio:</strong> Desde $1,650 MXN por persona</li>
            </ul>
            <div style={{ marginTop: '28px' }}>
              <a
                href="https://wa.me/522727258748?text=Hola,%20quiero%20reservar%20mi%20vuelo%20en%20parapente%20en%20Coapichapa%20con%20Basecamp%20420"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ width: '100%', textAlign: 'center', background: '#25d366', borderColor: '#25d366', color: '#062b12' }}
              >
                RESERVAR VUELO POR WHATSAPP
              </a>
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(160deg, rgba(15,23,42,0.9), rgba(8,47,73,0.9))', border: '1px solid rgba(125,211,252,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '420px' }}>
            <div style={{ width: '100%', borderRadius: '22px', overflow: 'hidden', background: 'linear-gradient(180deg, rgba(148,163,184,0.18), rgba(15,23,42,0.8))', border: '1px solid rgba(125,211,252,0.25)', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
              <div style={{ textAlign: 'center', maxWidth: '440px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '12px' }}>⛰️</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '3px', color: '#7dd3fc', textTransform: 'uppercase', marginBottom: '12px' }}>Basecamp 420 Adventure</div>
                <h4 style={{ margin: '0 0 12px', fontSize: '2rem', color: '#fff' }}>Coapichapa & Valle de Orizaba</h4>
                <p style={{ color: '#dbeafe', lineHeight: 1.8 }}>
                  Vuelo tándem con seguridad, acompañamiento local y una panorámica única del valle de Orizaba, Fortín y sus alrededores. Ideal para parejas, amigos o viajeros que buscan una experiencia inolvidable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      )}

      {servicios.ofrece_renta_equipo && (
      <section className="section-padding" style={{ background: 'linear-gradient(135deg, rgba(20,83,45,0.2), rgba(15,23,42,0.8))' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.15), rgba(15,23,42,0.96))', border: '1px solid rgba(134,239,172,0.25)' }}>
          <span className="tag" style={{ color: '#86efac' }}>Renta de equipo</span>
          <h3 style={{ marginBottom: '12px' }}>Alquiler de equipo para alta montaña y camping</h3>
          <p style={{ color: '#d1fae5', marginBottom: '18px' }}>
            Tenemos equipo para excursionistas, campistas y montañistas: tiendas de campaña, mochilas, cascos, bastones, impermeables, sleeping bags y accesorios para recorridos ligeros o expediciones serias.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <a href="/renta" style={{ display: 'inline-block', background: '#22c55e', color: '#062b12', borderRadius: '10px', padding: '10px 16px', textDecoration: 'none', fontWeight: 700 }}>Ver catálogo de renta</a>
            <a href="https://wa.me/522727258748?text=Hola,%20quiero%20alquilar%20equipo%20para%20alta%20monta%C3%B1a%20o%20camping" target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(148,163,184,0.4)', borderRadius: '10px', padding: '10px 16px', textDecoration: 'none', fontWeight: 700 }}>Solicitar cotización por WhatsApp</a>
          </div>
        </div>
      </section>
      )}

      {servicios.ofrece_tours && (
      <section className="section-padding" style={{ background: 'rgba(15,23,42,0.75)' }}>
        <div className="grid-2" style={{ alignItems: 'stretch' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(14,116,144,0.15), rgba(15,23,42,0.95))', border: '1px solid rgba(56,189,248,0.35)' }}>
            <span className="tag" style={{ color: '#7dd3fc' }}>APPI School · Formación y pago seguro</span>
            <h3 style={{ marginBottom: '18px' }}>Próximos cursos de parapente con instructor certificado</h3>
            <p style={{ color: '#dbeafe', marginBottom: '18px' }}>
              Encuentra fechas disponibles para cursos, entrenamientos y certificación con Salvador Lara / Parapentitis. El pago se puede realizar por anticipo o total del curso según la fecha elegida.
            </p>
            {cursos.length === 0 ? (
              <div style={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '14px', padding: '18px', color: '#cbd5e1' }}>
                No hay cursos publicados aún. Pronto agregaremos nuevas fechas de entrenamiento y certificación.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {cursos.slice(0, 3).map((curso) => (
                  <div key={curso.id} style={{ background: '#020817', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong style={{ color: '#f8fafc', fontSize: '1.05rem' }}>{curso.titulo}</strong>
                      <span style={{ color: '#86efac', fontSize: '0.7rem', border: '1px solid rgba(134,239,172,0.4)', borderRadius: '999px', padding: '4px 8px' }}>
                        {curso.cupo_disponible}/{curso.cupo_total} plazas
                      </span>
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.92rem', marginTop: '10px', lineHeight: 1.8 }}>
                      <div><strong>Fechas:</strong> {curso.fecha_inicio} · {curso.fecha_fin}</div>
                      <div><strong>Instructor:</strong> {curso.instructor}</div>
                      <div><strong>Precio total:</strong> ${Number(curso.precio_total).toLocaleString('es-MX')} MXN</div>
                      {curso.precio_anticipo > 0 && <div><strong>Anticipo:</strong> ${Number(curso.precio_anticipo).toLocaleString('es-MX')} MXN</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                      {curso.link_cobro_anticipo && (
                        <a href={curso.link_cobro_anticipo} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#f59e0b', color: '#1f2937', padding: '10px 14px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>Pagar anticipo</a>
                      )}
                      {curso.link_cobro_total && (
                        <a href={curso.link_cobro_total} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#22c55e', color: '#062b12', padding: '10px 14px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>Pagar curso completo</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.94), rgba(8,47,73,0.9))', border: '1px solid rgba(125,211,252,0.2)' }}>
            <span className="tag" style={{ color: '#fbbf24' }}>Ámbito institucional · Basecamp 420</span>
            <h3 style={{ marginBottom: '18px' }}>Tu experiencia tándem sigue siendo una reserva directa por WhatsApp</h3>
            <p style={{ color: '#dbeafe' }}>
              La experiencia de vuelo tándem continúa siendo una reserva inmediata con atención directa por WhatsApp, mientras los cursos APPI y la formación especializada se gestionan con fechas y enlaces de pago públicos.
            </p>
            <div style={{ marginTop: '22px', display: 'grid', gap: '12px' }}>
              <a href="https://wa.me/522727258748?text=Hola,%20quiero%20reservar%20mi%20vuelo%20t%C3%A1ndem%20en%20Coapichapa" target="_blank" rel="noreferrer" style={{ display: 'inline-block', textAlign: 'center', background: '#25d366', color: '#062b12', fontWeight: 800, padding: '14px 18px', borderRadius: '12px', textDecoration: 'none' }}>Reservar vuelo tándem</a>
              <a href="#contacto" style={{ display: 'inline-block', textAlign: 'center', background: 'transparent', border: '1px solid rgba(125,211,252,0.4)', color: '#e0f2fe', fontWeight: 700, padding: '14px 18px', borderRadius: '12px', textDecoration: 'none' }}>Consultar cursos APPI</a>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Sección Historia y Raíces */}
      <section id="historia" className="section-padding">
          <div className="grid-2">
              <div>
                  <span className="tag">Tradición, Derechos & Libertad</span>
                  <h3>De una vitrina en la papelería a un ecosistema de aventura</h3>
                  <p>
                      <strong>Basecamp 420</strong> es el resultado de una trayectoria de lucha, trabajo y pasión. Nuestras raíces comerciales nacen en <strong>Papelería Madera</strong>, negocio familiar de 40 años que ha sido el sustento de nuestro hogar.
                  </p>
                  <p>
                      En 2020, tras ganar el amparo para el consumo personal legal, nació <strong>The Trip Smokeshop</strong> en una pequeña vitrina dentro de la papelería. Su crecimiento constante se convirtió en nuestro pilar económico y le dio origen a la identidad <strong>420</strong> de nuestro holding.
                  </p>
              </div>
              <div className="card">
                  <span className="tag">5 Años en las Cumbres</span>
                  <h4 style={{fontSize: '1.3rem', color: '#fff', marginTop: 0}}>Comunidad & Vuelo Libre</h4>
                  <p>
                      Con el <strong>Club Trepacerros</strong> guiamos expediciones gratuitas para compartir la montaña. En el aire, volamos junto a <strong>Parapentitis</strong> y su instructor pionero con 33 años de experiencia en Fortín, APPI y USPA, mientras concluyo mi certificación profesional.
                  </p>
              </div>
          </div>
      </section>

      {/* Ecosistema Basecamp 420 */}
      <section id="ecosistema" style={{background: '#1e293b'}} className="section-padding">
          <div style={{textAlign: 'center', marginBottom: '40px'}}>
              <span className="tag">Ecosistema Integrado</span>
              <h3>Nuestras Marcas & Aliados</h3>
          </div>

          <div className="grid-3">
              <div className="card" style={{background: '#0f172a'}}>
                  <span className="tag">Marca Propia & Sustento</span>
                  <h4 style={{color: '#fff', fontSize: '1.2rem', marginTop: 0}}>The Trip Smokeshop</h4>
                  <p>Nuestra tienda de artículos de fumar de uso legal. Nacida tras el amparo legal de 2020 en una vitrina y convertida hoy en el motor de Basecamp 420.</p>
              </div>

              <div className="card" style={{background: '#0f172a'}}>
                  <span className="tag">Aventura & Renta</span>
                  <h4 style={{color: '#fff', fontSize: '1.2rem', marginTop: 0}}>Basecamp 420 Adventure</h4>
                  <p>Tours de aventura, expediciones, venta y renta de equipo especializado. Síguenos en nuestro canal de YouTube <em>basecamp420trepacerros</em>.</p>
              </div>

              <div className="card" style={{background: '#0f172a'}}>
                  <span className="tag">Comunidad Libre</span>
                  <h4 style={{color: '#fff', fontSize: '1.2rem', marginTop: 0}}>Club Trepacerros</h4>
                  <p>5 años liderando expediciones de montaña comunitarias. Compartimos el aprendizaje y la naturaleza sin costo por guiada.</p>
              </div>

              <div className="card" style={{background: '#0f172a'}}>
                  <span className="tag">Fisioterapia Aliada</span>
                  <h4 style={{color: '#fff', fontSize: '1.2rem', marginTop: 0}}>Fisiozoom</h4>
                  <p>Clínica de fisioterapia, rehabilitación y compañera de ruta en Trepacerros para la preparación y recuperación de nuestros deportistas.</p>
              </div>

              <div className="card" style={{background: '#0f172a'}}>
                  <span className="tag">Evolución Digital</span>
                  <h4 style={{color: '#fff', fontSize: '1.2rem', marginTop: 0}}>Cima Digital</h4>
                  <p>La evolución tecnológica de Ciber Madera. Desarrollo web SaaS, inteligencia artificial y servicios de impresión en nuestro local.</p>
              </div>

              <div className="card" style={{background: '#0f172a'}}>
                  <span className="tag">Tradición Familiar</span>
                  <h4 style={{color: '#fff', fontSize: '1.2rem', marginTop: 0}}>Papelería Madera</h4>
                  <p>40 años de trayectoria comercial. Tradición, atención personalizada y la herencia familiar que dio origen a todo este proyecto.</p>
              </div>
          </div>
      </section>

      {/* Sección Contacto y Local Físico */}
      <section id="contacto" className="section-padding">
          <div className="card" style={{textAlign: 'center', maxWidth: '850px', margin: '0 auto'}}>
              <span className="tag">Atención en Mostrador</span>
              <h3>Visítanos en Nuestro Local Físico</h3>
              <p style={{fontSize: '1.1rem', color: '#e2e8f0'}}>
                  Atendemos consultas de The Trip Smokeshop, renta de equipo, impresiones y contrataciones directamente en nuestro punto de venta.
              </p>
              
              <div style={{margin: '30px 0', padding: '20px', background: '#0f172a', borderRadius: '12px', textAlign: 'left'}}>
                  <p style={{margin: '8px 0', color: '#fff'}}>📍 <strong>Local Físico:</strong> Papelería Madera / The Trip Smokeshop / Basecamp 420 Hub.</p>
                  <p style={{margin: '8px 0', color: '#fff'}}>📞 <strong>WhatsApp / Teléfono:</strong> 272 725 8748</p>
                  <p style={{margin: '8px 0', color: '#fff'}}>📺 <strong>YouTube Oficial:</strong> basecamp420trepacerros</p>
              </div>

              <a href="https://wa.me/522727258748?text=Hola,%20me%20gustar%C3%ADa%20visitar%20el%20local%20f%C3%ADsico,%20%C2%BFme%20puedes%20compartir%20la%20ubicaci%C3%B3n%20exacta?" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Ubicación de la Tienda por Google Maps
              </a>
          </div>
      </section>

      <footer>
          <p>© 2026 Basecamp 420. Todos los derechos reservados. Impulsado por Cima Digital.</p>
          <p>Oriente 27 y Norte 10, Orizaba</p>
          <p style={{ marginTop: '10px' }}>
            <a href="tel:+522727258748">+52 272 725 8748</a>
            {' · '}
            <a href="mailto:contacto@basecamp420.com">contacto@basecamp420.com</a>
          </p>
          <p style={{ marginTop: '10px' }}>
            <a href="/thetrip" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: 700 }}>
              The Trip Smoke Shop
            </a>
            {' · '}
            <a href="/convenio">Convenio</a>
            {' · '}
            <a href="/amparos">Amparos</a>
          </p>
      </footer>
    </>
  );
}
