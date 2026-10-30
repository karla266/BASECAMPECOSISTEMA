export const TONOS = ["formal", "aventurero", "tecnico", "comercial"] as const;

export type TonoMultiservicio = (typeof TONOS)[number];

export interface MultiservicioConfig {
  service_id: string;
  is_active: boolean;
  base_price: number;
  system_prompt: string;
  tone: TonoMultiservicio;
  allow_stock_query: boolean;
  allow_price_quote: boolean;
  strict_guardrails: string[];
}

export type Multiservicio = {
  id: string;
  titulo: string;
  texto: string;
  config: MultiservicioConfig;
};

function config(
  service_id: string,
  tone: TonoMultiservicio,
  system_prompt: string,
  strict_guardrails: string[],
  flags: { allow_stock_query?: boolean; allow_price_quote?: boolean; base_price?: number } = {}
): MultiservicioConfig {
  return {
    service_id,
    is_active: true,
    base_price: flags.base_price ?? 0,
    system_prompt,
    tone,
    allow_stock_query: flags.allow_stock_query ?? false,
    allow_price_quote: flags.allow_price_quote ?? false,
    strict_guardrails,
  };
}

export const MULTISERVICIOS: Multiservicio[] = [
  {
    id: "renta_equipo",
    titulo: "Renta de equipo",
    texto: "Sleeping, casa de campaña y equipo de montaña. No cobra en el mostrador.",
    config: config(
      "renta_equipo",
      "tecnico",
      "Vendes renta de equipo de camping y montaña en Basecamp 420. Explicas qué incluye, el depósito y la fecha de devolución. Si el sleeping es negro, dilo antes de cerrar.",
      [
        "Si el sleeping es negro, dilo antes de cerrar la renta.",
        "No inventes existencias ni el monto del depósito.",
        "No cobres desde el chat: el cobro es en el mostrador.",
      ],
      { allow_stock_query: true, allow_price_quote: true }
    ),
  },
  {
    id: "impresiones",
    titulo: "Impresiones",
    texto: "Copias, impresiones y escaneo en el local.",
    config: config(
      "impresiones",
      "tecnico",
      "Atiendes impresiones, copias y escaneo en el local. Preguntas tamaño, color o blanco y negro, y cantidad.",
      ["No inventar existencias.", "No cobrar desde el chat."]
    ),
  },
  {
    id: "tours_actividades",
    titulo: "Tours y actividades",
    texto: "Salidas y actividades que se apartan aparte del mostrador.",
    config: config(
      "tours_actividades",
      "comercial",
      "Vendes tours y actividades. Preguntas fecha, número de personas y si necesitan equipo. No confirmes cupo si no está apartado.",
      ["No inventar existencias.", "No cobrar desde el chat."]
    ),
  },
  {
    id: "vuelos_parapente",
    titulo: "Vuelos y parapente",
    texto: "Vuelos y cursos de parapente con Salvador Lara.",
    config: config(
      "vuelos_parapente",
      "aventurero",
      "Explicas vuelos y cursos de parapente en Basecamp 420: horario, peso, clima y qué debe traer la persona. Si el clima no permite volar, no cierras la venta. El contacto de la escuela es el WhatsApp 2727258748.",
      [
        "Si el clima no permite volar, no cierres la venta.",
        "No inventes horarios, pesos máximos ni cupos.",
        "No cobres desde el chat.",
      ],
      { allow_price_quote: true }
    ),
  },
  {
    id: "papeleria",
    titulo: "Papelería",
    texto: "Engargolado, plastificado y trabajos de papelería.",
    config: config(
      "papeleria",
      "comercial",
      "Atiendes papelería: engargolado, plastificado y trabajos sobre pedido. Describes el resultado y el tiempo de entrega en el local.",
      ["No inventar existencias.", "No cobrar desde el chat."]
    ),
  },
  {
    id: "atencion_whatsapp",
    titulo: "Atención WhatsApp (2727258748)",
    texto: "El WhatsApp contesta y manda el cobro al mostrador.",
    config: config(
      "atencion_whatsapp",
      "comercial",
      "Atiendes el WhatsApp 2727258748 de Basecamp 420. Respondes corto, en español, y ofreces pasar al local o al mostrador para cobrar.",
      [
        "Responde en español, corto, como Basecamp 420.",
        "El WhatsApp de contacto es 2727258748.",
        "No inventes existencias.",
        "No cobres desde el chat: ofrece pasar al local o al mostrador.",
      ]
    ),
  },
];

export function semilla(): Record<string, MultiservicioConfig> {
  return Object.fromEntries(MULTISERVICIOS.map((item) => [item.id, { ...item.config, strict_guardrails: [...item.config.strict_guardrails] }]));
}

export function configInicial(id: string): MultiservicioConfig | null {
  const encontrada = MULTISERVICIOS.find((item) => item.id === id);
  if (!encontrada) return null;
  return { ...encontrada.config, strict_guardrails: [...encontrada.config.strict_guardrails] };
}

export function esTono(valor: string): valor is TonoMultiservicio {
  return (TONOS as readonly string[]).includes(valor);
}

export function idsMultiservicio(): Set<string> {
  return new Set(MULTISERVICIOS.map((item) => item.id));
}
