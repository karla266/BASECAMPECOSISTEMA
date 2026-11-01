const axios = require('axios');
const fs = require('fs');
const path = require('path');

function cargarEnvLocal() {
  const archivo = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(archivo)) return;
  for (const linea of fs.readFileSync(archivo, 'utf8').split(/\r?\n/)) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith('#')) continue;
    const corte = limpia.indexOf('=');
    if (corte <= 0) continue;
    const clave = limpia.slice(0, corte).trim();
    let valor = limpia.slice(corte + 1).trim();
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
      valor = valor.slice(1, -1);
    }
    if (process.env[clave] === undefined) process.env[clave] = valor;
  }
}

cargarEnvLocal();

async function probarCheckoutPreventa() {
  console.log("Iniciando simulador de Checkout de Pre-Venta (The Trip)...");

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

  if (!MP_ACCESS_TOKEN) {
    console.error("ERROR: No se encontró 'MP_ACCESS_TOKEN' en las variables de entorno.");
    console.log("Asegúrate de tener un archivo .env.local con tus credenciales de Mercado Pago.");
    process.exitCode = 1;
    return;
  }

  const modo = MP_ACCESS_TOKEN.startsWith('TEST-') ? 'prueba' : 'produccion';
  console.log(`Modo del token: ${modo}`);

  const payloadBlunt = {
    sku: "BW2X-BERRIES",
    nombre: "Blunt Wrap 2X Double Platinum (Sabor Moras)",
    precio: 30.00,
    cantidad: 1,
    fecha_llegada: "Jueves"
  };

  const payloadTiara = {
    sku: "TE-OTROS-PIPA-CRISTAL-AZUL",
    nombre: "Pipa de Cristal Soplado (Azul Cobalto)",
    precio: 250.00,
    cantidad: 1,
    fecha_llegada: "1 de Diciembre"
  };

  const procesarPago = async (payload) => {
    try {
      console.log(`\nGenerando preferencia para: ${payload.nombre}`);

      const orderId = `PREV-${payload.sku}-${Date.now()}`;
      const conceptoLimpio = `[PREVENTA - Entrega: ${payload.fecha_llegada}] ${payload.nombre}`.substring(0, 120);

      const preferenceData = {
        items: [
          {
            id: payload.sku,
            title: conceptoLimpio,
            description: `Apartado The Trip Smoke Shop. Fecha estimada de llegada y despacho: ${payload.fecha_llegada}.`,
            unit_price: Number(payload.precio),
            quantity: Number(payload.cantidad),
            currency_id: 'MXN'
          }
        ],
        statement_descriptor: 'BASECAMP420',
        external_reference: orderId,
        metadata: {
          tipo: 'preventa',
          sku_producto: payload.sku,
          fecha_compromiso_entrega: payload.fecha_llegada,
          canal: 'the_trip_web_simulador'
        },
        back_urls: {
          success: 'https://www.basecamp420.com/thetrip?status=approved',
          pending: 'https://www.basecamp420.com/thetrip?status=pending',
          failure: 'https://www.basecamp420.com/thetrip?status=rejected'
        },
        auto_return: 'approved'
      };

      const respuesta = await axios.post(
        'https://api.mercadopago.com/checkout/preferences',
        preferenceData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
          },
          timeout: 20000
        }
      );

      console.log("Preferencia generada con éxito.");
      console.log(`ENLACE DE COBRO: ${respuesta.data.init_point}`);
      console.log(`ID de Orden: ${orderId}`);
      console.log(`Monto: $${Number(payload.precio).toFixed(2)} MXN`);
      console.log(`Entrega: ${payload.fecha_llegada}`);

    } catch (error) {
      console.error("Error al conectar con Mercado Pago:");
      if (error.response) {
        console.error(JSON.stringify(error.response.data));
      } else {
        console.error(error.message);
      }
      process.exitCode = 1;
    }
  };

  await procesarPago(payloadBlunt);
  await procesarPago(payloadTiara);

  console.log("\nSimulación completada.");
}

probarCheckoutPreventa();
