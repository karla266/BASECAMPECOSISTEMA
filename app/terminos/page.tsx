import React from 'react';

export default function TerminosPage() {
  const sections = [
    {
      title: '1. Comercio de Productos Físicos (The Trip Smoke Shop)',
      content:
        'Venta exclusiva para mayores de 18 años con verificación obligatoria de mayoría de edad. Precios expresados en MXN con IVA incluido. En productos bajo modalidad Preventa 2x, el tiempo de despacho se apega a la fecha de corte quincenal.',
    },
    {
      title: '2. Reservas de Vuelo en Parapente Tándem',
      content:
        'El despegue depende de condiciones seguras de viento y visibilidad en montaña. Si el piloto titular o el director de rampa determina clima no apto, el vuelo se reprograma sin penalización para el pasajero.',
    },
    {
      title: '3. Cursos de Parapente APPI ($30,000 MXN)',
      content:
        'El costo total del programa oficial APPI es de $30,000 MXN. El anticipo de $3,800 MXN bloquea cupo en la cohorte seleccionada, manual teórico y asignación de equipo escuela.',
    },
    {
      title: '4. Renta de Equipo Outdoor Serializado',
      content:
        'Cada activo cuenta con código QR y número de serie. Requiere checklist fotográfico en Check-Out y Check-In, así como depósito en garantía reembolsable tras verificar la integridad del equipo.',
    },
    {
      title: '5. Pre-Orden de Alimentos (Anturios y Palapa El Paraíso)',
      content:
        'Las órdenes pagadas en checkout se preparan para la fecha, hora y punto de servicio seleccionados por el cliente.',
    },
    {
      title: '6. Alianzas Comerciales y Servicios B2B (Cima Digital)',
      content:
        'Los anticipos de diagnóstico tecnológico o bloqueo de eventos corporativos se bonifican al contrato definitivo conforme al folio emitido por el sistema.',
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-white">
        Términos y Condiciones Separados por Tipo de Operación
      </h1>
      <div className="space-y-4">
        {sections.map((sec) => (
          <div key={sec.title} className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-lg font-bold text-white">{sec.title}</h2>
            <p className="text-sm text-neutral-300 mt-2">{sec.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
