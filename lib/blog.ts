export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  category: string;
  publishedAt: string;
  author: string;
  highlights: string[];
  content: string[];
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "cuanto-cuesta-volar-en-parapente-fortin",
    title: "¿Cuánto cuesta volar en parapente en Fortín y Orizaba?",
    summary:
      "Desglose claro de tarifas para reservar tu vuelo tándem: precio web directo de $1,600 MXN y canje con certificado de Mercado Libre por $2,800 MXN.",
    seoTitle: "Costo de vuelo en parapente en Fortín | Basecamp 420",
    seoDescription:
      "Conoce el costo real para volar en parapente tándem en Fortín y Orizaba: $1,600 MXN vía web y $2,800 MXN con certificado de Mercado Libre.",
    category: "Vuelos Tándem",
    publishedAt: "2026-10-28",
    author: "Basecamp 420",
    highlights: [
      "Tarifa web directa: $1,600 MXN por persona.",
      "Tarifa con certificado Mercado Libre: $2,800 MXN.",
      "Reserva online y confirmación con pago seguro.",
    ],
    content: [
      "En Basecamp 420 establecimos una estructura de precios transparente para los vuelos tándem en parapente con salida desde la zona de Fortín y cobertura del Valle de Orizaba.",
      "La tarifa preferente para clientes que reservan directamente en nuestra web es de $1,600 MXN. Esta opción está orientada a generar reservas rápidas, seguimiento de agenda y confirmación inmediata.",
      "También mantenemos la modalidad de canje con certificado físico de Mercado Libre por $2,800 MXN, diseñada para usuarios que ya adquirieron ese formato y requieren validar su folio durante el proceso.",
      "Nuestro flujo de cobro ya separa ambas modalidades para evitar confusiones: pago en línea para web directa y validación manual para certificado.",
    ],
  },
  {
    slug: "alianza-salvador-lara-escuela-parapentitis",
    title: "Alianza oficial con Salvador Lara y Escuela Parapentitis",
    summary:
      "Presentamos la alianza estratégica para formación APPI: 33 años de trayectoria y curso integral valuado en $30,000 MXN.",
    seoTitle: "Alianza APPI Basecamp 420 y Parapentitis",
    seoDescription:
      "Basecamp 420 formaliza alianza con Salvador Lara (33 años de experiencia) y Escuela Parapentitis para cursos APPI de $30,000 MXN.",
    category: "Escuela de Vuelo",
    publishedAt: "2026-10-28",
    author: "Basecamp 420",
    highlights: [
      "Instructor líder con 33 años de trayectoria comprobada.",
      "Curso APPI con valor de $30,000 MXN.",
      "Proceso formativo técnico con respaldo operativo local.",
    ],
    content: [
      "Basecamp 420 integró una alianza operativa con Salvador Lara y la Escuela Parapentitis para profesionalizar la oferta de formación en vuelo libre dentro del corredor Orizaba-Fortín.",
      "El programa principal mantiene un costo total de $30,000 MXN e integra sesiones técnicas, práctica supervisada y evaluación progresiva conforme a los estándares de formación APPI.",
      "Esta colaboración permite unificar la infraestructura comercial de Basecamp con la experiencia formativa de Parapentitis, consolidando una ruta clara para nuevos pilotos.",
      "El objetivo de la alianza es elevar la calidad de instrucción y crear continuidad entre experiencia turística, entrenamiento técnico y certificación.",
    ],
  },
  {
    slug: "bitacora-piloto-de-appi2-a-biplaza-comercial",
    title: "Bitácora técnica: de APPI 2 a ruta de biplaza comercial",
    summary:
      "Evolución del perfil técnico del piloto: reconocimiento APPI 2, más de 150 vuelos bitacorados de montaña y progresión hacia operación tándem comercial.",
    seoTitle: "Bitácora APPI 2 y progresión a tándem comercial",
    seoDescription:
      "Conoce la progresión técnica desde APPI 2 hasta la preparación para biplaza comercial con más de 150 vuelos bitacorados.",
    category: "Bitácora Técnica",
    publishedAt: "2026-10-28",
    author: "Basecamp 420",
    highlights: [
      "Licencia APPI 2 reconocida en operación actual.",
      "Más de 150 vuelos de montaña registrados en bitácora.",
      "Ruta de crecimiento hacia certificación tándem comercial.",
    ],
    content: [
      "La madurez operativa en parapente no se improvisa: se construye con horas de vuelo, decisiones en condiciones reales y una bitácora consistente.",
      "En nuestro ecosistema técnico reconocemos formalmente una base APPI 2 respaldada por más de 150 vuelos bitacorados de montaña, con foco en seguridad, criterio meteorológico y control de maniobra.",
      "Ese historial se convierte en el punto de partida para una progresión profesional hacia biplaza comercial, donde la disciplina en protocolos y briefing al pasajero se vuelve crítica.",
      "La bitácora es evidencia de proceso, no solo volumen de vuelos: por eso documentamos cada etapa como parte del estándar que compartimos con alumnos y aliados.",
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS];
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
