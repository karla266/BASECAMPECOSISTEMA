const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const salida = path.join(raiz, "notebooklm_sources");

function leerJson(relativo) {
  return JSON.parse(fs.readFileSync(path.join(raiz, relativo), "utf8"));
}

function leerTexto(relativo) {
  return fs.readFileSync(path.join(raiz, relativo), "utf8");
}

const pilotos = leerJson("data/directorio_pilotos.json");
const aliados = leerJson("data/aliados.json");
const dia = leerJson("data/dia_cumbre.json");
const menuPalapa = leerJson("data/menu_palapa.json");
const anturios = leerJson("data/anturios.json");
const paquete = JSON.parse(leerTexto("package.json"));
const vuelos = leerTexto("lib/vuelos.ts");
const slots = vuelos.match(/SLOTS_VUELO = \[([^\]]+)\]/);
const horarios = slots ? slots[1].match(/\d{2}:\d{2}/g) : [];

const generado = new Date().toISOString();

function pilotoLinea(piloto) {
  const certificacion = piloto.certificacion_tandem ? "certificación tándem APPI" : "en formación / demo";
  return `- ${piloto.nombre} (\`${piloto.id}\`): prioridad ${piloto.prioridad}, estado \`${piloto.estado}\`, ${certificacion}, cupo ${piloto.capacidad_por_slot} por slot, teléfono ${piloto.telefono}.`;
}

const modelo = `# Modelo de negocio y alianzas

Fuente viva de Basecamp 420 para NotebookLM. Generada ${generado}.

## Misión

Basecamp 420 es el hub tecnológico de turismo de aventura y gastronomía en Orizaba y Fortín de las Flores, Veracruz. El punto físico de salida es Oriente 27 y Norte 10, Orizaba. El teléfono oficial de reservas y pedidos es 2727258748.

El día de operación une tres lugares:

- Restaurante Campestre Anturios: fondita del desayuno y check-in matutino de pilotos y pasajeros.
- La montaña: despegue de los vuelos tándem.
- Palapa El Paraíso: zona de aterrizaje y banquete del mediodía.

## Modelo B2B

La oferta pública para comercios aliados es: ${aliados.titulo}.

${aliados.seo.descripcion}

Pasos publicados en \`/aliados\`:

${aliados.pasos.map((paso) => `${paso.numero}. ${paso.titulo}. ${paso.texto}`).join("\n")}

El alta se pide por WhatsApp con este texto: "${aliados.mensajeWhatsapp}".

## Requisito de entrada

${aliados.requisito}

La terminal Mercado Pago Point se compra y se activa a nombre del comercio. Es del comercio. Basecamp 420 no se queda con el aparato ni administra esa cuenta.

## Comisiones y cobro

No hay un porcentaje de comisión de Basecamp codificado en el repositorio. La oferta pública dice que no hay comisiones ocultas.

El cobro queda así:

- El aliado cobra en su terminal Mercado Pago Point. El dinero entra a la cuenta de Mercado Pago del comercio.
- Basecamp 420 canaliza pedidos anticipados y turistas. No retiene ese dinero.
- Los pedidos web de comida y bebida se cobran con Checkout Pro en \`POST /api/checkout\`. El precio sale del menú del servidor, en centavos internamente.
- Cuando Mercado Pago avisa \`status === approved\` en \`/api/webhooks/mercadopago\`, la orden de palapa pasa a \`pagado\` y se intenta el aviso por WhatsApp al cliente.
- La dispersión es la de Mercado Pago: cada quien cobra en su cuenta, sin una caja intermedia de Basecamp.

## Desconexión al día 30

Al terminar los 30 días gratis el comercio decide. Si el volumen le convence, sigue en la red. Si no renueva, conserva su terminal Mercado Pago Point y Basecamp 420 lo desconecta de la red sin penalización y sin compromiso.
`;

const operacion = `# Operación de vuelos y seguridad

Fuente viva de Basecamp 420 para NotebookLM. Generada ${generado}.

## Directorio de pilotos

Archivo: \`data/directorio_pilotos.json\`.

${pilotos.map(pilotoLinea).join("\n")}

Salvador Lara es la prioridad 1 y el único del directorio con certificación tándem. Farid (Muestra) y Karla Guzman (Muestra) están en \`demo_presentacion\` y se muestran como piloto en formación.

## Slots de despegue

Los únicos horarios de producción, leídos de \`SLOTS_VUELO\` en \`lib/vuelos.ts\`, son: ${horarios.join(", ")} hrs.

## Cascada y saturación

Cada piloto operable cubre ${pilotos[0] ? pilotos[0].capacidad_por_slot : 1} pasajero por slot. El asignador ordena por prioridad y entrega el primer piloto que todavía tenga cupo.

1. El primer pasajero del slot queda con Salvador Lara.
2. El segundo queda con Farid (Muestra).
3. El tercero queda con Karla Guzman (Muestra).
4. El cuarto recibe el bloqueo "Ese horario ya está saturado para todos los pilotos del directorio." La interfaz muestra "Slot saturado".

Solo operan los estados \`activo\` y \`demo_presentacion\`. \`DELETE /api/vuelos\` vacía las reservas y no modifica el directorio. Después del reinicio, el siguiente pasajero del slot vuelve a Salvador Lara.

## Inspección visual móvil

En la hoja de ruta del piloto, el checklist es arnés de copiloto, casco, radio y paracaídas. El botón "Adjuntar Foto de Inspección / Comprobante" abre un input nativo:

\`<input type="file" accept="image/*" capture="environment" className="hidden" />\`

\`capture="environment"\` usa la cámara trasera del teléfono. Si hay imagen, se muestra miniatura con Confirmar o Eliminar. En el registro se guarda el nombre del archivo, no el binario.

## Confirmación por WhatsApp

El número oficial es 2727258748 (\`https://wa.me/522727258748\`).

Al confirmar una reserva en \`/reservar\`, la pantalla de éxito abre WhatsApp con: "Hola Basecamp 420, confirmé mi reserva para el slot de las [HORA] con el piloto [PILOTO]."

El botón flotante de disponibilidad usa: "Hola Basecamp 420, deseo validar disponibilidad para vuelo en parapente."
`;

const gastronomia = `# Itinerario Día Cumbre y gastronomía

Fuente viva de Basecamp 420 para NotebookLM. Generada ${generado}.

## Paquete

Día Cumbre All-Inclusive: $2,950 MXN por persona.

${dia.subtitulo}

Incluye el traslado en Sprinter, el desayuno en Anturios, el vuelo tándem y el banquete de aterrizaje en Palapa El Paraíso.

## Cronograma

${dia.paradas.map((parada) => {
  const extra = parada.hora.startsWith("12:30")
    ? " El banquete botanero es tacos de birria dorados, consomé caliente y Michelada Caguama de 1L."
    : "";
  return `- ${parada.hora} hrs: ${parada.titulo}. ${parada.texto}${extra}`;
}).join("\n")}

## Desayuno en Restaurante Anturios

${anturios.hero.titulo}. ${anturios.hero.subtitulo}

${anturios.checkin}

Menú matutino:

${anturios.menu.map((plato) => `- ${plato.nombre}: ${plato.descripcion}`).join("\n")}

## Precios individuales de prueba en la palapa

Leídos de \`data/menu_palapa.json\`. Son precios de prueba en pesos enteros. La orden los guarda en centavos.

${menuPalapa.map((producto) => `- ${producto.nombre}: $${producto.precio} MXN. ${producto.descripcion}`).join("\n")}

Puntos de entrega del pedido anticipado:

- Al aterrizar el vuelo en Palapa El Paraíso.
- Desayuno en Restaurante Anturios (09:00 hrs).
- Consumo en mesa en la palapa.
`;

const arquitectura = `# Arquitectura técnica y API

Fuente viva de Basecamp 420 para NotebookLM. Generada ${generado}.

## Frontend

El portal es Next.js ${paquete.dependencies.next}, App Router, en el repositorio BASECAMP-420-sas-visual. El build de producción compiló sin errores y generó 71 páginas estáticas y dinámicas. Ese conteo incluye las rutas de experiencia, pedidos, aliados y \`/pilotos/alta\`. \`npm run build\` omite la validación de tipos; el chequeo real es \`npx tsc --noEmit\`.

Rutas de producto que explican la operación:

- \`/reservar\`: reserva de vuelo y pantalla de éxito con WhatsApp.
- \`/pilotos/alta\`: alta móvil de piloto real al cierre de la junta.
- \`/anturios\`: desayuno y check-in.
- \`/el-paraiso\`: aterrizaje en la palapa.
- \`/experiencia-completa\`: cronograma del Día Cumbre.
- \`/ordenar\` y \`/ordenar/exito\`: pedido anticipado y respaldo de WhatsApp.
- \`/aliados\` y \`/afiliate\`: prueba de 30 días. \`/afiliate\` redirige a \`/aliados\`.
- \`/admin/vuelos\`: tablero, reinicio de demo y hoja de ruta.

## Endpoints

- \`POST /api/vuelos\`: crea la reserva pública y aplica la cascada. Responde 201 con la reserva o 409 si el slot está saturado.
- \`GET /api/vuelos/disponibilidad?fecha=YYYY-MM-DD\`: cupo público de los cuatro slots.
- \`DELETE /api/vuelos\`: reinicio de demo. Exige la sesión de administrador, vacía \`data/reservas_vuelo.json\` y no toca \`data/directorio_pilotos.json\`.
- \`PATCH /api/vuelos\`: anticipo, checklist y nombre de la foto de inspección. También exige sesión de administrador.
- \`POST /api/checkout\`: preferencia de Mercado Pago Checkout Pro. Si \`tipo\` es \`pedido_palapa\`, cobra el menú. Si no, mantiene el cobro del vuelo.
- \`POST /api/webhooks/mercadopago\`: consulta el pago en Mercado Pago. Con \`approved\` y referencia \`PALAPA-\` marca la orden pagada y avisa al WhatsApp del cliente por \`WHATSAPP_API_BASE\` (por defecto \`http://127.0.0.1:8005/api/v1/whatsapp/send\`).
- \`POST /api/pilotos\`: agrega un piloto al final del directorio. No cambia la prioridad de Salvador Lara.

## Mobile-first

La interfaz está pensada para una sola mano en pantallas de 375px a 430px.

- Los botones de acción usan al menos 48px de alto (\`min-h-12\`).
- Los slots 10:00, 12:00, 14:00 y 16:00 van separados para evitar toques accidentales.
- El botón flotante de WhatsApp queda por encima del contenido, con espacio inferior en la página.
- En el tablero de vuelos, el móvil muestra tarjetas verticales. La tabla queda para pantallas anchas.
- El menú del sitio se abre con el botón Menú y cada enlace del cajón mide al menos 48px.
`;

const archivos = {
  "01_modelo_negocio_y_alianzas.md": modelo,
  "02_operacion_vuelos_y_seguridad.md": operacion,
  "03_itinerario_dia_cumbre_gastronomia.md": gastronomia,
  "04_arquitectura_tecnica_y_api.md": arquitectura,
};

fs.mkdirSync(salida, { recursive: true });
for (const [nombre, contenido] of Object.entries(archivos)) {
  fs.writeFileSync(path.join(salida, nombre), contenido.trim() + "\n", "utf8");
  console.log(nombre);
}
console.log(salida);
