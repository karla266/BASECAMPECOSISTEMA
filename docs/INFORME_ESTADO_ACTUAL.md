# Informe ejecutivo de estado

Basecamp 420. Portal en `https://www.basecamp420.com`. Teléfono oficial: 2727258748. Punto de salida: Oriente 27 y Norte 10, Orizaba, Veracruz.

## Compilación

- Framework: Next.js 14.2.3, App Router.
- Último `npm run build` exitoso: 71 rutas generadas, sin error de compilación.
- TypeScript: `npx tsc --noEmit` es la validación de tipos. `next build` omite esa validación por configuración del proyecto.
- Lint: `npm run lint` termina con código 0. Quedan advertencias previas de `<img>` y dependencias de hooks. No bloquean el build.

## Directorio de pilotos

Fuente: `data/directorio_pilotos.json`.

| Piloto | Id | Prioridad | Certificación | Estado | Cupo por slot |
| --- | --- | --- | --- | --- | --- |
| Salvador Lara | piloto_001 | 1 | Tándem APPI (`certificacion_tandem: true`) | activo | 1 |
| Farid (Muestra) | piloto_002 | 2 | En formación (`certificacion_tandem: false`) | demo_presentacion | 1 |
| Karla Guzman (Muestra) | piloto_003 | 3 | En formación (`certificacion_tandem: false`) | demo_presentacion | 1 |

## Demostración y seguridad

- Horarios únicos: 10:00, 12:00, 14:00 y 16:00.
- Cascada: el pasajero 1 del slot va con Salvador Lara, el 2 con Farid, el 3 con Karla Guzman. El cuarto queda bloqueado con el texto de slot saturado.
- Reinicio de demo: `DELETE /api/vuelos`, con sesión de administrador. Vacía las reservas y no modifica el directorio. El siguiente pasajero vuelve a Salvador Lara.
- Inspección móvil: checklist de arnés, casco, radio y paracaídas, más foto con `<input type="file" accept="image/*" capture="environment">`. Se guarda el nombre del archivo, no la imagen.
- Confirmación de reserva: pantalla de éxito en `/reservar` con WhatsApp al 2727258748.

## Rutas comerciales

- `/anturios`: Restaurante Campestre Anturios. Reunión y desayuno a las 09:00. Menú: picaditas preparadas, café de olla en jarrito de barro, huevos al gusto y pan dulce de horno.
- `/el-paraiso`: Palapa El Paraíso, zona de aterrizaje de las 12:15. Botanero de tacos de birria, consomé y michelada caguama. Precio de prueba de la michelada: $100 MXN.
- `/aliados`: oferta B2B de 30 días gratis. Condición: terminal Mercado Pago Point comprada y activada por el comercio. Al día 30 puede seguir o desconectarse sin penalización y conservar la terminal. `/afiliate` redirige aquí.
- `/experiencia-completa`: paquete Día Cumbre All-Inclusive, $2,950 MXN por persona. Salida 08:30, desayuno 09:00, subida 10:15, vuelo 10:45–12:00, aterrizaje 12:15, banquete 12:30, retorno 15:30.
- `/ordenar`: pedidos anticipados. Cobro con Mercado Pago Checkout Pro y aviso por WhatsApp al 2727258748. Precios de prueba: michelada $100, hot dog $30, taco $15.

## Economía vigente

- Cuota de red para el aliado durante los 30 días: $0 MXN.
- Margen de Basecamp sobre el cobro del aliado en ese periodo: $0. No hay un porcentaje de comisión en el código.
- El dinero del comercio se liquida en su cuenta de Mercado Pago. Basecamp no retiene esa caja.
