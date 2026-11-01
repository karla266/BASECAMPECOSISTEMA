const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");

function leerJson(relativo) {
  return JSON.parse(fs.readFileSync(path.join(raiz, relativo), "utf8"));
}

function leerTexto(relativo) {
  return fs.readFileSync(path.join(raiz, relativo), "utf8");
}

function pesosDesdeCentavos(centavos) {
  return Math.trunc(Number(centavos) / 100);
}

function normalizar(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const pilotos = leerJson("data/directorio_pilotos.json").slice().sort((a, b) => a.prioridad - b.prioridad);
const anturios = leerJson("data/anturios.json");
const menu = leerJson("data/menu_palapa.json");
const tenant = leerJson("tenant.config.json");
const modelo = leerTexto("notebooklm_sources/01_modelo_negocio_y_alianzas.md");
const itinerario = leerTexto("notebooklm_sources/03_itinerario_dia_cumbre_gastronomia.md");
const vuelos = leerTexto("lib/vuelos.ts");
const horarios = (vuelos.match(/SLOTS_VUELO = \[([^\]]+)\]/) || ["", ""])[1].match(/\d{2}:\d{2}/g) || [];

const lider = pilotos.find((piloto) => piloto.prioridad === 1 && piloto.certificacion_tandem);
const precioDia = (itinerario.match(/(\d[\d,]*)\s*MXN por persona/) || [])[1];
const anticipo = pesosDesdeCentavos(tenant.pricing.flightDepositCents);
const totalVuelo = pesosDesdeCentavos(tenant.pricing.flightTotalCents);
const michelada = menu.find((item) => item.id === "prod_michelada_caguama");
const hotDog = menu.find((item) => item.id === "prod_hot_dog");
const taco = menu.find((item) => item.id === "prod_taco");

if (!lider) throw new Error("No hay piloto de prioridad 1 con certificación tándem.");
if (!precioDia) throw new Error("El itinerario no trae el precio del Día Cumbre.");
if (!michelada || !hotDog || !taco) throw new Error("Faltan productos del menú de palapa.");
if (horarios.join(",") !== "10:00,12:00,14:00,16:00") {
  throw new Error("Los slots de producción cambiaron: " + horarios.join(", "));
}
if (!/30 d[ií]as/i.test(modelo) || !/Mercado Pago Point/i.test(modelo)) {
  throw new Error("La fuente de alianzas no confirma los 30 días ni la terminal.");
}
if (!/0 MXN/.test(modelo)) throw new Error("La fuente de alianzas no confirma la comisión en cero.");

const menuAnturios = anturios.menu.map((plato) => plato.nombre).join(", ");
const cascada = pilotos.map((piloto) => `${piloto.prioridad}. ${piloto.nombre}`).join("; ");

const respuestas = [
  {
    id: "diacumbre",
    atajo: "/diacumbre",
    intent: "consultar_dia_cumbre",
    keywords: ["dia cumbre", "día cumbre", "all inclusive", "all-inclusive", "2950", "paquete completo", "sprinter"],
    respuesta: [
      `Día Cumbre All-Inclusive: $${precioDia.replace(/,/g, "")} MXN por persona.`,
      "08:30 salida de la Sprinter en Orizaba (Oriente 27 y Norte 10).",
      "09:00 picaditas en Restaurante Campestre Anturios.",
      "10:45 vuelo tándem.",
      "12:30 birria y caguama en Palapa El Paraíso.",
      "15:30 retorno en Sprinter a Orizaba.",
      "Reservas por este WhatsApp, 2727258748.",
    ].join("\n"),
  },
  {
    id: "vuelo",
    atajo: "/vuelo",
    intent: "consultar_vuelo",
    keywords: ["vuelo", "parapente", "tandem", "tándem", "horario", "slot", "salvador", "anticipo", ...horarios],
    respuesta: [
      `Vuelo tándem. Anticipo por Mercado Pago: $${anticipo} MXN. Referencia de canje o total: $${totalVuelo} MXN.`,
      `Slots: ${horarios.join(", ")}.`,
      `Piloto líder: ${lider.nombre}, certificación tándem APPI, prioridad ${lider.prioridad}.`,
      `Si su lugar ya está tomado, la cascada sigue así: ${cascada}. El cuarto pasajero del mismo slot queda saturado.`,
      "Reserva en https://www.basecamp420.com/reservar o por este WhatsApp.",
    ].join("\n"),
  },
  {
    id: "paraiso",
    atajo: "/paraiso",
    intent: "consultar_paraiso",
    keywords: ["paraiso", "paraíso", "palapa", "aterrizaje", "michelada", "birria", "taco", "hot dog", "acompanante", "acompañante"],
    respuesta: [
      "Palapa El Paraíso es la zona de aterrizaje. Los acompañantes esperan ahí el mediodía, con micheladas y tacos.",
      `El aterrizaje del Día Cumbre es a las 12:15 y el banquete a las 12:30: tacos de birria, consomé y Michelada Caguama.`,
      `Precios de prueba: ${michelada.nombre} $${michelada.precio} MXN, ${hotDog.nombre} $${hotDog.precio} MXN, ${taco.nombre} $${taco.precio} MXN.`,
      "El punto exacto del día se confirma por este WhatsApp. Pedido anticipado: https://www.basecamp420.com/ordenar",
    ].join("\n"),
  },
  {
    id: "anturios",
    atajo: "/anturios",
    intent: "consultar_anturios",
    keywords: ["anturios", "desayuno", "picaditas", "cafe de olla", "café de olla", "pan dulce", "check-in", "09:00"],
    respuesta: [
      `${anturios.hero.titulo}: desayuno montañero y check-in de la mañana.`,
      anturios.checkin,
      `Menú: ${menuAnturios}.`,
      "Para ordenar el desayuno o reservar mesa de grupo, escribe por este WhatsApp.",
    ].join("\n"),
  },
  {
    id: "aliados",
    atajo: "/aliados",
    intent: "consultar_aliados",
    keywords: ["aliados", "afiliate", "afiliación", "30 dias", "30 días", "terminal", "point", "comision", "comisión", "b2b"],
    respuesta: [
      "Red de comercios Basecamp 420: 30 días de prueba gratuita.",
      "Comisión de Basecamp en ese periodo: $0 MXN. No hay comisión oculta.",
      "Requisito: comprar y activar tu propia terminal Mercado Pago Point. La terminal es tuya y el dinero entra a tu cuenta.",
      "Al día 30 decides. Si no renuevas, te quedas con la terminal y te desconectamos sin penalización.",
      "Alta: https://www.basecamp420.com/aliados",
    ].join("\n"),
  },
  {
    id: "pagos",
    atajo: "/pagos",
    intent: "consultar_pagos",
    keywords: ["pago", "pagos", "mercadopago", "mercado pago", "anticipo", "tarjeta", "transferencia"],
    respuesta: [
      `El anticipo del vuelo se cobra en Mercado Pago: $${anticipo} MXN. La referencia de total o canje es $${totalVuelo} MXN.`,
      `Día Cumbre: $${precioDia.replace(/,/g, "")} MXN por persona.`,
      `Palapa, precios de prueba: michelada $${michelada.precio}, hot dog $${hotDog.precio}, taco $${taco.precio}.`,
      "Cuando Mercado Pago marca el pedido de comida como aprobado, el aviso llega al WhatsApp que dejaste en el checkout.",
      "Dudas de pago: 2727258748.",
    ].join("\n"),
  },
  {
    id: "thetrip",
    atajo: "/thetrip",
    intent: "consultar_the_trip",
    keywords: ["the trip", "smoke shop", "cristaleria", "cristalería", "vaporizador", "lifestyle"],
    respuesta: [
      "🌿 *The Trip Smoke Shop*",
      "",
      "Eleva tu experiencia. Somos la smoke shop oficial del ecosistema Basecamp 420.",
      "Contamos con catálogo completo de cristalería, vaporizadores, accesorios y lifestyle cannábico.",
      "👉 Conoce nuestro catálogo o pide existencias por este chat.",
    ].join("\n"),
  },
  {
    id: "cimadigital",
    atajo: "/cimadigital",
    intent: "consultar_cima_digital",
    keywords: ["cima digital", "software", "inteligencia artificial", "automatizacion", "automatización", "factoria", "factoría"],
    respuesta: [
      "💻 *Cima Digital — Factoría de Software e Inteligencia Artificial*",
      "",
      "¿Te gusta cómo opera la automatización, conmutadores y reservas de Basecamp 420? Cima Digital lo diseñó y construyó.",
      "Desarrollamos soluciones de software a la medida, automatización con agentes de IA y e-commerce de alta conversión para escalar empresas.",
      "👉 Agenda una consultoría con nuestro equipo técnico.",
    ].join("\n"),
  },
];

const porAtajo = {};
const porIntent = {};
const porKeyword = {};
for (const respuesta of respuestas) {
  if (!respuesta.respuesta || respuesta.keywords.length < 3) {
    throw new Error("Respuesta incompleta: " + respuesta.id);
  }
  porAtajo[respuesta.atajo] = respuesta.id;
  porIntent[respuesta.intent] = respuesta.id;
  for (const palabra of respuesta.keywords) {
    const clave = normalizar(palabra);
    if (!porKeyword[clave]) porKeyword[clave] = [];
    if (!porKeyword[clave].includes(respuesta.id)) porKeyword[clave].push(respuesta.id);
  }
}

const requeridos = ["/diacumbre", "/vuelo", "/paraiso", "/anturios", "/aliados", "/pagos", "/thetrip", "/cimadigital"];
for (const atajo of requeridos) {
  if (!porAtajo[atajo]) throw new Error("Falta el atajo " + atajo);
}

const banco = {
  version: 1,
  canal: "whatsapp",
  telefonoVisible: "2727258748",
  telefonoWa: "522727258748",
  generadoEn: new Date().toISOString(),
  integracion: ["twilio", "baileys", "meta_cloud_api"],
  respuestas,
  porAtajo,
  porIntent,
  porKeyword,
};

const manual = `# Respuestas rápidas de WhatsApp

Conmutador: 2727258748.
Uso: el equipo de mostrador escribe el atajo y pega la respuesta en un clic.
Generado: ${banco.generadoEn}.

${respuestas.map((respuesta) => `## ${respuesta.atajo}

Intención: \`${respuesta.intent}\`.
Disparadores: ${respuesta.keywords.join(", ")}.

\`\`\`
${respuesta.respuesta}
\`\`\`
`).join("\n")}
## Cómo enruta el banco

\`data/faqs_whatsapp.json\` trae tres índices:

- \`porAtajo\`: el texto que escribe el mostrador, por ejemplo \`/vuelo\`.
- \`porIntent\`: el nombre estable para un webhook.
- \`porKeyword\`: palabras normalizadas, sin acentos, hacia uno o más identificadores de respuesta.

Si una frase trae varias palabras, el conmutador gana con la primera coincidencia de \`porKeyword\`. Si no hay coincidencia, responde una persona.
`;

const jsonSalida = path.join(raiz, "data", "faqs_whatsapp.json");
const mdSalida = path.join(raiz, "docs", "RESPUESTAS_RAPIDAS_WHATSAPP.md");
fs.writeFileSync(jsonSalida, JSON.stringify(banco, null, 2) + "\n", "utf8");
fs.writeFileSync(mdSalida, manual.trim() + "\n", "utf8");

const verificacion = JSON.parse(fs.readFileSync(jsonSalida, "utf8"));
if (verificacion.respuestas.length !== 8) throw new Error("El banco no tiene 8 respuestas.");
if (!verificacion.respuestas.every((item) => verificacion.porIntent[item.intent] === item.id)) {
  throw new Error("El índice por intención no cierra.");
}
console.log(jsonSalida);
console.log(mdSalida);
console.log("VALIDADO " + verificacion.respuestas.length + " respuestas");
