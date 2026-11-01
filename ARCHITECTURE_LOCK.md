# Architecture lock

Mapa de lo que se puede editar y de lo que el build debe seguir encontrando igual.

## Rutas públicas de conversión

| Ruta | Función |
| --- | --- |
| `/` | Inicio |
| `/thetrip` | Catálogo. Agregar al carrito abre el panel. Comprar ahora y Apartar pre-venta van a `/checkout`. |
| `/adventure` | Vuelos y parapente |
| `/checkout` | Cobro con Mercado Pago Checkout Pro |
| `/reservar` | Reservaciones |

## Rutas transaccionales y formularios

| Ruta | Persistencia |
| --- | --- |
| `/pilotos/alta` | `POST /api/pilotos` inserta en `pilotos` de `pos_local.db` con estado `PENDIENTE` |
| `/aliados` | `POST /api/aliados` inserta en `aliados_b2b` |
| `/afiliate` | Redirige a `/aliados` |
| `/convenio` | Mismo formulario de aliados y el convenio operativo |

## Rutas administrativas

| Ruta | Acceso |
| --- | --- |
| `/admin` | Panel. PIN maestro `4200` con rol admin |
| `/admin/camara` | Captura de fotos. PIN `1010` queda limitado a esta vista |
| `/admin/catalogo` | Catálogo administrativo |

## Rutas y archivos prohibidos de reescritura

| Zona | Regla |
| --- | --- |
| `next.config.js` | Mantener `output: 'standalone'`. No cambiar el modo de salida de Hostinger. |
| PM2 y `server.js` | No cambiar los puertos 3000 y 65002. |
| Rama `feat/ai-factory` | Micro-POS (FastAPI, Go, MariaDB 3307) permanece desacoplado de `main`. |

## Matriz de catálogo

| Nivel | Zona | Regla |
| --- | --- | --- |
| Bloqueado | Bongs, Pipas, Cristalería Pyrex, Conos, Outdoor | Precio de lista SICAR. Sin margen dinámico. |
| Bloqueado | Filtro de ajenos | No incorporar papelería, juguetes ni novedades fuera de Basecamp 420. El filtro vive en `lib/ctaProducto.ts`. |
| Editable | Otros Productos y Otros Smoke Shop | Preventa a 2x sobre costo. Stock a 3x. |
| Editable | `/checkout`, `/thetrip`, chat de ventas | La compra se cierra en Mercado Pago Checkout Pro. |

## Archivos que el bot exige

- `context/CartContext.tsx`
- `components/CartDrawer.tsx`
- `app/checkout/page.tsx`
- `app/api/checkout/route.ts`
- `components/chat/SalesChatbot.tsx`

`scripts/guard_integrity.py` corre en `prebuild`. Revisa esas rutas y aborta si el catálogo o el checkout vuelven a apuntar a Mercado Libre o a un enlace de compra por WhatsApp.
