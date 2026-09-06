export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; margin: 0; background-color: #0f172a; color: #fff; }
        
        /* Navegación Fija */
        header { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; position: fixed; width: 100%; z-index: 50; box-sizing: border-box; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); }
        header h1 { margin: 0; font-size: 1.5rem; letter-spacing: 2px; text-transform: uppercase; }
        .nav-links a { color: #cbd5e1; text-decoration: none; margin-left: 25px; font-weight: 600; transition: color 0.3s; }
        .nav-links a:hover { color: #38bdf8; }
        
        /* Hero Video */
        .hero { position: relative; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden; padding: 20px; }
        .hero-video { position: absolute; top: 50%; left: 50%; width: 100vw; height: 56.25vw; min-height: 100vh; min-width: 177.77vh; transform: translate(-50%, -50%); pointer-events: none; z-index: 0; border: none; }
        .hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.45); z-index: 1; }
        .hero-content { position: relative; z-index: 2; max-width: 900px; }
        .hero-content h2 { font-size: 4.5rem; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 5px; font-weight: 800; text-shadow: 2px 4px 15px rgba(0,0,0,0.8); }
        .hero-content p { font-size: 1.3rem; color: #f1f5f9; margin: 0 auto 35px; line-height: 1.6; text-shadow: 1px 2px 8px rgba(0,0,0,0.9); }
        
        /* Botones */
        .btn-primary { background-color: #0284c7; color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 1.1rem; display: inline-block; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #0284c7; box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
        .btn-primary:hover { background-color: transparent; border: 2px solid #fff; transform: translateY(-3px); }
        
        /* Secciones */
        .section-padding { padding: 100px 20px; max-width: 1100px; margin: 0 auto; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
        
        .card { background: #1e293b; padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); }
        .tag { color: #38bdf8; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 0.9rem; margin-bottom: 10px; display: block; }
        h3 { font-size: 2.2rem; margin-top: 0; color: #fff; margin-bottom: 20px; }
        p { color: #94a3b8; line-height: 1.8; font-size: 1.05rem; }
        
        /* Footer */
        footer { border-top: 1px solid rgba(255,255,255,0.1); padding: 40px 20px; text-align: center; color: #64748b; font-size: 0.9rem; background: #0b0f19; }
      `}} />
      
      {/* Encabezado Nivel Corporativo */}
      <header>
          <h1>Basecamp 420</h1>
          <div className="nav-links">
              <a href="#historia">Quiénes Somos</a>
              <a href="#ubicacion">Local Físico</a>
              <a href="https://wa.me/522727258748?text=Hola,%20quisiera%20agendar%20una%20cita%20o%20vuelo." target="_blank" rel="noopener noreferrer" style={{color: '#38bdf8'}}>Contacto Directo</a>
          </div>
      </header>

      {/* Pantalla Principal (Video) */}
      <section className="hero">
          <iframe className="hero-video" 
              src="https://www.youtube.com/embed/cqxPXm6j_Cs?autoplay=1&mute=1&loop=1&playlist=cqxPXm6j_Cs&controls=0&showinfo=0&modestbranding=1" 
              allow="autoplay; fullscreen">
          </iframe>
          <div className="hero-overlay"></div>
          
          <div className="hero-content">
              <h2>BASECAMP 420</h2>
              <p>Vive la experiencia de tu vida. Vuelos en parapente, expediciones de alta montaña y conexión total con la naturaleza.</p>
              
              <a href="https://wa.me/522727258748?text=Hola,%20me%20gustar%C3%ADa%20informaci%C3%B3n%20para%20reservar%20una%20aventura." target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Inicia tu Aventura con Tulio
              </a>
          </div>
      </section>

      {/* Sección 1: Quiénes Somos / Historia */}
      <section id="historia" className="section-padding">
          <div className="grid-2">
              <div>
                  <span className="tag">Trayectoria & Pasión</span>
                  <h3>Más de 40 años impulsando el comercio y la aventura</h3>
                  <p>
                      Basecamp 420 nace de la evolución. Desde nuestras raíces en el comercio tradicional con Papelería Madera, hasta consolidarnos como pioneros en expediciones de alta montaña, vuelos en parapente y tecnología SaaS.
                  </p>
                  <p>
                      No solo vendemos un recorrido; garantizamos seguridad, equipos certificados y una comunidad auténtica de apasionados de la naturaleza con el Club Trepacerros.
                  </p>
              </div>
              <div className="card">
                  <span className="tag">Ecosistema Integrado</span>
                  <h4 style={{fontSize: '1.4rem', color: '#fff', marginTop: 0}}>Nuestras Marcas Aliadas</h4>
                  <ul style={{color: '#94a3b8', paddingLeft: '20px', lineHeight: '2'}}>
                      <li><strong style={{color: '#fff'}}>Basecamp Adventure:</strong> Vuelos en Parapente y Guías.</li>
                      <li><strong style={{color: '#fff'}}>Club Trepacerros:</strong> Comunidad de senderismo.</li>
                      <li><strong style={{color: '#fff'}}>Cima Digital:</strong> Desarrollo e Inteligencia Artificial.</li>
                      <li><strong style={{color: '#fff'}}>Papelería Madera:</strong> Tradición comercial y atención local.</li>
                  </ul>
              </div>
          </div>
      </section>

      {/* Sección 2: Ubicación Física & Contacto */}
      <section id="ubicacion" style={{background: '#1e293b'}} className="section-padding">
          <div className="card" style={{background: '#0f172a', textAlign: 'center', maxWidth: '800px', margin: '0 auto'}}>
              <span className="tag">Visítanos en Persona</span>
              <h3>Nuestra Base Operativa</h3>
              <p style={{fontSize: '1.1rem', color: '#e2e8f0'}}>
                  ¿Prefieres planear tu vuelo o expedition tomándote un café en persona? Te esperamos en nuestro local comercial físico.
              </p>
              
              <div style={{margin: '30px 0', padding: '20px', background: '#1e293b', borderRadius: '12px', textAlign: 'left'}}>
                  <p style={{margin: '5px 0', color: '#fff'}}>📍 <strong>Dirección:</strong> Visítanos en nuestra sucursal de atención a clientes (Papelería Madera / Basecamp 420 Hub).</p>
                  <p style={{margin: '5px 0', color: '#fff'}}>📞 <strong>Atención Telefónica / WhatsApp:</strong> 272 725 8748 (Agente Tulio listo para atenderte 24/7)</p>
                  <p style={{margin: '5px 0', color: '#fff'}}>⏰ <strong>Horario de atención:</strong> Lunes a Sábado de 9:00 AM a 8:00 PM</p>
              </div>

              <a href="https://wa.me/522727258748?text=Hola,%20me%20gustar%C3%ADa%20visitar%20el%20local%20f%C3%ADsico,%20%C2%BFme%20puedes%20compartir%20la%20ubicaci%C3%B3n?" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Solicitar Ubicación por Google Maps
              </a>
          </div>
      </section>

      <footer>
          <p>© 2026 Basecamp 420. Todos los derechos reservados. Impulsado por Cima Digital & Tulio AI Engine.</p>
      </footer>
    </>
  );
}
