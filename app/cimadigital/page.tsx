export default function CimaDigital() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; margin: 0; background-color: #0b0f19; color: #fff; }
        
        header { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; position: fixed; width: 100%; z-index: 50; box-sizing: border-box; background: rgba(11, 15, 25, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.08); }
        header h1 { margin: 0; font-size: 1.4rem; letter-spacing: 2px; text-transform: uppercase; color: #38bdf8; }
        .nav-links a { color: #cbd5e1; text-decoration: none; margin-left: 20px; font-weight: 600; font-size: 0.95rem; transition: color 0.3s; }
        .nav-links a:hover { color: #38bdf8; }
        
        .hero { padding: 160px 20px 100px; text-align: center; max-width: 900px; margin: 0 auto; }
        .hero h2 { font-size: 3.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 20px; background: linear-gradient(135deg, #fff 0%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: 1.2rem; color: #94a3b8; line-height: 1.7; margin-bottom: 40px; }
        
        .btn-glow { background: #0284c7; color: #fff; padding: 16px 36px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 1rem; display: inline-block; box-shadow: 0 0 25px rgba(2, 132, 199, 0.5); transition: all 0.3s; border: 1px solid #38bdf8; }
        .btn-glow:hover { transform: translateY(-3px); box-shadow: 0 0 35px rgba(2, 132, 199, 0.8); }
        
        .section { padding: 80px 20px; max-width: 1100px; margin: 0 auto; }
        .tag { color: #38bdf8; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 0.85rem; margin-bottom: 10px; display: block; }
        
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 40px; }
        .card { background: #111827; border: 1px solid rgba(255,255,255,0.08); padding: 35px; border-radius: 20px; transition: transform 0.3s; }
        .card:hover { transform: translateY(-5px); border-color: rgba(56, 189, 248, 0.4); }
        .card h4 { font-size: 1.3rem; margin-top: 0; color: #fff; margin-bottom: 15px; }
        .card p { color: #94a3b8; line-height: 1.6; font-size: 0.95rem; }
        
        .pricing-card { background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 2px solid #0284c7; padding: 40px; border-radius: 24px; text-align: center; }
        
        footer { border-top: 1px solid rgba(255,255,255,0.08); padding: 40px 20px; text-align: center; color: #64748b; font-size: 0.9rem; background: #070a12; }
      `}} />
      
      <header>
          <h1>Cima Digital</h1>
          <div className="nav-links">
              <a href="/">← Regresar a Basecamp 420</a>
              <a href="#servicios">Servicios IA</a>
              <a href="#orquestador">Orquestador SaaS</a>
              <a href="#contacto" style={{color: '#38bdf8'}}>Cotizar Proyecto</a>
          </div>
      </header>

      <section className="hero">
          <span className="tag">Evolución Tecnológica de Ciber Madera</span>
          <h2>Transforma tu negocio con Agentes de IA y Arquitectura SaaS</h2>
          <p>Desarrollamos soluciones digitales avanzadas: desde chatbots inteligentes conectados a tus inventarios hasta plataformas multi-inquilino (Multi-tenant) para empresas y comercios de la región.</p>
          <a href="https://wa.me/522727258748?text=Hola,%20me%20interesa%20una%20consultor%C3%ADa%20de%20Cima%20Digital%20para%20mi%20negocio." target="_blank" rel="noopener noreferrer" className="btn-glow">
              Hablar con Tulio (Asistente IA)
          </a>
      </section>

      <section id="servicios" className="section">
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
              <span className="tag">Soluciones B2B</span>
              <h3 style={{fontSize: '2.2rem', margin: 0}}>Tecnología a la Medida</h3>
          </div>

          <div className="grid-3">
              <div className="card">
                  <span className="tag">Automatización 24/7</span>
                  <h4>Agentes Virtuales de Voz & WhatsApp</h4>
                  <p>Implementamos asistentes como Tulio con capacidad para consultar bases de datos locales (MySQL, SICAR) y responder existencias o precios al instante.</p>
              </div>

              <div className="card">
                  <span className="tag">Infraestructura SaaS</span>
                  <h4>Plataformas Multi-Tenant</h4>
                  <p>Modelos de software escalables con subdominios independientes para cada cliente (ej. <em>cliente.basecamp420.com</em>) con enrutamiento dinámico.</p>
              </div>

              <div className="card">
                  <span className="tag">Soporte Local</span>
                  <h4>Desarrollo & Servicios Físicos</h4>
                  <p>Mantenemos la herencia de Ciber Madera ofreciendo servicios de impresión, digitalización y desarrollo web desde nuestro local comercial.</p>
              </div>
          </div>
      </section>

      <section id="orquestador" className="section">
          <div className="pricing-card">
              <span className="tag">Panel de Control Unificado</span>
              <h3 style={{fontSize: '2rem', marginTop: '10px', color: '#fff'}}>Orquestador Cima Digital</h3>
              <p style={{maxWidth: '650px', margin: '15px auto 30px', color: '#cbd5e1'}}>
                  Administra todas tus marcas (The Trip Smokeshop, Basecamp Adventure, Trepacerros, Fisiozoom, Parapentitis) desde un solo panel de control centralizado.
              </p>
              <a href="/admin" className="btn-glow" style={{background: 'transparent', border: '2px solid #38bdf8'}}>
                  Acceder al Panel Admin
              </a>
          </div>
      </section>

      <section id="contacto" className="section" style={{textAlign: 'center'}}>
          <span className="tag">Contacto Comercial</span>
          <h3 style={{fontSize: '2rem'}}>¿Listo para automatizar tu empresa?</h3>
          <p style={{color: '#94a3b8', marginBottom: '30px'}}>Visítanos en nuestro hub tecnológico o escríbenos directamente por WhatsApp.</p>
          <a href="https://wa.me/522727258748?text=Hola,%20busco%20desarrollar%20un%20proyecto%20web/IA%20con%20Cima%20Digital." target="_blank" rel="noopener noreferrer" className="btn-glow">
              Iniciar Proyecto con Cima Digital
          </a>
      </section>

      <footer>
          <p>© 2026 Cima Digital. División Tecnológica de Basecamp 420. Todos los derechos reservados.</p>
      </footer>
    </>
  );
}
