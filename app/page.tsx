export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body { font-family: 'Inter', sans-serif; margin: 0; background-color: #000; color: #fff; }
        
        header { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; position: absolute; width: 100%; z-index: 10; box-sizing: border-box; }
        header h1 { margin: 0; font-size: 1.5rem; letter-spacing: 2px; text-transform: uppercase; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); }
        .nav-links a { color: #fff; text-decoration: none; margin-left: 20px; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); transition: color 0.3s; }
        .nav-links a:hover { color: #38bdf8; }
        
        .hero { position: relative; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden; padding: 20px; }
        .hero-video { position: absolute; top: 50%; left: 50%; width: 100vw; height: 56.25vw; min-height: 100vh; min-width: 177.77vh; transform: translate(-50%, -50%); pointer-events: none; z-index: 0; border: none; }
        
        .hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.3); z-index: 1; }
        
        .hero-content { position: relative; z-index: 2; max-width: 900px; }
        .hero-content h2 { font-size: 4.5rem; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 4px; text-shadow: 2px 4px 15px rgba(0,0,0,0.8); font-weight: 800; }
        .hero-content p { font-size: 1.4rem; color: #f8fafc; margin: 0 auto 40px; line-height: 1.6; text-shadow: 1px 2px 8px rgba(0,0,0,0.9); font-weight: 400; }
        
        .btn-primary { 
            background-color: #0284c7; 
            color: white; 
            padding: 18px 45px; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: bold; 
            font-size: 1.2rem; 
            display: inline-block; 
            transition: all 0.3s; 
            text-transform: uppercase; 
            letter-spacing: 1.5px; 
            border: 2px solid #0284c7; 
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }
        .btn-primary:hover { 
            background-color: transparent; 
            border: 2px solid #fff; 
            transform: scale(1.05); 
        }
      `}} />
      
      <header>
          <h1>Basecamp 420</h1>
          <div className="nav-links">
              <a href="#vuelos">Vuelos en Parapente</a>
              <a href="#tours">Tours de Montaña</a>
          </div>
      </header>

      <section className="hero">
          <iframe className="hero-video" 
              src="https://www.youtube.com/embed/cqxPXm6j_Cs?autoplay=1&mute=1&loop=1&playlist=cqxPXm6j_Cs&controls=0&showinfo=0&modestbranding=1" 
              allow="autoplay; fullscreen">
          </iframe>
          
          <div className="hero-overlay"></div>
          
          <div className="hero-content">
              <h2>BASECAMP 420</h2>
              <p>Vive la experiencia de tu vida. Vuelos en parapente, expediciones de alta montaña y conexión total con la naturaleza. Despierta tu espíritu aventurero con nosotros.</p>
              
              <a href="https://wa.me/522727258748?text=Hola,%20me%20gustar%C3%ADa%20informaci%C3%B3n%20para%20reservar%20una%20aventura." target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Inicia tu Aventura
              </a>
          </div>
      </section>
    </>
  );
}
      
