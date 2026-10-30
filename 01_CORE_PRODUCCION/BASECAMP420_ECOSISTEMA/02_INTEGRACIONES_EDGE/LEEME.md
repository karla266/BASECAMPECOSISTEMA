# Integraciones edge — Orizaba

Índice del mostrador local. El código y las fotos permanecen en `C:\Proyectos`. Esta carpeta solo señala las entradas.

## Servicios

| Pieza | Ruta | Puerto |
| --- | --- | --- |
| POS local (pickup, sync Hostinger, amparo) | `C:\Proyectos\pos_main.py` | `8110` |
| Catálogo de mostrador | `C:\Proyectos\catalogo_gigante` (`iniciar_catalogo.bat`) | `8090` |
| Voz (WebSocket y despacho) | `C:\Proyectos\cima-voice-backend` | destino `CORE_POS_URL` |
| Mock que hoy recibe la voz | `C:\Proyectos\cima-voice-backend\mock_pos.py` | `8001` |
| Plantilla de entorno del edge | `C:\Proyectos\.env.example` | `PORT=8110`, `CORE_POS_URL=http://127.0.0.1:8001` |

`pos_main.py` expone `/api/v1/pos/pickup/pendientes`, `/api/v1/pos/pickup/entregar`, `/api/v1/legal/generar-amparo` y `/health`.

## Corte de puertos: voz y POS

La voz publica en `{CORE_POS_URL}/api/v1/voice/events`. El valor por defecto es `http://127.0.0.1:8001`, y `mock_pos.py` escucha ahí.

`pos_main.py` escucha en el puerto `8110`. Hoy no expone `/api/v1/voice/events`.

Conectar la voz al POS real, o dejar el mock como destino explícito, es un corte de código aparte. Este índice no cambia ese comportamiento.

## Fotos y catálogo web

El pipeline sigue en `C:\Proyectos`. No se mueven `fotos_crudas` ni los lotes de SICAR.

- Origen: `C:\Proyectos\fotos_crudas`
- Clasificación: `clasificador_fotos.py`, `clasificador_express.py`, `auto_matcher.py`, `auto_matcher_fase2.py`
- Preparación SICAR: `preparar_sicar_v4.py`, `reparar_para_sicar.py`
- Publicación: `sincronizar_sicar_web.py` escribe `C:\Proyectos\web_activos_basecamp420\catalogo_productos.json`
- Captura desde el celular: `servidor_camara_movil.py`
