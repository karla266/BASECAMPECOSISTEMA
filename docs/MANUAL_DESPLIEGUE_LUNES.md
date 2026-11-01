# Manual de despliegue — Lunes, Día Cero

Basecamp 420. Sitio: https://www.basecamp420.com. Teléfono: 2727258748. Salida de la Sprinter: 08:30, Oriente 27 y Norte 10, Orizaba.

Este protocolo cubre el lunes de apertura. No guarda contraseñas, tokens ni archivos `.env`. Esos valores viven solo en el panel del servidor.

El build de Next omite TypeScript y el linter. La puerta de este lunes es `npx tsc --noEmit` y `npm run lint` en la máquina de release, antes del push.

## Fase 1. Servidor

1. Confirmar que `main` en GitHub ya tiene el commit de día cero: webhooks, transporte, reservas y este manual.
2. Entrar al panel de Hostinger de la aplicación Node de www.basecamp420.com.
3. Presionar **Redistribuir** solo después de que el push haya terminado. No redistribuir sobre un push a medias.
4. Dejar que Hostinger instale dependencias y ejecute `npm run build`. La app sale en modo `standalone` (`output: 'standalone'` en `next.config.js`).
5. El arranque de producción es `node .next/standalone/server.js`. `npx next start` avisa que no aplica con esa configuración.
6. Revisar que el entorno del servidor tenga las llaves de `.env.example` con valores reales, sin subir ese archivo al repositorio. Mínimo para cobrar y avisar:
   - `MP_ACCESS_TOKEN` para crear la preferencia de Mercado Pago.
   - `MP_WEBHOOK_SECRET` para el webhook.
   - `APP_URL` en `https://www.basecamp420.com`, para que la notificación de pago salga por HTTPS.
   - `WHATSAPP_API_BASE` vacío usa `http://127.0.0.1:8005` y la ruta `/api/v1/whatsapp/send`.
   - `ADMIN_SESSION_SECRET` para la cookie de administrador.
7. No copiar al servidor el teléfono de muestra `520000000000`. El WhatsApp público sigue siendo 2727258748.
8. No sustituir `data/directorio_pilotos.json`. El reinicio de demo no debe tocar ese archivo.

Comprobación de fase: la home responde en https://www.basecamp420.com y `/sitemap.xml` incluye `/transporte/operacion`.

## Fase 2. Hardware

Unidad: Sprinter del Día Cumbre. Teléfono del chofer, una sola mano, en `/transporte/operacion`.

1. Abrir la cabina con datos móviles. El reloj de la cabecera debe moverse. El semáforo arranca en «En inspección».
2. Conceder cámara trasera. La evidencia de neumáticos y cabina usa `<input type="file" accept="image/*" capture="environment">`. Se guarda el nombre del archivo en la sesión del teléfono, no la imagen en el repositorio.
3. Checklist obligatorio antes de abordar: diesel al 50% o más, extintor vigente, botiquín, cinturones de seguridad y aire acondicionado.
4. Probar vibración y sonido del teléfono con un folio de muestra. Si el navegador bloquea el audio, el abordaje igual cambia el estatus.
5. Dejar a la vista el botón rojo «Emergencia o tráfico · WhatsApp 2727258748». Abre `https://wa.me/522727258748`.
6. Maletero: velas (`VELA-`) y arneses (`ARNES-`) para el despegue de Salvador Lara (APPI).
7. En caja, la terminal Mercado Pago Point del comercio es del comercio. Basecamp no se queda con esa liquidación.

La lista Alfa, Beta y Gamma (`DC-2026-001` a `DC-2026-003`) es de muestra. El lunes, el folio real del pase sustituye esa práctica.

## Fase 3. Pruebas de humo

Hacerlas antes de las 08:00. Si ya hay reservas reales del lunes, no vaciar el libro.

1. `https://www.basecamp420.com/reservar` carga los slots 10:00, 12:00, 14:00 y 16:00. El primer lugar de un slot libre es Salvador Lara.
2. `https://www.basecamp420.com/transporte/operacion` abre la cabina. «Aprobar Inspección y Abrir Abordaje» permanece apagado hasta el checklist y la foto. Después el semáforo pasa a verde y el folio `DC-2026-XXX` puede quedar «A BORDO».
3. Un folio que no es `DC-2026-XXX`, o que no está citado a las 08:30, no sube a nadie.
4. `POST /api/webhooks/mercadopago`: un pago con `status` aprobado y referencia `PALAPA-` marca la orden como pagada y avisa al WhatsApp que el cliente dejó en el checkout. Si el aviso falla, la orden no se da por notificada.
5. `POST /api/checkout` con el flujo de vuelo no se mezcla con `tipo: pedido_palapa`. El anticipo de vuelo publicado es $1,600 MXN. La referencia de vuelo es $2,800 MXN.
6. `GET /api/vuelos/disponibilidad?fecha=YYYY-MM-DD` responde el cupo de los cuatro slots sin sesión.
7. `DELETE /api/vuelos` exige sesión de administrador, deja `data/reservas_vuelo.json` en `[]` y no cambia el directorio de pilotos. No usarlo el lunes si el libro ya tiene pasajeros.
8. `/ordenar/exito` muestra el botón de respaldo al 2727258748.

Precios que no se improvisan en la prueba: Día Cumbre $2,950 MXN por persona. Michelada Caguama $100, hot dog $30, taco $15. Comisión de la red de aliados en los 30 días de prueba: $0 MXN.

## Fase 4. Apertura

08:30 en Oriente 27 y Norte 10.

1. El chofer completa la inspección y solo entonces abre el abordaje. Semáforo verde.
2. Cada pase se lee por QR o se escribe `DC-2026-XXX`. El teléfono confirma con sonido o vibración. El estatus visible es PENDIENTE o A BORDO, con el número de asientos.
3. Se cuentan velas y arneses del maletero a nombre de Salvador Lara (APPI) antes de salir a la montaña.
4. 09:00, desayuno y check-in en Restaurante Campestre Anturios.
5. 10:15, subida. 10:45 a 12:00, vuelos tándem. 12:15, aterrizaje en Palapa El Paraíso. 12:30, banquete. 15:30, retorno en Sprinter a Orizaba.
6. Cualquier tráfico o emergencia de la unidad sale por el botón de WhatsApp al 2727258748, no por un chat personal.
7. Las cuatro marcas de la empresa ese día son Basecamp 420, The Trip Smoke Shop, Movimiento Canábico Orizaba y Cima Digital.

Cierre de fase: la Sprinter salió con inspección verde, los pases del día quedaron a bordo y el webhook de Mercado Pago responde en el dominio público.
