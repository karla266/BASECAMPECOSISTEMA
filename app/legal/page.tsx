import React from 'react';
import Link from 'next/link';

export default function LegalPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 space-y-6 text-sm text-neutral-300">
      <h1 className="text-3xl font-extrabold text-white">
        Aviso de Privacidad, Protección de Datos y Marco Legal
      </h1>
      <p>
        <strong>BASECAMP 420 S. de R.L.</strong>, con domicilio operativo en Orizaba, Veracruz, México, es responsable del tratamiento confidencial de los datos personales recabados en <strong>www.basecamp420.com</strong>.
      </p>
      <div className="space-y-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white">1. Tratamiento de Datos y Pagos</h2>
        <p>
          Los datos de contacto, peso operativo para vuelos tándem, matrículas de cursos APPI y registros B2B se utilizan exclusivamente para la ejecución segura del servicio contratado. Los pagos en línea se procesan de manera cifrada a través de Mercado Pago Checkout Pro sin almacenar datos sensibles de tarjetas en nuestros servidores.
        </p>
        <h2 className="text-lg font-bold text-white">2. Condiciones Meteorológicas y Seguridad</h2>
        <p>
          Toda actividad aérea y de alta montaña se rige bajo protocolos estrictos de seguridad meteorológica. Consulta el desglose completo por unidad operativa en nuestra página de{' '}
          <Link href="/terminos" className="text-emerald-400 underline">
            Términos y Condiciones por Operación
          </Link>.
        </p>
      </div>
    </section>
  );
}
