# Estado de Producción — Basecamp 420 (Entrega crítica 8:00 AM)

## 1) Arquitectura de pagos activa

### Mercado Pago (Checkout Pro)
- Endpoint backend: `/api/checkout`
- Token requerido: `MP_ACCESS_TOKEN`
- Llave pública frontend: `NEXT_PUBLIC_MP_PUBLIC_KEY`
- Flujo de cobro:
  1. Cliente agenda desde `/calendario`.
  2. Se crea preferencia en backend.
  3. Checkout Pro redirige a Mercado Pago para completar pago.

### Modalidades comerciales vigentes
- **Vuelo tándem web directa:** `$1,600 MXN`
- **Canje certificado Mercado Libre:** `$2,800 MXN`
- **Curso APPI:** `$30,000 MXN`
  - Opción A: `$6,000 MXN` de anticipo + `$24,000 MXN` día 1
  - Opción B: `12 x $3,000 MXN` vía Mercado Pago

---

## 2) Rutas activas de negocio y conversión

- `/explore` → landing de conversión para vuelos/cursos y narrativa de autoridad técnica.
- `/calendario` → agenda + cobro online / validación de folio.
- `/blog` → catálogo dinámico de contenido SEO.
- `/blog/[slug]` → detalle de artículos con CTA a `/calendario` y `/explore`.

---

## 3) Estado de tokens Meta / autopublicación

- Script de autopublicación: `scripts/autopublish.py`
- Publicación de página Movimiento Canábico Orizaba:
  - Endpoint canónico: `https://graph.facebook.com/v19.0/me/feed`
  - Token requerido: `MCO_PAGE_ACCESS_TOKEN`
  - Objetivo: evitar error `#100` por uso de global ID incorrecto.
- Despachador Trepacerros Orizaba 2.0:
  - Salida local: `docs/PENDIENTE_TREPACERROS.txt`
  - Copy montañero listo para compartir manualmente.

---

## 4) Checklist operativo de despliegue 8:00 AM

- [ ] Verificar que variables productivas estén cargadas:
  - [ ] `MP_ACCESS_TOKEN`
  - [ ] `NEXT_PUBLIC_MP_PUBLIC_KEY`
  - [ ] `MCO_PAGE_ACCESS_TOKEN`
- [ ] Confirmar `npm run build` sin errores.
- [ ] Confirmar rutas:
  - [ ] `/explore`
  - [ ] `/calendario`
  - [ ] `/blog`
- [ ] Verificar que `.env.local` no se suba (protegido por `.gitignore`).
- [ ] Ejecutar push final en `origin/main`.
- [ ] Validar despliegue en hosting y prueba de navegación básica post-release.
