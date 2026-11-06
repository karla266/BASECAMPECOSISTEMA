const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const salida = path.join(raiz, "notebooklm_sources");
const generado = new Date().toISOString();

function leerJson(relativo) {
  return JSON.parse(fs.readFileSync(path.join(raiz, relativo), "utf8"));
}

function caminar(directorio, acumulado = []) {
  for (const entrada of fs.readdirSync(directorio, { withFileTypes: true })) {
    if (entrada.name === "node_modules" || entrada.name === ".next") continue;
    const completo = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) caminar(completo, acumulado);
    else acumulado.push(completo);
  }
  return acumulado;
}

const pilotos = leerJson("data/directorio_pilotos.json");
const aliados = leerJson("data/aliados.json");
const dia = leerJson("data/dia_cumbre.json");
const menu = leerJson("data/menu_palapa.json");
const anturios = leerJson("data/anturios.json");
const paraiso = leerJson("data/el_paraiso.json");
const paquete = leerJson("package.json");
const vuelos = fs.readFileSync(path.join(raiz, "lib", "vuelos.ts"), "utf8");
const horarios = (vuelos.match(/SLOTS_VUELO = \[([^\]]+)\]/) || ["", ""])[1].match(/\d{2}:\d{2}/g) || [];
const envEjemplo = fs.readFileSync(path.join(raiz, ".env.example"), "utf8");
const variables = envEjemplo
  .split(/\r?\n/)
  .map((linea) => linea.match(/^([A-Z0-9_]+)=/))
  .filter(Boolean)
  .map((coincidencia) => coincidencia[1]);
const paginas = caminar(path.join(raiz, "app"))
  .filter((archivo) => /page\.(tsx|jsx|ts|js)$/.test(archivo))
  .map((archivo) => "/" + path.relative(path.join(raiz, "app"), path.dirname(archivo)).replace(/\\/g, "/"))
  .map((ruta) => (ruta === "/." ? "/" : ruta))
  .sort();
const contratos = fs.readdirSync(path.join(raiz, "data")).filter((nombre) => nombre.endsWith(".json")).sort();

const modelo = `# 01. Modelo de negocio y alianzas

Hecho generado: ${generado}.
Entidad: Basecamp 420.
Sitio: https://www.basecamp420.com.
Teléfono: 2727258748.
Dirección de salida: Oriente 27 y Norte 10, Orizaba, Veracruz.
Región: Orizaba y Fortín de las Flores.

## Tesis

Basecamp 420 es el hub tecnológico de turismo de aventura y gastronomía de esa región. Opera tres puntos del mismo día: Restaurante Campestre Anturios (desayuno y check-in, 09:00), el despegue en la montaña, y Palapa El Paraíso (aterrizaje y botanero, 12:15–12:30).

La misma empresa opera cuatro marcas. No son empresas distintas.
- Basecamp 420: turismo, parapente y experiencias en las Altas Montañas.
- The Trip Smoke Shop: retail de cristalería, vaporizadores, accesorios y cultura lifestyle. En textos breves se puede decir The Trip. No se usa el nombre D-Trip.
- Movimiento Canábico Orizaba: comunidad, activismo y difusión de la cultura cannábica.
- Cima Digital: factoría de software, inteligencia artificial y automatización. No se usa el nombre La Décima Digital.

## Oferta B2B

Título publicado: ${aliados.titulo}.
Requisito de entrada: ${aliados.requisito}.
La terminal Mercado Pago Point la compra y la activa el comercio. La terminal es del comercio. El comercio administra su dinero.
Texto de alta: ${aliados.mensajeWhatsapp}.

Pasos:
${aliados.pasos.map((paso) => `- Paso ${paso.numero}. ${paso.titulo}. ${paso.texto}`).join("\n")}

## Comisiones y dispersión

Regla vigente: cero comisiones ocultas.
Cuota de red Basecamp durante los 30 días de prueba: 0 MXN.
Margen de Basecamp sobre el cobro del aliado durante esos 30 días: 0 MXN.
No existe en el repositorio un porcentaje de comisión, un costo neto distinto de cero, ni una tabla de reparto.
El cobro del aliado se liquida en la cuenta de Mercado Pago del propio comercio, por su terminal Point o por Checkout Pro.
Basecamp 420 canaliza la demanda. No retiene esa caja.
Las comisiones que cobre Mercado Pago al comercio son ajenas a este repositorio y no están parametrizadas aquí.

## Desconexión

Al día 30 el comercio decide. Si no renueva, conserva la terminal y se desconecta de la red Basecamp 420. No hay penalización ni plazo de permanencia.
`;

const operacion = `# 02. Operación de vuelos y seguridad

Hecho generado: ${generado}.
Horarios de producción, leídos de SLOTS_VUELO: ${horarios.join(", ")}. No hay otros horarios de despegue en el código.

## Jerarquía

Fuente: data/directorio_pilotos.json. Cupo de cada piloto: 1 pasajero por slot.
${pilotos.map((piloto) => `- Prioridad ${piloto.prioridad}: ${piloto.nombre}. Id ${piloto.id}. Estado ${piloto.estado}. Certificación tándem: ${piloto.certificacion_tandem ? "sí, APPI" : "no, formación o demo"}. Teléfono de registro: ${piloto.telefono}.`).join("\n")}

Asignación de un slot vacío:
1. Pasajero 1: Salvador Lara.
2. Pasajero 2: Farid (Muestra).
3. Pasajero 3: Karla Guzman (Muestra).
4. Pasajero 4: rechazo. Mensaje: "Ese horario ya está saturado para todos los pilotos del directorio." La interfaz muestra "Slot saturado".

Estados que pueden recibir pasajeros: activo y demo_presentacion.
DELETE /api/vuelos vacía data/reservas_vuelo.json. No reescribe el directorio. Exige sesión de administrador. Después del vaciado, el siguiente pasajero del slot es otra vez Salvador Lara.

## Seguridad previa al despegue

Checklist obligatorio en la hoja de ruta: arnés de copiloto, casco, radio, paracaídas.
Foto de inspección: input file, accept image/*, capture environment. La cámara que abre es la trasera del teléfono.
La confirmación guarda el nombre del archivo en la reserva. No guarda la imagen en el JSON.
Aviso de peso en la reserva: por encima de 95 kg se muestra advertencia. El API acepta de 40 a 120 kg.

## WhatsApp

Número oficial: 2727258748.
URL: /checkout.
Tras confirmar en /reservar, el botón abre el texto: "Hola Basecamp 420, confirmé mi reserva para el slot de las [HORA] con el piloto [PILOTO]."
Disponibilidad general: "Hola Basecamp 420, deseo validar disponibilidad para vuelo en parapente."
`;

const gastronomia = `# 03. Itinerario Día Cumbre y gastronomía

Hecho generado: ${generado}.
Producto: Día Cumbre All-Inclusive.
Precio público: 2950 MXN por persona.
Moneda: MXN. El paquete no está desglosado en centavos dentro de data/dia_cumbre.json. El precio 2950 es el precio comercial de esta fuente.

## Cronograma

Salida y regreso: Sprinter. Punto fijo: Oriente 27 y Norte 10, Orizaba.
${dia.paradas.map((parada) => `- ${parada.hora} hrs. ${parada.titulo}. ${parada.texto}`).join("\n")}

Detalle que fija esta fuente y no debe sustituirse:
- 09:00. Desayuno en ${anturios.hero.titulo}: orden de 3 picaditas (verde, roja y mole con queso de hebra y crema), café de olla con canela en jarrito de barro, huevos al gusto, pan dulce de horno.
- 12:15. Aterrizaje en ${paraiso.hero.titulo}. ${paraiso.hero.subtitulo}
- 12:30. Banquete botanero: tacos de birria dorados, consomé caliente y Michelada Caguama de 1 litro.

## Tarifas individuales de prueba

Fuente: data/menu_palapa.json. Son precios de menú en pesos enteros. La orden interna los multiplica por 100 y los guarda en centavos.
${menu.map((producto) => `- ${producto.nombre} (${producto.id}): ${producto.precio} MXN. Disponible: ${producto.disponible}. ${producto.descripcion}`).join("\n")}

## Costo neto del aliado y margen de la plataforma

Periodo de prueba: 30 días.
Costo de red que cobra Basecamp al aliado: 0 MXN.
Margen de plataforma sobre el dinero del aliado: 0 MXN.
Costo de la terminal: lo paga el comercio al adquirir su Mercado Pago Point. No es un cargo de Basecamp.
Neto del aliado por una venta en su terminal: el monto que Mercado Pago liquide en su cuenta. Este repositorio no resta una comisión propia.
Neto de Basecamp por canalizar esa venta durante la prueba: 0 MXN.
Precio del Día Cumbre (2950 MXN) es precio al pasajero. No es el costo neto del aliado gastronómico.
`;

const arquitectura = `# 04. Arquitectura técnica y API

Hecho generado: ${generado}.
Stack: Next.js ${paquete.dependencies.next}, React ${paquete.dependencies.react}, TypeScript ${paquete.dependencies.typescript}.
Repositorio: https://github.com/karla266/BASECAMP-420-sas-visual.git. Rama de trabajo: main.
Build verificado: npm run build generó 71 rutas, sin error de compilación.
Archivos de página encontrados ahora en app/: ${paginas.length}.
El número 71 es el conteo del build de Next.js (páginas estáticas y dinámicas del manifiesto). El número ${paginas.length} es el conteo de archivos page.* en el código. No son la misma métrica.

## Páginas de producto

${paginas.map((ruta) => `- ${ruta}`).join("\n")}

## Contratos en data/*.json

${contratos.map((nombre) => `- data/${nombre}`).join("\n")}

data/admin-acceso.json es acceso local del panel. No se usa como fuente pública de NotebookLM.
data/reservas_vuelo.json es el libro de reservas. DELETE /api/vuelos lo deja en [].
data/directorio_pilotos.json es la cascada de pilotos. El reinicio de demo no lo modifica.

## Endpoints

- POST /api/vuelos. Crea reserva. 201 con piloto asignado. 409 si el slot está saturado.
- GET /api/vuelos. Tablero. Requiere sesión de administrador.
- PATCH /api/vuelos. Anticipo, checklist y nombre de foto. Requiere sesión de administrador.
- DELETE /api/vuelos. Vacía reservas. Requiere sesión de administrador.
- GET /api/vuelos/disponibilidad?fecha=YYYY-MM-DD. Cupo público de los cuatro slots.
- POST /api/checkout. Preferencia Mercado Pago. tipo pedido_palapa cobra el menú. Sin ese tipo, cobra el flujo de vuelo.
- POST /api/webhooks/mercadopago. Confirma el pago contra la API de Mercado Pago. Si status es approved y la referencia empieza con PALAPA-, marca la orden pagada y envía WhatsApp al cliente.
- POST /api/pilotos. Alta de piloto al final de la lista. No cambia la prioridad 1.

## Variables de entorno

Nombres en .env.example. Los valores reales viven en .env.local y no se exportan a esta fuente.
${variables.map((nombre) => `- ${nombre}`).join("\n")}

WHATSAPP_API_BASE vacío usa http://127.0.0.1:8005 y la ruta /api/v1/whatsapp/send.
MP_ACCESS_TOKEN es obligatorio para crear la preferencia de pago.

## Interfaz móvil

Área táctil mínima: 48 px de alto, clase min-h-12.
Ancho de referencia: 375 px a 430 px.
El tablero /admin/vuelos usa tarjetas verticales por debajo de 768 px.
El menú público se abre con el botón Menú. Cada enlace del cajón mide al menos 48 px.
`;

const ecosistema = `# 05. Ecosistema corporativo

Hecho generado: ${generado}.
Empresa: Basecamp 420.
Las cuatro marcas siguientes son brazos de la misma empresa. Comparten teléfono 2727258748 y el punto Oriente 27 y Norte 10, Orizaba, Veracruz.

## Basecamp 420

Hub de turismo, parapente y experiencias en las Altas Montañas.
Lugares del día de vuelo: Restaurante Campestre Anturios a las 09:00 y Palapa El Paraíso en el aterrizaje.
Rutas: /parapente, /reservar, /experiencia-completa, /anturios, /el-paraiso.

## The Trip Smoke Shop

Retail especializado, cristalería y cultura lifestyle.
Nombre canónico: The Trip Smoke Shop.
Nombre breve: The Trip.
Nombre descartado: D-Trip.
Ruta: /thetrip.

## Movimiento Canábico Orizaba

Comunidad, activismo y difusión de la cultura cannábica.
Nombre canónico: Movimiento Canábico Orizaba.
Ruta: /movimiento-canabico/podcasts.

## Cima Digital

Agencia matriz de inteligencia artificial, automatización y factoría de software corporativo.
Nombre canónico: Cima Digital.
Nombre descartado: La Décima Digital y La Décima.
Cima Digital diseñó la automatización, los conmutadores y las reservas de Basecamp 420.
Rutas: /cima-digital y /cimadigital.
`;

const archivos = {
  "01_modelo_negocio_y_alianzas.md": modelo,
  "05_ecosistema_corporativo.md": ecosistema,
  "02_operacion_vuelos_y_seguridad.md": operacion,
  "03_itinerario_dia_cumbre_gastronomia.md": gastronomia,
  "04_arquitectura_tecnica_y_api.md": arquitectura,
};

fs.mkdirSync(salida, { recursive: true });
for (const [nombre, contenido] of Object.entries(archivos)) {
  const destino = path.join(salida, nombre);
  fs.writeFileSync(destino, contenido.trim() + "\n", "utf8");
  console.log(destino);
}
