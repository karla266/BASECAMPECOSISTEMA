# Auditoría web: navegación, despliegue y publicaciones

## Resumen ejecutivo

La aplicación pública ya tiene componentes reutilizables para navegación y pie de página, pero todavía no forman un shell único del sitio: cada componente mantiene su propia lista de enlaces y el layout raíz no los monta. Por eso, la existencia de ambos componentes no garantiza que todas las rutas los muestren ni que compartan el mismo mapa de navegación.

El despliegue y la publicación de contenido también son procesos separados e incompletos. Hay un script de despliegue por SSH y herramientas que generan calendarios y copys; sin embargo, el despachador mensual cambia una publicación a `publicado` sin enviar nada a una plataforma. El workflow candidato de Hostinger aún no está integrado en `main` y su validación más reciente terminó en error en una búsqueda demasiado amplia de referencias a PM2.

**Conclusión:** antes de automatizar más, hay que acordar qué rutas pertenecen al sitio público, cuál es el runtime oficial de Hostinger y qué evento confirma una publicación real. Después se puede consolidar el menú y pie en un módulo común, y probar ambos procesos de extremo a extremo.

## Alcance y fuentes

- La rama revisada para esta solicitud es `copilot/genera-analisis-detado`; su base `docs/orden-ecosistema` contiene un índice del ecosistema, no el árbol de la aplicación web.
- Para revisar el sitio se consultó `main` en el commit `730e535b34fbe61032ae615bbadc0b8f9df9f4e5`. No se deben interpretar los archivos ausentes de la rama de documentación como ausentes de la aplicación en `main`.
- El índice `LEEME_ECOSISTEMA.md` describe la web pública como Next.js 14; el `package.json` de `main` fija Next.js 15.5.28. Hay que corregir esa discrepancia en la documentación operativa.
- Referencias verificadas en `main`: `app/layout.tsx`, `components/sitio/NavegacionSitio.tsx`, `components/sitio/PieSitio.tsx`, `scripts/deploy_hostinger.sh`, `scripts/autopublicador_semana1.js`, `scripts/autopublish.py`, `scripts/despachador_cron.py`, `package.json` y `ARCHITECTURE_LOCK.md`.
- El workflow de Hostinger que se menciona abajo corresponde al PR borrador #3, rama `ops/hostinger-cicd-hardening`; no es evidencia de que ese workflow ya esté activo en `main`.

## 1. Menú y pie de página

### Estado observado

| Área | Estado | Evidencia e impacto |
| --- | --- | --- |
| Navegación principal | Existe `components/sitio/NavegacionSitio.tsx`, con menú de escritorio y móvil, cierre al cambiar de ruta y acceso al carrito. | El componente mantiene su arreglo `ENLACES` local. |
| Pie de página | Existe `components/sitio/PieSitio.tsx`, con dirección, teléfono, correo y enlaces. | Mantiene un segundo arreglo `ENLACES`; no comparte la fuente de la navegación. |
| Cobertura global | `app/layout.tsx` renderiza proveedores y contenido, pero no importa ni monta `NavegacionSitio` o `PieSitio`. | No hay garantía de que se apliquen globalmente; una página puede omitirlos o implementar su propio shell. |
| Catálogo / rutas | `app/thetrip/page.tsx` es una experiencia cliente propia. El App Router incluye muchas áreas públicas y transaccionales, además de administración. | Unificar el shell sin clasificar las rutas podría poner navegación pública en checkout, comprobantes o administración. |

Las listas de navegación y pie no coinciden:

- La navegación incluye `/ecosistema`, `/explore` y `/blog`; el pie no.
- El pie incluye `/contacto`, `/legal` y `/terminos`; la navegación no.
- El resto de los enlaces se repite en dos arreglos que habrá que modificar y validar por separado.

No se comprobó que todos los componentes de página usen estas dos piezas. Por tanto, el hallazgo preciso es que **no existe integración desde el layout raíz y la consistencia no está garantizada**, no que todos los usuarios vean actualmente dos menús distintos.

### Trabajo necesario para unificarlos

1. Acordar un mapa de rutas públicas y decidir qué enlaces son primarios, secundarios o legales.
2. Mantener una única definición tipada de enlaces; derivar de ella el menú principal y el pie, permitiendo que el pie añada enlaces legales sin duplicar la lista común.
3. Montar ambos componentes desde el layout del sitio público. Mantener explícitamente fuera del shell las rutas de administración, autenticación, checkout y comprobantes si sus flujos requieren una interfaz distinta.
4. Verificar los destinos contra el App Router y revisar etiquetas, enlace activo, foco/teclado, menú móvil, carrito y espacio superior reservado por la navegación fija.
5. Añadir pruebas que comprueben enlaces válidos y la presencia del shell en las rutas públicas representativas; incluir al menos una ruta transaccional y una administrativa para evitar aplicarles el shell por accidente.

## 2. Despliegue y publicación del sitio

### Estado observado

- `scripts/deploy_hostinger.sh` ofrece un preflight `--check`, verifica destino y herramientas, corre `tsc` y `npm run build`, arma el paquete standalone, lo transfiere por `rsync` o `tar` sobre SSH en el puerto `65002` y reinicia el proceso remoto.
- El script hace una actualización directa del directorio remoto y ejecuta `npm install --production` antes del reinicio. No se observa en el flujo una promoción atómica de versiones, verificación de salud posterior al reinicio ni reversión automatizada.
- `package.json` incluye `build` y `start`, pero no un comando estándar de despliegue.
- Hay un contrato de runtime que debe resolverse: el script y `ARCHITECTURE_LOCK.md` describen PM2; el PR borrador #3 describe recarga de Passenger mediante `tmp/restart.txt`. No se deben mezclar ambas formas de arranque en el mismo procedimiento sin confirmar la configuración real de Hostinger.

### CI observada

El PR borrador #3, “Harden Basecamp 420 Hostinger CI/CD”, propone validación de build en PR y despliegue a `main`; sigue abierto y no está fusionado. Su ejecución `43129089168` construyó la aplicación, pero falló en el paso “Reject unsafe deployment references”. El `grep` buscó `pm2` por todo el repositorio, incluso en documentación, en el propio workflow y en binarios/artefactos de `.next` y `public`. El resultado es una regla de bloqueo ruidosa y, a la vez, evidencia una contradicción real entre la propuesta Passenger y las referencias PM2 existentes.

Antes de habilitar despliegue automático:

1. Confirmar con Hostinger si producción corre bajo Passenger o PM2 y documentar una sola fuente de verdad.
2. Hacer que la búsqueda de políticas examine solo archivos fuente/configuración relevantes, excluya artefactos y binarios y no falle por menciones descriptivas; conservar una comprobación explícita de la configuración de runtime que se haya elegido.
3. Desplegar el artefacto ya construido y validado, en vez de resolver dependencias de forma mutable en producción.
4. Mantener secretos únicamente en el entorno de servidor/secretos de Actions; comprobar que no se copien archivos `.env`.
5. Añadir comprobación de salud posterior al despliegue y un procedimiento probado de reversión. Mantener cargas y datos persistentes fuera de los directorios reemplazables por una versión.

## 3. Generación y publicación automática de contenido

| Pieza | Lo que hace hoy | Brecha |
| --- | --- | --- |
| `scripts/autopublicador_semana1.js` | Genera siete borradores, valida parte del copy y escribe JSON, calendario Markdown y fuente para NotebookLM. | Es generación de materiales, no programación ni publicación en redes. El inicio de la semana está fijado en `2026-11-02`, por lo que la salida queda obsoleta al reutilizar el script. |
| `scripts/autopublish.py` | Puede publicar copy en una página de Meta con `MCO_PAGE_ACCESS_TOKEN`; para Trepacerros guarda un archivo de texto. | Cubre dos destinos distintos, no una cola común multicanal; el modo de grupo no publica y la herramienta no ofrece un calendario/worker de ejecución. |
| `scripts/despachador_cron.py` | Lee `data/cola_mensual_<año>_<mes>.json` y detecta elementos vencidos dentro de una ventana de 30 minutos. | Cambia `estado` a `publicado` y asigna `publicado_at` sin invocar un proveedor ni comprobar una respuesta externa. Puede registrar como publicada una pieza que nunca se publicó. |

El estado `publicado` debe significar que la plataforma confirmó la operación. La cola necesita separar, como mínimo, borrador, aprobación, programación, publicación en curso, publicado y error. El registro de éxito debe guardar proveedor, identificador/URL de publicación y fecha de confirmación. Los intentos deben ser idempotentes, tener reintentos controlados y dejar trazabilidad sin revelar tokens.

También falta establecer la zona horaria canónica. El generador semanal usa `America/Mexico_City`, mientras que el despachador mensual compara con la hora local del servidor. Sin una política común, un cambio de zona del host puede adelantar o atrasar publicaciones.

## 4. Prioridad recomendada

### P0 — Aclarar contratos de producción

- Confirmar qué árbol y rama son la fuente del sitio público y mantener este índice actualizado.
- Resolver Passenger vs. PM2 con evidencia del entorno de Hostinger.
- Definir qué significa “publicada” y qué proveedor confirma ese estado.

### P1 — Unificar el shell público

- Consolidar la fuente de enlaces del menú y pie.
- Aplicar el shell solo a rutas públicas.
- Añadir verificaciones de destinos, presentación móvil y rutas que deben quedar fuera.

### P2 — Despliegue repetible y reversible

- Corregir el escaneo que bloqueó el PR #3 y alinear sus reglas con el runtime elegido.
- Exigir build y verificaciones antes de desplegar; preservar datos y cargas.
- Añadir health check y rollback y comprobar el flujo primero en un entorno seguro.

### P3 — Publicador real

- Convertir el cron en consumidor de una cola con zona horaria explícita y control de concurrencia.
- Separar generación, aprobación y envío; guardar la respuesta de cada proveedor.
- Probar envío, fallo, reintento e idempotencia con proveedores simulados antes de activar publicaciones reales.

## Criterios de aceptación

- Una sola fuente de verdad define enlaces compartidos; las diferencias deliberadas del pie (por ejemplo, legales) son explícitas.
- Todas las rutas públicas acordadas muestran el mismo menú y pie; administración y flujos transaccionales conservan su UX prevista.
- Una prueba detecta destinos inexistentes y un build limpio verifica la integración.
- El workflow de despliegue termina verde, usa el runtime confirmado, valida salud y permite rollback sin perder cargas.
- Una pieza solo aparece como `publicado` después de una confirmación real del canal, conserva su ID/URL y no se duplica al reintentar.

Esta auditoría registra brechas y una ruta de trabajo; no realiza cambios en el código de la web ni activa despliegues o publicaciones.
