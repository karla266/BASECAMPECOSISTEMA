# El asistente Tulio ya no está en el panel

El PHP, Express y los scripts de Tulio salieron de este proyecto Next.js para que `npm run build` no intente compilarlos.

Nueva ruta:

`01_CORE_PRODUCCION\Basecamp 420 Micro-POS\asistente-tulio\`

Ahí quedaron `servidor_asistente_sicar.js`, `agente_tulio_local.py`, `arrancar_tulio.bat` y el código PHP (servicios, controladores y la migración de tenants).

El panel sigue siendo esta carpeta, en el puerto 3000. Tulio se arranca desde la ruta nueva, no desde aquí.
