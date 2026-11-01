# Respuestas rápidas de WhatsApp

Conmutador: 2727258748.
Uso: el equipo de mostrador escribe el atajo y pega la respuesta en un clic.
Generado: 2026-11-01T02:36:14.391Z.

## /diacumbre

Intención: `consultar_dia_cumbre`.
Disparadores: dia cumbre, día cumbre, all inclusive, all-inclusive, 2950, paquete completo, sprinter.

```
Día Cumbre All-Inclusive: $2950 MXN por persona.
08:30 salida de la Sprinter en Orizaba (Oriente 27 y Norte 10).
09:00 picaditas en Restaurante Campestre Anturios.
10:45 vuelo tándem.
12:30 birria y caguama en Palapa El Paraíso.
15:30 retorno en Sprinter a Orizaba.
Reservas por este WhatsApp, 2727258748.
```

## /vuelo

Intención: `consultar_vuelo`.
Disparadores: vuelo, parapente, tandem, tándem, horario, slot, salvador, anticipo, 10:00, 12:00, 14:00, 16:00.

```
Vuelo tándem. Anticipo por Mercado Pago: $1600 MXN. Referencia de canje o total: $2800 MXN.
Slots: 10:00, 12:00, 14:00, 16:00.
Piloto líder: Salvador Lara, certificación tándem APPI, prioridad 1.
Si su lugar ya está tomado, la cascada sigue así: 1. Salvador Lara; 2. Farid (Muestra); 3. Karla Guzman (Muestra). El cuarto pasajero del mismo slot queda saturado.
Reserva en https://www.basecamp420.com/reservar o por este WhatsApp.
```

## /paraiso

Intención: `consultar_paraiso`.
Disparadores: paraiso, paraíso, palapa, aterrizaje, michelada, birria, taco, hot dog, acompanante, acompañante.

```
Palapa El Paraíso es la zona de aterrizaje. Los acompañantes esperan ahí el mediodía, con micheladas y tacos.
El aterrizaje del Día Cumbre es a las 12:15 y el banquete a las 12:30: tacos de birria, consomé y Michelada Caguama.
Precios de prueba: Michelada Caguama $100 MXN, Hot Dog Clásico $30 MXN, Taco Tradicional $15 MXN.
El punto exacto del día se confirma por este WhatsApp. Pedido anticipado: https://www.basecamp420.com/ordenar
```

## /anturios

Intención: `consultar_anturios`.
Disparadores: anturios, desayuno, picaditas, cafe de olla, café de olla, pan dulce, check-in, 09:00.

```
Restaurante Campestre Anturios: desayuno montañero y check-in de la mañana.
Punto de check-in oficial de la mañana para los vuelos de Basecamp 420. La Sprinter sale de Orizaba a las 08:30 y el desayuno en Anturios es a las 09:00.
Menú: Orden de 3 picaditas preparadas, Café de olla en jarrito de barro, Huevos al gusto, Pan dulce de horno.
Para ordenar el desayuno o reservar mesa de grupo, escribe por este WhatsApp.
```

## /aliados

Intención: `consultar_aliados`.
Disparadores: aliados, afiliate, afiliación, 30 dias, 30 días, terminal, point, comision, comisión, b2b.

```
Red de comercios Basecamp 420: 30 días de prueba gratuita.
Comisión de Basecamp en ese periodo: $0 MXN. No hay comisión oculta.
Requisito: comprar y activar tu propia terminal Mercado Pago Point. La terminal es tuya y el dinero entra a tu cuenta.
Al día 30 decides. Si no renuevas, te quedas con la terminal y te desconectamos sin penalización.
Alta: https://www.basecamp420.com/aliados
```

## /pagos

Intención: `consultar_pagos`.
Disparadores: pago, pagos, mercadopago, mercado pago, anticipo, tarjeta, transferencia.

```
El anticipo del vuelo se cobra en Mercado Pago: $1600 MXN. La referencia de total o canje es $2800 MXN.
Día Cumbre: $2950 MXN por persona.
Palapa, precios de prueba: michelada $100, hot dog $30, taco $15.
Cuando Mercado Pago marca el pedido de comida como aprobado, el aviso llega al WhatsApp que dejaste en el checkout.
Dudas de pago: 2727258748.
```

## /thetrip

Intención: `consultar_the_trip`.
Disparadores: the trip, smoke shop, cristaleria, cristalería, vaporizador, lifestyle.

```
🌿 *The Trip Smoke Shop*

Eleva tu experiencia. Somos la smoke shop oficial del ecosistema Basecamp 420.
Contamos con catálogo completo de cristalería, vaporizadores, accesorios y lifestyle cannábico.
👉 Conoce nuestro catálogo o pide existencias por este chat.
```

## /cimadigital

Intención: `consultar_cima_digital`.
Disparadores: cima digital, software, inteligencia artificial, automatizacion, automatización, factoria, factoría.

```
💻 *Cima Digital — Factoría de Software e Inteligencia Artificial*

¿Te gusta cómo opera la automatización, conmutadores y reservas de Basecamp 420? Cima Digital lo diseñó y construyó.
Desarrollamos soluciones de software a la medida, automatización con agentes de IA y e-commerce de alta conversión para escalar empresas.
👉 Agenda una consultoría con nuestro equipo técnico.
```

## Cómo enruta el banco

`data/faqs_whatsapp.json` trae tres índices:

- `porAtajo`: el texto que escribe el mostrador, por ejemplo `/vuelo`.
- `porIntent`: el nombre estable para un webhook.
- `porKeyword`: palabras normalizadas, sin acentos, hacia uno o más identificadores de respuesta.

Si una frase trae varias palabras, el conmutador gana con la primera coincidencia de `porKeyword`. Si no hay coincidencia, responde una persona.
