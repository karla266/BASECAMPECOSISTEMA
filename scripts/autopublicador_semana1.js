const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const INICIO = "2026-11-02";
const TELEFONO = "2727258748";
const SITIO = "www.Basecamp420.com";
const MARCAS = [
  "Basecamp 420",
  "The Trip Smoke Shop",
  "Cima Digital",
  "Movimiento Canábico Orizaba",
];
const CANALES = ["Instagram Reels", "TikTok", "YouTube Shorts", "WhatsApp Status"];
const HORARIOS = ["13:00 hrs", "19:30 hrs"];
const PROHIBIDOS = ["D-Trip", "La Décima"];

function leerJson(relativo) {
  return JSON.parse(fs.readFileSync(path.join(raiz, relativo), "utf8"));
}

function leerTexto(relativo) {
  return fs.readFileSync(path.join(raiz, relativo), "utf8");
}

function palabras(texto) {
  return String(texto).trim().split(/\s+/).filter(Boolean).length;
}

function sumarDias(iso, dias) {
  const fecha = new Date(`${iso}T12:00:00-06:00`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function programarEn(fecha, horario) {
  return `${fecha}T${horario.slice(0, 5)}:00-06:00`;
}

const tenant = leerJson("tenant.config.json");
const pilotos = leerJson("data/directorio_pilotos.json");
const menu = leerJson("data/menu_palapa.json");
const itinerario = leerTexto("notebooklm_sources/03_itinerario_dia_cumbre_gastronomia.md");
const vuelos = leerTexto("lib/vuelos.ts");

const precioDia = (itinerario.match(/(\d[\d,]*)\s*MXN por persona/) || [])[1];
const anticipo = Math.trunc(Number(tenant.pricing.flightDepositCents) / 100);
const totalVuelo = Math.trunc(Number(tenant.pricing.flightTotalCents) / 100);
const lider = pilotos.find((piloto) => piloto.prioridad === 1 && piloto.certificacion_tandem);
const horarios = (vuelos.match(/SLOTS_VUELO = \[([^\]]+)\]/) || ["", ""])[1].match(/\d{2}:\d{2}/g) || [];
const michelada = menu.find((item) => item.id === "prod_michelada_caguama");

if (precioDia !== "2950") throw new Error("El precio del Día Cumbre ya no es 2950. Revisa el guion.");
if (anticipo !== 1600 || totalVuelo !== 2800) throw new Error("El anticipo o el total del vuelo cambiaron. Revisa el guion.");
if (!lider || lider.nombre !== "Salvador Lara") throw new Error("El piloto líder ya no es Salvador Lara. Revisa el guion.");
if (horarios.join(",") !== "10:00,12:00,14:00,16:00") throw new Error("Los slots de vuelo cambiaron. Revisa el guion.");
if (!michelada || michelada.precio !== 100) throw new Error("La Michelada Caguama ya no está en 100 MXN. Revisa el copy.");

const borradores = [
  {
    dia: "Lunes - Día 1",
    marca: "Basecamp 420",
    canal: "Instagram Reels",
    horario_optimo: "19:30 hrs",
    hook: "De Orizaba a la montaña y de regreso, en un solo día.",
    guion_completo:
      "Este es el Día Cumbre de Basecamp 420. A las ocho y media sale la Sprinter en Oriente veintisiete y Norte diez, Orizaba. A las nueve desayunas en el Restaurante Campestre Anturios, con picaditas y café de olla, y ahí hacemos el check-in. Después subimos a la montaña. Entre las diez cuarenta y cinco y las doce vuelas en tándem. A las doce quince aterrizas en Palapa El Paraíso. A las doce treinta hay birria, consomé y michelada. A las tres y media la Sprinter te regresa a Orizaba. El paquete cuesta dos mil novecientos cincuenta pesos por persona. Aparta por WhatsApp.",
    copy_social:
      "Día Cumbre All-Inclusive desde Orizaba. Sprinter 08:30, desayuno en Restaurante Campestre Anturios, vuelo tándem y banquete en Palapa El Paraíso. $2,950 MXN por persona.\nReserva por WhatsApp 2727258748 o entra a https://www.basecamp420.com/experiencia-completa",
    hashtags: ["#Orizaba", "#Fortin", "#Parapente", "#AltasMontanas", "#Veracruz", "#DiaCumbre", "#Basecamp420", "#TurismoDeAventura"],
    cta: "Reserva el Día Cumbre por WhatsApp al 2727258748 o en www.Basecamp420.com/experiencia-completa",
  },
  {
    dia: "Martes - Día 2",
    marca: "The Trip Smoke Shop",
    canal: "TikTok",
    horario_optimo: "13:00 hrs",
    hook: "Cristalería, vaporizadores y lifestyle, en el mismo ecosistema.",
    guion_completo:
      "The Trip Smoke Shop es la tienda del ecosistema Basecamp 420 en Orizaba. El mostrador es de cristalería, vaporizadores, accesorios y piezas de lifestyle cannábico. Estamos en Oriente veintisiete y Norte diez, el mismo punto de Basecamp 420. No tienes que adivinar si hay existencia: la preguntas por este chat y te decimos qué hay hoy. Si quieres ver el catálogo antes de pasar, entra a Basecamp cuatrocientos veinte punto com, diagonal the trip. Eleva la experiencia con la smoke shop oficial. Escríbenos al dos siete dos, siete dos cinco, ocho siete cuatro ocho.",
    copy_social:
      "The Trip Smoke Shop es la smoke shop oficial del ecosistema Basecamp 420. Cristalería, vaporizadores, accesorios y lifestyle cannábico.\nPide existencias por WhatsApp 2727258748 o mira el catálogo en https://www.basecamp420.com/thetrip",
    hashtags: ["#Orizaba", "#Fortin", "#TheTrip", "#SmokeShop", "#Cristaleria", "#Vaporizadores", "#Basecamp420", "#Lifestyle"],
    cta: "Pide existencias por WhatsApp al 2727258748 o entra a www.Basecamp420.com/thetrip",
  },
  {
    dia: "Miércoles - Día 3",
    marca: "Cima Digital",
    canal: "YouTube Shorts",
    horario_optimo: "19:30 hrs",
    hook: "Alguien construyó las reservas, el cobro y el conmutador.",
    guion_completo:
      "Si te gusta cómo operan las reservas, el conmutador y la automatización de Basecamp 420, eso lo diseñó Cima Digital. Es la factoría de software e inteligencia artificial de la misma empresa. Desarrollamos software a la medida, agentes de inteligencia artificial y comercio electrónico de alta conversión. No es un paquete cerrado: vemos tu operación y construimos la herramienta que te quita el trabajo repetido. Agenda una consultoría con el equipo técnico. WhatsApp dos siete dos, siete dos cinco, ocho siete cuatro ocho. Sitio, diagonal cima digital.",
    copy_social:
      "Cima Digital diseñó las reservas, los conmutadores y la automatización de Basecamp 420. Software a la medida, agentes de IA y e-commerce.\nAgenda una consultoría por WhatsApp 2727258748 o en https://www.basecamp420.com/cima-digital",
    hashtags: ["#Orizaba", "#CimaDigital", "#Software", "#InteligenciaArtificial", "#Automatizacion", "#Ecommerce", "#Basecamp420", "#Veracruz"],
    cta: "Agenda una consultoría por WhatsApp al 2727258748 o en www.Basecamp420.com/cima-digital",
  },
  {
    dia: "Jueves - Día 4",
    marca: "Movimiento Canábico Orizaba",
    canal: "WhatsApp Status",
    horario_optimo: "13:00 hrs",
    hook: "La cultura cannábica de Orizaba ya tiene archivo, no solo rumor.",
    guion_completo:
      "Movimiento Canábico Orizaba es la voz comunitaria del ecosistema Basecamp 420. Aquí se habla de cultura, de archivo y de lo que está pasando en la región, con calma y con nombre. Los podcasts viven en el sitio, en la ruta del movimiento. No es un anuncio de mostrador: es la conversación para quien quiere entender el tema desde Orizaba y Fortín de las Flores. Escucha un episodio y, si quieres sumarte a la charla, escribe al dos siete dos, siete dos cinco, ocho siete cuatro ocho.",
    copy_social:
      "Movimiento Canábico Orizaba guarda la conversación de cultura cannábica en la región. Escucha los podcasts y súmate a la charla.\nWhatsApp 2727258748 · https://www.basecamp420.com/movimiento-canabico/podcasts",
    hashtags: ["#Orizaba", "#Fortin", "#MovimientoCanabicoOrizaba", "#CulturaCanabica", "#Podcast", "#Basecamp420", "#Veracruz", "#AltasMontanas"],
    cta: "Escucha el podcast y escribe por WhatsApp al 2727258748 o entra a www.Basecamp420.com/movimiento-canabico/podcasts",
  },
  {
    dia: "Viernes - Día 5",
    marca: "Basecamp 420",
    canal: "TikTok",
    horario_optimo: "19:30 hrs",
    hook: "Cuatro horarios. Un pasajero a la vez. Si se llena, sigue la fila.",
    guion_completo:
      "El vuelo tándem de Basecamp 420 sale en cuatro horarios: diez, doce, catorce y dieciséis. Salimos de Oriente veintisiete y Norte diez, en Orizaba, hacia la montaña de Fortín. Cada horario toma un pasajero y, si ese piloto ya está ocupado, la fila sigue. El primer lugar es Salvador Lara. El anticipo se cobra en Mercado Pago: mil seiscientos pesos. La referencia del vuelo es de dos mil ochocientos pesos. Reserva en el sitio, diagonal reservar, o escribe al dos siete dos, siete dos cinco, ocho siete cuatro ocho.",
    copy_social:
      "Vuelo tándem en Fortín. Horarios 10:00, 12:00, 14:00 y 16:00. El primer lugar de la fila es Salvador Lara. Anticipo Mercado Pago: $1,600 MXN. Referencia del vuelo: $2,800 MXN.\nReserva en https://www.basecamp420.com/reservar o por WhatsApp 2727258748",
    hashtags: ["#Orizaba", "#Fortin", "#Parapente", "#VueloTandem", "#SalvadorLara", "#Basecamp420", "#Veracruz", "#AltasMontanas"],
    cta: "Reserva tu horario por WhatsApp al 2727258748 o en www.Basecamp420.com/reservar",
  },
  {
    dia: "Sábado - Día 6",
    marca: "The Trip Smoke Shop",
    canal: "Instagram Reels",
    horario_optimo: "13:00 hrs",
    hook: "Antes del sábado, pregunta la existencia. No llegues a adivinar.",
    guion_completo:
      "Sábado en The Trip Smoke Shop. Si vienes a Orizaba por cristalería, un vaporizador o un accesorio de lifestyle, pregunta primero qué hay en mostrador. El catálogo está en el sitio y la existencia del día se confirma por chat. Somos la smoke shop oficial de Basecamp 420, en Oriente veintisiete y Norte diez. Pasa con el nombre de la pieza, o escríbenos y te decimos con qué contamos hoy. WhatsApp dos siete dos, siete dos cinco, ocho siete cuatro ocho.",
    copy_social:
      "Sábado de existencias en The Trip Smoke Shop. Cristalería, vaporizadores y accesorios de lifestyle, en Oriente 27 y Norte 10.\nConfirma por WhatsApp 2727258748 o revisa https://www.basecamp420.com/thetrip",
    hashtags: ["#Orizaba", "#Fortin", "#TheTrip", "#SmokeShop", "#Cristaleria", "#Sabado", "#Basecamp420", "#Lifestyle"],
    cta: "Confirma existencias por WhatsApp al 2727258748 o en www.Basecamp420.com/thetrip",
  },
  {
    dia: "Domingo - Día 7",
    marca: "Cima Digital",
    canal: "YouTube Shorts",
    horario_optimo: "19:30 hrs",
    hook: "El software sirve cuando la operación de verdad existe.",
    guion_completo:
      "Cima Digital cierra la semana con una idea simple: el software tiene que servirle a una operación real. Esa operación es Basecamp 420, con vuelo, desayuno en Restaurante Campestre Anturios y aterrizaje en Palapa El Paraíso. También es The Trip Smoke Shop, en el mostrador de cristalería y lifestyle. Y es Movimiento Canábico Orizaba, en la conversación de la región. Si quieres un sistema así para tu negocio, agenda consultoría con el equipo técnico. WhatsApp dos siete dos, siete dos cinco, ocho siete cuatro ocho.",
    copy_social:
      "Cima Digital construye el software que ya opera en Basecamp 420, The Trip Smoke Shop y Movimiento Canábico Orizaba. Cuatro marcas, una empresa.\nAgenda consultoría por WhatsApp 2727258748 o entra a https://www.basecamp420.com/ecosistema",
    hashtags: ["#Orizaba", "#CimaDigital", "#Basecamp420", "#TheTrip", "#Software", "#InteligenciaArtificial", "#Fortin", "#Veracruz"],
    cta: "Agenda consultoría por WhatsApp al 2727258748 o entra a www.Basecamp420.com/ecosistema",
  },
];

const publicaciones = borradores.map((pieza, indice) => {
  const fecha = sumarDias(INICIO, indice);
  const texto = [pieza.hook, pieza.guion_completo, pieza.copy_social, pieza.cta, pieza.hashtags.join(" ")].join("\n");
  for (const prohibido of PROHIBIDOS) {
    if (texto.includes(prohibido)) throw new Error(`${pieza.dia} usa un nombre descartado: ${prohibido}`);
  }
  if (!MARCAS.includes(pieza.marca)) throw new Error("Marca fuera del canon: " + pieza.marca);
  if (!CANALES.includes(pieza.canal)) throw new Error("Canal fuera de la semana: " + pieza.canal);
  if (!HORARIOS.includes(pieza.horario_optimo)) throw new Error("Horario fuera de pico: " + pieza.horario_optimo);
  if (!/2727258748/.test(pieza.cta) || !/www\.Basecamp420\.com/.test(pieza.cta)) {
    throw new Error(`${pieza.dia} no trae teléfono y sitio en la llamada a la acción.`);
  }
  if (!pieza.hashtags.includes("#Orizaba")) throw new Error(`${pieza.dia} no etiqueta la región.`);
  const gancho = palabras(pieza.hook);
  const locucion = palabras(pieza.guion_completo);
  if (gancho < 6 || gancho > 16) throw new Error(`${pieza.dia}: el gancho tiene ${gancho} palabras. Debe caber en 5 segundos.`);
  if (locucion < 75 || locucion > 115) {
    throw new Error(`${pieza.dia}: la locución tiene ${locucion} palabras. El rango de 30 a 45 segundos es 75-115.`);
  }
  return {
    id: `semana1-dia${indice + 1}`,
    fecha,
    programar_en: programarEn(fecha, pieza.horario_optimo),
    ...pieza,
    hashtags: pieza.hashtags,
  };
});

if (publicaciones.length !== 7) throw new Error("La semana debe tener 7 publicaciones.");

const cuentas = {};
for (const pieza of publicaciones) cuentas[pieza.marca] = (cuentas[pieza.marca] || 0) + 1;
const cargas = Object.values(cuentas);
if (Object.keys(cuentas).length !== 4) throw new Error("Falta una de las cuatro marcas.");
if (Math.max(...cargas) - Math.min(...cargas) > 1) throw new Error("La semana no está balanceada entre las cuatro marcas.");
for (const canal of CANALES) {
  if (!publicaciones.some((pieza) => pieza.canal === canal)) throw new Error("Falta el canal " + canal);
}

function capsula(pieza) {
  return [
    `Cápsula de ${pieza.dia}, hora ${pieza.horario_optimo}, pensada para ${pieza.canal}.`,
    `Abre con este gancho: ${pieza.hook}`,
    `Marca del día: ${pieza.marca}. Estamos en Orizaba y Fortín de las Flores, ecosistema Basecamp 420.`,
    pieza.guion_completo,
    `Cierra la cápsula con la acción de hoy: ${pieza.cta}`,
    "Repite el teléfono despacio: dos, siete, dos, siete, dos, cinco, ocho, siete, cuatro, ocho.",
    "Repite el sitio: www punto Basecamp cuatrocientos veinte punto com.",
  ].join(" ");
}

for (const pieza of publicaciones) {
  const duracion = palabras(capsula(pieza));
  if (duracion < 140 || duracion > 220) {
    throw new Error(`${pieza.dia}: la cápsula de NotebookLM tiene ${duracion} palabras. El rango de 60 a 90 segundos es 140-220.`);
  }
}

const cola = {
  version: 1,
  semana: 1,
  zona_horaria: "America/Mexico_City",
  inicio: INICIO,
  fin: publicaciones[6].fecha,
  telefono: TELEFONO,
  sitio: SITIO,
  marcas: MARCAS,
  balance: cuentas,
  publicaciones,
};

const checklist = (pieza) =>
  [
    `- [ ] Grabar el gancho (0 a 5 s) y la locución (30 a 45 s) para ${pieza.canal}.`,
    `- [ ] Programar en ${pieza.programar_en} (${pieza.horario_optimo}).`,
    "- [ ] Pegar el copy, las etiquetas y la llamada a la acción sin cambiar precios ni teléfono.",
    `- [ ] Confirmar que el nombre publicado es «${pieza.marca}».`,
    "- [ ] Marcar publicada cuando el canal la muestre.",
  ].join("\n");

const manual = `# Calendario de publicación — Semana 1

Semana del ${INICIO} al ${publicaciones[6].fecha}. Zona horaria: America/Mexico_City.
Teléfono de toda la semana: ${TELEFONO}. Sitio: ${SITIO}.
Cuatro marcas de la misma empresa. En siete días, tres marcas salen dos veces y una sale una vez. Ninguna queda fuera.
Balance: ${MARCAS.map((marca) => `${marca} ${cuentas[marca]}`).join(" · ")}.
Canales: ${CANALES.join(", ")}. Horas pico: ${HORARIOS.join(" o ")}.

Hechos que este calendario no puede cambiar solo: Día Cumbre $2,950 MXN por persona. Anticipo de vuelo $1,600 MXN. Referencia de vuelo $2,800 MXN. Piloto líder Salvador Lara. Slots 10:00, 12:00, 14:00 y 16:00. Michelada Caguama $100 MXN.

${publicaciones
  .map(
    (pieza) => `## ${pieza.dia}

- Identificador: \`${pieza.id}\`
- Fecha: ${pieza.fecha}
- Marca: ${pieza.marca}
- Canal: ${pieza.canal}
- Hora pico: ${pieza.horario_optimo}
- Gancho: ${pieza.hook}
- Locución: ${pieza.guion_completo}
- Copy: ${pieza.copy_social.replace(/\n/g, " ")}
- Etiquetas: ${pieza.hashtags.join(" ")}
- Llamada a la acción: ${pieza.cta}

${checklist(pieza)}`
  )
  .join("\n\n")}
`;

const fuente = `# 06. Semana de contenido para shorts y podcasts

Semana 1. Inicio ${INICIO}. Fin ${publicaciones[6].fecha}.
Uso en NotebookLM: generar una microcápsula de audio por día, de 60 a 90 segundos, en español de México.
Voz: clara, sin gritar, como quien explica en el mostrador de Oriente 27 y Norte 10.
Cada cápsula nombra su marca, Orizaba o Fortín, el teléfono 2727258748 y el sitio www.Basecamp420.com.
Nombres permitidos: Basecamp 420, The Trip Smoke Shop, The Trip, Movimiento Canábico Orizaba, Cima Digital, Restaurante Campestre Anturios, Palapa El Paraíso.
Nombres que no se pronuncian: D-Trip, La Décima, La Décima Digital.
No inventar comisiones, precios ni horarios. Los de esta fuente ya están cerrados.
The Trip habla de cristalería, vaporizadores, accesorios y lifestyle. Movimiento Canábico Orizaba habla de cultura, archivo y podcast. Ninguna cápsula vende flor ni explica consumo.

${publicaciones
  .map(
    (pieza) => `## ${pieza.dia}

Marca: ${pieza.marca}.
Canal de origen: ${pieza.canal}.
Hora: ${pieza.horario_optimo}.
Duración pedida: 60 a 90 segundos.
Gancho de entrada: ${pieza.hook}
Locución corta, 30 a 45 segundos: ${pieza.guion_completo}
Llamada a la acción: ${pieza.cta}

### Texto listo para la cápsula

${capsula(pieza)}`
  )
  .join("\n\n")}
`;

const jsonSalida = path.join(raiz, "data", "cola_publicaciones_semana1.json");
const mdSalida = path.join(raiz, "docs", "CALENDARIO_PUBLICACION_SEMANA_1.md");
const nbSalida = path.join(raiz, "notebooklm_sources", "06_semana_contenido_shorts_podcasts.md");

fs.writeFileSync(jsonSalida, JSON.stringify(cola, null, 2) + "\n", "utf8");
fs.writeFileSync(mdSalida, manual.trim() + "\n", "utf8");
fs.writeFileSync(nbSalida, fuente.trim() + "\n", "utf8");

const verificacion = JSON.parse(fs.readFileSync(jsonSalida, "utf8"));
if (verificacion.publicaciones.length !== 7) throw new Error("La cola no guardó 7 publicaciones.");
console.log(jsonSalida);
console.log(mdSalida);
console.log(nbSalida);
console.log("VALIDADO " + verificacion.publicaciones.length + " publicaciones");
for (const pieza of verificacion.publicaciones) {
  console.log(`${pieza.dia} | ${pieza.marca} | ${pieza.canal} | ${pieza.horario_optimo} | locución ${palabras(pieza.guion_completo)} palabras`);
}
