export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; margin: 0; background-color: #0f172a; color: #fff; }
        
        /* Navegación Fija */
        header { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; position: fixed; width: 100%; z-index: 50; box-sizing: border-box; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); }
        header h1 { margin: 0; font-size: 1.5rem; letter-spacing: 2px; text-transform: uppercase; }
        .nav-links a { color: #cbd5e1; text-decoration: none; margin-left: 20px; font-weight: 600; transition: color 0.3s; }
        .nav-links a:hover { color: #38bdf8; }
        
        /* Banner de Evento Especial */
        .event-banner { background: linear-gradient(90deg, #d97706, #dc2626); color: #fff; text-align: center; padding: 12px 20px; font-weight: bold; font-size: 0.95rem; letter-spacing: 0.5px; position: relative; z-index: 51; margin-top: 70px; }
        
        /* Hero Video */
        .hero { position: relative; height: 90vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden; padding: 20px; }
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
              <a href="#aniversario" style={{color: '#fbbf24'}}>🎉 Aniversario Cerro Gentil</a>
              <a href="#historia">Nuestra Historia</a>
              <a href="#ecosistema">Ecosistema</a>
              <a href="#contacto">Local Físico</a>
          </div>
      </header>

      {/* Banner de Aniversario / 15 de Septiembre */}
      <div className="event-banner" id="aniversario">
          🇲🇽 ¡PRÓXIMA SEMANA: Aniversario del Club Trepacerros en el Cerro del Gentil & Festejo del 15 de Septiembre! (Expedición Gratuita de la Comunidad)
      </div>

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
              
              <a href="https://wa.me/522727258748?text=Hola,%20me%20gustar%C3%ADa%20informaci%C3%B3n%20sobre%20los%20tours,%20Smokeshop,%20equipo%20o%20vuelos." target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Habla con Tulio por WhatsApp
              </a>
          </div>
      </section>

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
                  <p style={{margin: '8px 0', color: '#fff'}}>📞 <strong>WhatsApp / Teléfono:</strong> 272 725 8748 (Atención automatizada con Tulio AI)</p>
                  <p style={{margin: '8px 0', color: '#fff'}}>📺 <strong>YouTube Oficial:</strong> basecamp420trepacerros</p>
              </div>

              <a href="https://wa.me/522727258748?text=Hola,%20me%20gustar%C3%ADa%20visitar%20el%20local%20f%C3%ADsico,%20%C2%BFme%20puedes%20compartir%20la%20ubicaci%C3%B3n%20exacta?" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Ubicación de la Tienda por Google Maps
              </a>
          </div>
      </section>

      <footer>
          <p>© 2026 Basecamp 420. Todos los derechos reservados. Impulsado por Cima Digital & Tulio AI Engine.</p>
      </footer>
    </>
  );
}
