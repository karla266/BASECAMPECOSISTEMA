# 04. Arquitectura técnica y API

Hecho generado: 2026-11-01T02:33:51.844Z.
Stack: Next.js 14.2.3, React ^18.2.0, TypeScript ^5.4.5.
Repositorio: https://github.com/karla266/BASECAMP-420-sas-visual.git. Rama de trabajo: main.
Build verificado: npm run build generó 71 rutas, sin error de compilación.
Archivos de página encontrados ahora en app/: 57.
El número 71 es el conteo del build de Next.js (páginas estáticas y dinámicas del manifiesto). El número 57 es el conteo de archivos page.* en el código. No son la misma métrica.

## Páginas de producto

- /
- /_tenants/[tenant]
- /admin
- /admin/acceso
- /admin/acceso-pos
- /admin/ai-copilot
- /admin/autopilot
- /admin/camara
- /admin/camaras
- /admin/checkin
- /admin/csv
- /admin/lectores
- /admin/lote
- /admin/multiservicios
- /admin/pedidos
- /admin/podcast/subir
- /admin/podcasts/studio
- /admin/podcasts/subir
- /admin/products
- /admin/settings
- /admin/social
- /admin/templates
- /admin/todo
- /admin/voice
- /admin/vuelos
- /adventure
- /afiliate
- /aliados
- /amparos
- /anturios
- /blog
- /blog/[slug]
- /blog/amparo-canabico
- /calendario
- /cima-digital
- /cimadigital
- /cimadigital/orquestador
- /comprobante/[id]
- /comunidad/movimiento-cannabico/podcast
- /convenio
- /ecosistema
- /el-paraiso
- /experiencia-completa
- /explore
- /generador-amparo
- /ingreso-admin
- /movimiento-canabico/podcasts
- /ordenar
- /ordenar/exito
- /parapente
- /pilotos/alta
- /puente-huella
- /renta
- /reservar
- /thetrip
- /tienda
- /trepacerros

## Contratos en data/*.json

- data/admin-acceso.json
- data/aliados.json
- data/anturios.json
- data/catalogo_the_trip.json
- data/dia_cumbre.json
- data/directorio_pilotos.json
- data/el_paraiso.json
- data/faqs_whatsapp.json
- data/lote-aprobacion.json
- data/menu_palapa.json
- data/multiservicios_config.json
- data/podcasts.json
- data/reservas_vuelo.json

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
- SICAR_HOST
- SICAR_PORT
- SICAR_USER
- SICAR_PASSWORD
- SICAR_DATABASE
- SICAR_DB_NAME
- SICAR_PASS
- SICAR_USER_3306
- SICAR_PASS_3306
- SICAR_USER_3307
- SICAR_PASS_3307
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_PASS
- DB_NAME
- DB_MADERA_NAME
- DB_SMOKESHOP_NAME
- MP_ACCESS_TOKEN
- MP_WEBHOOK_SECRET
- WHATSAPP_API_BASE
- MELI_CLIENT_ID
- MELI_APP_ID
- MELI_CLIENT_SECRET
- MELI_REDIRECT_URI
- GOOGLE_SECRETS
- ADMIN_SESSION_SECRET
- WEB_API_SECRET_KEY
- GEMINI_API_KEY
- OLLAMA_URL
- OLLAMA_MODEL
- TTS_PROVIDER
- ELEVENLABS_API_KEY
- ELEVENLABS_VOICE_ID
- OPENAI_API_KEY
- YOUTUBE_CLIENT_ID
- YOUTUBE_CLIENT_SECRET
- YOUTUBE_REFRESH_TOKEN
- YOUTUBE_PLAYLIST_ID
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET
- SPOTIFY_SHOW_ID
- APP_URL
- NEXT_PUBLIC_SITE_API_BASE
- NEXT_PUBLIC_POS_API_BASE

WHATSAPP_API_BASE vacío usa http://127.0.0.1:8005 y la ruta /api/v1/whatsapp/send.
MP_ACCESS_TOKEN es obligatorio para crear la preferencia de pago.

## Interfaz móvil

Área táctil mínima: 48 px de alto, clase min-h-12.
Ancho de referencia: 375 px a 430 px.
El tablero /admin/vuelos usa tarjetas verticales por debajo de 768 px.
El menú público se abre con el botón Menú. Cada enlace del cajón mide al menos 48 px.
