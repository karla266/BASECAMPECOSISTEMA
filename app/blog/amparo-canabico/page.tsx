import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kit Completo de Amparo Canábico 2026: 4 Manuales en PDF | Basecamp 420',
  description: 'Descarga gratis los 4 manuales paso a paso: trámites COFEPRIS (presencial y DIGIPRIS) y demandas de amparo indirecto (físico y en línea).',
};

const manuales = [
  {
    titulo: '1. COFEPRIS Presencial',
    desc: 'Formato libre y requisitos para ventanillas CIS y jurisdicciones sanitarias.',
    url: '/descargas/Manual_COFEPRIS_Presencial.pdf',
    tag: 'Fase 1 · Ventanilla'
  },
  {
    titulo: '2. COFEPRIS Digital (DIGIPRIS)',
    desc: 'Guía paso a paso para tramitar en línea con tu e.firma del SAT.',
    url: '/descargas/Manual_COFEPRIS_Digital.pdf',
    tag: 'Fase 1 · En Línea'
  },
  {
    titulo: '3. Amparo Indirecto Presencial',
    desc: 'Modelo de demanda física ante Juzgados de Distrito del Poder Judicial.',
    url: '/descargas/Manual_Amparo_Presencial.pdf',
    tag: 'Fase 2 · Juzgados'
  },
  {
    titulo: '4. Juicio de Amparo en Línea',
    desc: 'Presentación digital de demanda en el Portal de Servicios en Línea del PJF.',
    url: '/descargas/Manual_Amparo_En_Linea.pdf',
    tag: 'Fase 2 · PJF Digital'
  }
];

export default function AmparoCanabicoPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-12 md:py-16">
      <article className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <span className="text-amber-500 font-bold uppercase tracking-widest text-xs bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            Recurso Gratuito a la Comunidad
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mt-4 mb-4 leading-tight">
            Kit de Amparo Canábico México: Los 4 Manuales Oficiales
          </h1>
          <p className="text-neutral-400 text-sm">
            Movimiento Canábico Orizaba &amp; Basecamp 420 · Cobertura Presencial y Digital
          </p>
        </header>

        {/* Cuadrícula de 4 Descargas */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            📥 Selecciona el manual que necesitas descargar (PDF gratuito):
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {manuales.map((m, idx) => (
              <div key={idx} className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 rounded-2xl p-5 flex flex-col justify-between transition">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {m.tag}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2 mb-1">{m.titulo}</h3>
                  <p className="text-neutral-400 text-xs mb-4">{m.desc}</p>
                </div>
                <a
                  href={m.url}
                  download
                  className="w-full text-center bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 px-4 rounded-xl text-sm transition shadow-md"
                >
                  Descargar PDF
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Resumen Jurídico */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6 text-neutral-300 text-sm leading-relaxed mb-12">
          <h2 className="text-xl font-bold text-white border-b border-neutral-800 pb-3">
            Ruta Crítica del Trámite
          </h2>
          <p>
            <strong>Paso 1 (COFEPRIS):</strong> Para ejercer tu derecho al libre desarrollo de la personalidad, primero debes solicitar la autorización sanitaria ante COFEPRIS (vía presencial con acuse o vía DIGIPRIS con tu e.firma).
          </p>
          <p>
            <strong>Paso 2 (Juzgados de Distrito):</strong> Si COFEPRIS no responde en 40 días hábiles o emite una respuesta negativa, se promueve el Juicio de Amparo Indirecto ante el Poder Judicial de la Federación para obligar la emisión del permiso conforme a la jurisprudencia de la SCJN.
          </p>
        </div>

        {/* Pie con WhatsApp */}
        <footer className="text-center pt-8 border-t border-neutral-800">
          <p className="text-neutral-400 text-sm mb-4">¿Tienes dudas con el llenado de los formatos o tu e.firma?</p>
          <a
            href="/reservar"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-full text-sm transition"
          >
            🛒 Reservar o completar el trámite en línea
          </a>
        </footer>
      </article>
    </main>
  );
}
