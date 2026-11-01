# 02. Operación de vuelos y seguridad

Hecho generado: 2026-11-01T02:33:51.844Z.
Horarios de producción, leídos de SLOTS_VUELO: 10:00, 12:00, 14:00, 16:00. No hay otros horarios de despegue en el código.

## Jerarquía

Fuente: data/directorio_pilotos.json. Cupo de cada piloto: 1 pasajero por slot.
- Prioridad 1: Salvador Lara. Id piloto_001. Estado activo. Certificación tándem: sí, APPI. Teléfono de registro: 520000000000.
- Prioridad 2: Farid (Muestra). Id piloto_002. Estado demo_presentacion. Certificación tándem: no, formación o demo. Teléfono de registro: 520000000000.
- Prioridad 3: Karla Guzman (Muestra). Id piloto_003. Estado demo_presentacion. Certificación tándem: no, formación o demo. Teléfono de registro: 522727258748.

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
URL: https://wa.me/522727258748.
Tras confirmar en /reservar, el botón abre el texto: "Hola Basecamp 420, confirmé mi reserva para el slot de las [HORA] con el piloto [PILOTO]."
Disponibilidad general: "Hola Basecamp 420, deseo validar disponibilidad para vuelo en parapente."
