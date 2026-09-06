export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body { font-family: 'Inter', sans-serif; margin: 0; background-color: #f4f7f6; color: #333; }
        header { background-color: #111827; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 10; }
        header h1 { color: #fff; margin: 0; font-size: 1.5rem; letter-spacing: 1px; }
        .nav-links a { color: #9ca3af; text-decoration: none; margin-left: 20px; transition: color 0.3s; font-weight: 400; }
        .nav-links a:hover { color: #3b82f6; }
        .hero { position: relative; height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: white; overflow: hidden; padding: 20px; }
        .hero-video { position: absolute; top: 50%; left: 50%; width: 100vw; height: 56.25vw; min-height: 100vh; min-width: 177.77vh; transform: translate(-50%, -50%); pointer-events: none; z-index: 0; }
        .hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(17, 24, 39, 0.55); z-index: 1; }
        .hero-content { position: relative; z-index: 2; max-width: 850px; }
        .hero-content h2 { font-size: 3.5rem; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px; }
        .hero-content p { font-size: 1.25rem; color: #e5e7eb; margin: 0 auto 35px; line-height: 1.6; }
        .btn-primary { background-color: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem; display: inline-block; transition: background 0.3s; }
        .btn-primary:hover { background-color: #2563eb; }
        .features { display: flex; justify-content: center; gap: 30px; padding: 70px 20px; flex-wrap: wrap; background-color: #ffffff; }
        .feature-box { background: #f8fafc; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; max-width: 320px; border: 1px solid #e2e8f0; }
        .feature-box h3 { color: #111827; font-size: 1.3rem; margin-bottom: 15px; }
        .feature-box p { color: #475569; line-height: 1.5; }
        .pricing { text-align: center; padding: 70px 20px; background-color: #f4f7f6; }
        .pricing-cards { display: flex; justify-content: center; gap: 30px; margin-top: 50px; flex-wrap: wrap; }
        .plan { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px 20px; width: 320px; transition: transform 0.3s; position: relative;}
        .plan:hover { transform: translateY(-8px); border-color: #3b82f6; box-shadow: 0 15px 25px rgba(0,0,0,0.1); }
        .plan h3 { margin-top: 0; font-size: 1.4rem; color: #1e293b; }
        .price { font-size: 2.8rem; font-weight: bold; color: #111827; margin: 20px 0; }
        .plan ul { list-style: none; padding: 0; color: #6b7280; margin-bottom: 30px; text-align: left; padding-left: 20px; }
        .plan ul li { margin-bottom: 12px; position: relative; }
        .plan ul li::before { content: '✓'; color: #3b82f6; position: absolute; left: -20px; font-weight: bold; }
        .plan-destacado { border: 2px solid #3b82f6; background-color: #f0f9ff; }
        .badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #3b82f6; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
        footer { background: #111827; color: #6b7280; text-align: center; padding: 25px; font-size: 0.9rem; }
      `}} />
      
      <header>
          <h1>BASECAMP 420</h1>
          <div className="nav-links">
              <a href="#soluciones">El Ecosistema</a>
              <a href="#precios">Planes</a>
              <a href="#contacto">Contacto</a>
          </div>
      </header>

      <section className="hero">
          <iframe className="hero-video" 
              src="https://www.youtube.com/embed/cqxPXm6j_Cs?autoplay=1&mute=1&loop=1&playlist=cqxPXm6j_Cs&controls=0&showinfo=0&modestbranding=1" 
              frameBorder="0" allow="autoplay; fullscreen">
          </iframe>
          <div className="hero-overlay"></div>
          <div className="hero-content">
              <h2>Aventureros 420</h2>
              <p>Transformando la montaña en México. Relájate y enfócate en tu aventura mientras nuestra Inteligencia Artificial y automatización se encargan de las ventas y el inventario de tu negocio.</p>
              <a href="#contacto" className="btn-primary">Solicitar mis 30 días de prueba</a>
          </div>
      </section>

      <section id="soluciones" className="features">
          <div className="feature-box">
              <h3>🌐 Mini-Sitios Web Inteligentes</h3>
              <p>Tu propia sucursal digital. Conectamos tu inventario masivo con plantillas autoadministrables. Tú despachas, nosotros operamos tu web.</p>
          </div>
          <div className="feature-box">
              <h3>🤖 Asistente IA (Tulio)</h3>
              <p>Atención automatizada 24/7. Tus vendedores consultan existencias y precios en tiempo real directo a SICAR solo usando su voz.</p>
          </div>
          <div className="feature-box">
              <h3>📞 Enrutamiento de Leads</h3>
              <p>Filtramos prospectos con Twilio. Si un cliente está listo para comprar, te entra una llamada o WhatsApp directo al mostrador.</p>
          </div>
      </section>

      <section id="precios" className="pricing">
          <h2>Plataforma Tecnológica Integral</h2>
          <p style={{color: '#64748b', marginBottom: '40px'}}>Soluciones para negocios que quieren dominar su mercado.</p>
          
          <div className="pricing-cards">
              <div className="plan">
                  <h3>Basecamp Digital</h3>
                  <div className="price">$499<small style={{fontSize: '1rem', color: '#94a3b8'}}>/mes</small></div>
                  <ul>
                      <li>1 Mini-sitio web personalizado</li>
                      <li>Subida masiva por CSV</li>
                      <li>Generación de imágenes por IA</li>
                      <li>Soporte técnico estándar</li>
                  </ul>
                  <a href="#contacto" className="btn-primary" style={{backgroundColor: '#64748b', width: '80%', boxSizing: 'border-box'}}>Elegir Plan</a>
              </div>
              
              <div className="plan plan-destacado">
                  <div className="badge">RECOMENDADO</div>
                  <h3>Ecosistema IA 360°</h3>
                  <div className="price">$999<small style={{fontSize: '1rem', color: '#94a3b8'}}>/mes</small></div>
                  <ul>
                      <li>Todo lo del plan Digital</li>
                      <li><b>Asistente de Voz IA en Mostrador</b></li>
                      <li>Integración bidireccional SICAR</li>
                      <li>Automatización Redes y YouTube</li>
                      <li>Enrutamiento de prospectos (Twilio)</li>
                  </ul>
                  <a href="#contacto" className="btn-primary" style={{width: '80%', boxSizing: 'border-box'}}>Solicitar Acceso</a>
              </div>
          </div>
      </section>

      <footer id="contacto">
          <p>¿Listo para transformar tu negocio? Escríbenos para evaluar tu integración.</p>
          <br />
          &copy; 2026 Basecamp 420. Transformando la montaña y la tecnología en México.
      </footer>
    </>
  );
}
