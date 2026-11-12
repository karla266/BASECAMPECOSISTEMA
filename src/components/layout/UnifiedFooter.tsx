import React from 'react';
import Link from 'next/link';

export default function UnifiedFooter() {
  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-1 space-y-3">
          <p className="text-white font-extrabold text-lg tracking-wider uppercase">
            Basecamp 420
          </p>
          <p className="text-sm text-neutral-400">
            Comunidad de aventura, parapente, equipo outdoor y ecosistema comercial en Orizaba y Altas Montañas.
          </p>
          <div className="text-sm space-y-1 pt-2">
            <p>
              <strong className="text-white">Tel:</strong>{' '}
              <a href="tel:+522727258748" className="hover:text-emerald-400">
                272 725 8748
              </a>
            </p>
            <p>
              <strong className="text-white">Correo:</strong>{' '}
              <a href="mailto:contacto@basecamp420.com" className="hover:text-emerald-400">
                contacto@basecamp420.com
              </a>
            </p>
            <p>
              <strong className="text-white">Horario:</strong> Lun - Dom: 09:00 a 20:00 h
            </p>
            <p className="pt-1">
              <a
                href="https://maps.google.com/?q=Orizaba,Veracruz,Mexico"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline font-medium"
              >
                Ver ubicación en Mapa (Orizaba, Ver.)
              </a>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
            1. Comprar
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/the-trip" className="hover:text-white">Tienda The Trip</Link></li>
            <li><Link href="/checkout" className="hover:text-white">Carrito y Checkout</Link></li>
            <li><Link href="/calendario" className="hover:text-white">Reservas de Vuelo</Link></li>
            <li><Link href="/cursos" className="hover:text-white">Cursos APPI ($30,000 MXN)</Link></li>
            <li><Link href="/ordenar" className="hover:text-white">Ordenar Alimentos</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
            2. Descubrir
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/vuelos" className="hover:text-white">Vuelos en Parapente</Link></li>
            <li><Link href="/renta" className="hover:text-white">Renta de Equipo Outdoor</Link></li>
            <li><Link href="/anturios" className="hover:text-white">Restaurante Anturios</Link></li>
            <li><Link href="/palapa-el-paraiso" className="hover:text-white">Palapa El Paraíso</Link></li>
            <li><Link href="/dia-cumbre" className="hover:text-white">Experiencia Día Cumbre</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
            3. Ecosistema
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/ecosistema" className="hover:text-white">Holding Basecamp 420</Link></li>
            <li><Link href="/the-trip" className="hover:text-white">The Trip Smoke Shop</Link></li>
            <li><Link href="/movimiento-cannabico" className="hover:text-white">Movimiento Cannábico Orizaba</Link></li>
            <li><Link href="/cima-digital" className="hover:text-white">Cima Digital (IA & B2B)</Link></li>
            <li><Link href="/alianzas" className="hover:text-white">Convenios y Empresas</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog Editorial</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
            4. Confianza
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/acerca-de" className="hover:text-white">Acerca de Nosotros</Link></li>
            <li><Link href="/contacto" className="hover:text-white">Formulario de Contacto</Link></li>
            <li><Link href="/legal" className="hover:text-white">Aviso de Privacidad y Legal</Link></li>
            <li><Link href="/terminos" className="hover:text-white">Términos por Operación y Clima</Link></li>
            <li><Link href="/pilotos/alta" className="hover:text-white">Registro Oficial de Pilotos</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-900 py-6 px-6 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} BASECAMP 420 S. de R.L. Todos los derechos reservados. Pagos procesados de forma segura en Checkout con Mercado Pago.
      </div>
    </footer>
  );
}
