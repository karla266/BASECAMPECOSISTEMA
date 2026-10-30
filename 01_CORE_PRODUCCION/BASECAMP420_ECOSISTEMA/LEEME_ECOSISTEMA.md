# Ecosistema Basecamp 420

Mapa de la fuente de verdad. Cada capa tiene una carpeta canónica. Este directorio guarda el contrato de sync POS a web; el código de caja, la web pública y el mostrador local viven en las rutas de abajo.

## Capas canónicas

### Web pública

`C:\BASECAMP-ECOSYSTEMA\01_CORE_PRODUCCION\Basecamp 420 Micro-POS\BASECAMP-420-sas-visual`

Next.js 14 en Hostinger. Mercado Pago Checkout Pro. Rutas de negocio: `/explore`, `/calendario`, `/blog`. Estado de entrega: `ESTADO_PRODUCCION.md` en esa misma carpeta.

`01_APPS/basecamp420-web` es el contrato de sync con Hostinger (inventario y catálogo), no el sitio público.

### POS de mostrador

`C:\BASECAMP-ECOSYSTEMA\01_CORE_PRODUCCION\Basecamp 420 Micro-POS`

Python, Mercado Pago Point Smart, SICAR e idempotencia de cobro. La fábrica de contenido está en `services/factory/`. Tulio corre aparte en `asistente-tulio`.

El sync con outbox SQLite hacia la web está en `01_APPS/basecamp420-pos` (FastAPI).

### Edge de Orizaba

`C:\Proyectos`

El mostrador local se queda ahí. El índice de entradas, puertos y fotos está en `02_INTEGRACIONES_EDGE/LEEME.md`. Esas carpetas no se copian a este árbol.

### Núcleo transaccional en Go

`C:\Proyectos\basecam-420-core`

`services/svc-pos-offline-sync` tiene la entidad `Product` con precios en centavos y un `main` que solo registra actividad. Todavía no hay `go.mod`, gRPC ni base de datos. El POS en producción sigue en Python hasta que el sync offline tenga repositorio, casos de uso y pruebas.

## Carpetas de este directorio

- `01_APPS/basecamp420-pos`: POS de sync (FastAPI, outbox SQLite, SICAR).
- `01_APPS/basecamp420-web`: slice de sync con Hostinger.
- `02_INTEGRACIONES_EDGE`: índice del edge en `C:\Proyectos`. El código sigue en el mostrador.
- `03_MULTIMEDIA_ASSETS`: reservada para logos y assets optimizados. Las fotos de producto viven en `C:\Proyectos`.
- `04_DEVOPS_Y_SCRIPTS`: empaquetado, respaldo y despliegue.
- `05_DOCUMENTACION`: reservada para manuales y contratos de interfaz.

## Fuera de edición

- `C:\BASECAMP-ECOSYSTEMA\00_ARCHIVOS_LEGACY`
- `C:\BASECAMP-ECOSYSTEMA\02_RUNTIME_SERVIDORES`
- `C:\BASECAMP-ECOSYSTEMA\secrets`

Investigación y experimentos (`04_INVESTIGACION`, `06_EXPERIMENTOS`) no son la fuente de verdad del POS ni de la web.
