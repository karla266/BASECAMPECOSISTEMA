import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Vuelos en Parapente y Cursos APPI | Basecamp Explore',
  description: 'Despega en Fortín con Salvador Lara. Vuelos Tándem, Certificados de Regalo a MSI y Escuela de Vuelo APPI.',
};

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-12 md:py-16">
      <section className="bg-neutral-900 border border-amber-500/30 rounded-3xl p-6 md:p-10 my-12 text-white max-w-4xl mx-auto">
        <div className="text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Experiencia Insignia · Basecamp Explore
          </span>
          <h1 className="text-3xl md:text-5xl font-black mt-4 mb-3">
            Vuela en Parapente sobre las Altas Montañas
          </h1>
          <p className="text-neutral-300 text-sm md:text-base mb-8">
            Despega en Fortín de las Flores con el piloto APPI Master Salvador Lara. 
            Elige tu modalidad o canjea tu certificado:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left mb-6">
            {/* Venta Web */}
            <div className="bg-neutral-950 border border-emerald-500/40 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                  Mejor Precio Web · Ahorras $1,200
                </span>
                <h3 className="text-2xl font-black text-white mt-3 mb-1">$1,600 MXN</h3>
                <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
                  Pago directo en línea. Accede al calendario interactivo, elige tu turno (10:00, 12:00, 14:00 o 16:00 hrs) y aparta de inmediato.
                </p>
              </div>
              <a
                href="/calendario"
                className="w-full text-center bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3 px-4 rounded-xl text-sm transition"
              >
                Seleccionar Fecha y Pagar
              </a>
            </div>

            {/* Certificado en el sitio */}
            <div className="bg-neutral-950 border border-neutral-800 hover:border-yellow-400/70 rounded-2xl p-6 flex flex-col justify-between shadow-lg transition duration-300">
              <div>
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                  12 Meses Sin Intereses · Ideal Regalo
                </span>
                <h3 className="text-2xl font-black text-white mt-3 mb-1">$2,800 MXN</h3>
                <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
                  Aparta el certificado de vuelo en el sitio. El equipo confirma el folio y la entrega del empaque de regalo.
                </p>
              </div>
              <a
                href="/reservar"
                className="w-full text-center bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-extrabold py-3 px-4 rounded-xl text-sm transition"
              >
                Apartar certificado en el sitio
              </a>
            </div>
          </div>

          {/* Cursos APPI */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/40 rounded-2xl p-6 mb-8 text-left flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Escuela de Vuelo Libre APPI
              </span>
              <h3 className="text-xl font-black text-white">¿O prefieres aprender a volar tú mismo?</h3>
              <p className="text-neutral-400 text-xs max-w-xl">
                Conviértete en piloto autónomo con certificación internacional APPI. Curso completo $18,800 MXN (aparta tu lugar con anticipo de $3,800 MXN).
              </p>
            </div>
            <a
              href="/reservar"
              className="whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 px-6 rounded-xl text-sm transition shadow-md w-full md:w-auto text-center"
            >
              ¿O quieres un curso? Reserva tu plaza →
            </a>
          </div>

          {/* Canje de folio */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 text-center shadow-inner">
            <h4 className="text-white font-bold text-lg mb-2">
              🎟️ ¿Recibiste un Certificado de Regalo?
            </h4>
            <p className="text-neutral-400 text-xs mb-5 max-w-lg mx-auto">
              Si ya tienes un certificado de regalo, ingresa tu número de folio para elegir fecha sin volver a pagar:
            </p>
            <form action="/calendario" method="GET" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="text" 
                name="folio" 
                placeholder="Ej. 20260000001" 
                required 
                className="flex-1 bg-neutral-900 border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
              <button 
                type="submit" 
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-3 rounded-xl text-sm transition shadow-md"
              >
                Validar y Agendar
              </button>
            </form>
          </div>

          <p className="text-neutral-500 text-[11px] mt-8">
            ¿Dudas técnicas o meteorológicas? Habla directo con el centro de vuelo al <strong>+52 272 725 8748</strong>.
          </p>
        </div>
      </section>
    </main>
  );
}