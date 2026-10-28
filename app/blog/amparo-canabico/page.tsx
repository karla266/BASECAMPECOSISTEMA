import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Manual Completo: Cómo Tramitar tu Amparo Canábico en México (Presencial y en Línea)',
  description:
    'Guía completa para tramitar un amparo canábico en México: fundamento legal, CIS COFEPRIS, DIGIPRIS, e.firma y demanda de amparo indirecto.',
  openGraph: {
    title: 'Manual Completo: Cómo Tramitar tu Amparo Canábico en México (Presencial y en Línea)',
    description:
      'Guía legal y práctica para presentar amparo canábico en México, con información sobre COFEPRIS, DIGIPRIS y Juzgados de Distrito.',
    type: 'article',
    url: 'https://www.Basecamp420.com/blog/amparo-canabico',
    siteName: 'Basecamp 420',
  },
};

const sections = [
  {
    id: 'fundamento-legal',
    title: '1. Fundamento legal (jurisprudencia SCJN y libre desarrollo de la personalidad)',
    content:
      'El punto de partida es la tutela constitucional que reconoce la libertad de desarrollo de la personalidad y la protección de la vida privada, así como la exigencia de que las autoridades no interfieran de manera arbitraria en decisiones íntimas y personales. En el ámbito canábico, el derecho se sostiene en la interpretación de que el uso personal, el autoconsumo y la disponibilidad privada no pueden ser sancionados sin una base normativa sólida y proporcional. La jurisprudencia de la Suprema Corte de Justicia de la Nación aporta el marco para diferenciar entre prohibiciones absolutas y acciones que se desarrollan en el ámbito privado, respetando la dignidad humana.',
  },
  {
    id: 'tramite-presencial',
    title: '2. Trámite presencial en CIS COFEPRIS',
    content:
      'El trámite presencial suele iniciar con una revisión de requisitos, identificación oficial, CURP, domicilio y acreditar la intención de consumo o manejo personal. Es recomendable preparar una narrativa clara y breve, con información sobre la finalidad personal y la ausencia de actividades comerciales. En la mayoría de los casos, la atención tiene como objetivo evaluar la solicitud y, si corresponde, orientar la entrega de documentación o canalizar la revisión administrativa. La paciencia, la organización y la constancia son cruciales, porque muchas diligencias son susceptibles a revisión documental y a la necesidad de complementar información.',
  },
  {
    id: 'tramite-digital',
    title: '3. Trámite digital vía DIGIPRIS con e.firma',
    content:
      'La vía digital se apoya en la plataforma DIGIPRIS y exige la integración de la e.firma o la firma electrónica confiable para validar la identidad del solicitante. En esta etapa, se debe preparar la documentación en formato legible, asegurar la versión final del escrito y revisar el nombre, domicilio, CURP y datos de contacto antes de enviar. Si se presentan inconsistencias, la plataforma puede requerir corrección o aclaración. En la práctica, una preparación previa reduce errores y acelera la atención del expediente.',
  },
  {
    id: 'amparo-indirecto',
    title: '4. Demanda de amparo indirecto ante Juzgados de Distrito del PJF',
    content:
      'Cuando una autoridad actúa de manera puntual o se niega injustificadamente al reconocimiento de un derecho, puede plantearse una demanda de amparo indirecto ante el Juzgado de Distrito del Poder Judicial de la Federación. La demanda debe fundamentarse en los actos u omisiones que afectan la libertad personal y el desarrollo de la personalidad, además de describir de forma específica la vulneración y el medio de defensa solicitado. En ese tipo de procedimiento, es crucial reunir pruebas, describir los hechos con precisión y acompañar el escrito con documentos que respalden la situación real del solicitante.',
  },
];

export default function AmparoCanabicoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <article className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-16">
        <header className="mb-10 border-b border-slate-800 pb-8">
          <div className="mb-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">
            Blog &amp; recursos comunitarios
          </div>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
            Manual Completo: Cómo Tramitar tu Amparo Canábico en México (Presencial y en Línea)
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Guía práctica para entender el marco legal, preparar tu trámite en CIS COFEPRIS, realizarlo en DIGIPRIS con e.firma y, cuando sea necesario, presentar una demanda de amparo indirecto con fundamentos sólidos.
          </p>
        </header>

        <aside className="mb-10 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-cyan-500/10 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">Descarga gratuita</p>
              <p className="mt-2 text-2xl font-bold text-white">Manual de Amparo Canábico 2026</p>
            </div>
            <a
              href="/descargas/Manual_Amparo_Canabico_2026.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              Descargar PDF
            </a>
          </div>
        </aside>

        <div className="prose prose-invert max-w-none text-slate-200">
          <section className="mb-10 rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-bold text-white">Resumen ejecutivo</h2>
            <p className="text-base leading-8 text-slate-300">
              El amparo canábico en México no es una “solicitud especial” aislada del sistema jurídico; es una lectura del marco constitucional y de la jurisprudencia que busca proteger la libertad personal, la autonomía y la privacidad. El proceso puede estructurarse en dos grandes caminos: la atención administrativa en la autoridad sanitaria o en plataformas digitales, y la defensa judicial ante un Juzgado de Distrito cuando la autoridad actúa contraviniendo la protección constitucional. La clave es estar informado, documentar adecuadamente y actuar con estrategia.
            </p>
          </section>

          {sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-10 scroll-mt-24 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8">
              <h2 className="mb-4 text-2xl font-bold text-white">{section.title}</h2>
              <p className="text-base leading-8 text-slate-300">{section.content}</p>
            </section>
          ))}

          <section className="mb-10 rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-bold text-white">Llamado a la acción</h2>
            <p className="text-base leading-8 text-slate-300">
              Si necesitas ayuda para iniciar tu trámite, confirmar requisitos o resolver dudas sobre tu caso, escríbenos por WhatsApp y te orientaremos con información práctica y cercana. También puedes regresar a la web principal para seguir explorando recursos y servicios de Basecamp 420.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <a
                href="https://wa.me/522727258748?text=Hola%20Basecamp%20420%2C%20quiero%20asesor%C3%ADa%20sobre%20mi%20amparo%20can%C3%A1bico%20y%20el%20manual%20del%20amparo."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-[#1fbf5f]"
              >
                Hablar por WhatsApp
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-bold text-slate-100 transition hover:border-slate-500 hover:text-white"
              >
                Volver a Basecamp 420
              </Link>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
