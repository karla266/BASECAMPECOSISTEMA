'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { trackConversionEvent } from '@/lib/analytics';

export type HeaderVariant = 'main' | 'store' | 'editorial' | 'admin';

interface UnifiedHeaderProps {
  variant?: HeaderVariant;
  transparentHero?: boolean;
  cartCount?: number;
}

const NAV_ITEMS: Record<HeaderVariant, Array<{ label: string; href: string }>> = {
  main: [
    { label: 'Parapente', href: '/vuelos' },
    { label: 'Día Cumbre', href: '/dia-cumbre' },
    { label: 'Renta', href: '/renta' },
    { label: 'Cursos APPI', href: '/cursos' },
    { label: 'The Trip Shop', href: '/the-trip' },
    { label: 'Ecosistema', href: '/ecosistema' },
  ],
  store: [
    { label: 'Catálogo The Trip', href: '/the-trip' },
    { label: 'Equipo Outdoor', href: '/renta' },
    { label: 'Alimentos Anturios', href: '/ordenar' },
    { label: 'Carrito y Pago', href: '/checkout' },
  ],
  editorial: [
    { label: 'Blog y Guías', href: '/blog' },
    { label: 'Movimiento Cannábico', href: '/movimiento-cannabico' },
    { label: 'Experiencias', href: '/vuelos' },
    { label: 'Ecosistema', href: '/ecosistema' },
  ],
  admin: [
    { label: 'Panel Principal', href: '/admin' },
    { label: 'Catálogo SICAR', href: '/admin/catalogo' },
    { label: 'Estudio Cámara', href: '/admin/camara' },
    { label: 'Pedidos y Reservas', href: '/admin/pedidos' },
  ],
};

export default function UnifiedHeader({
  variant,
  transparentHero = false,
  cartCount,
}: UnifiedHeaderProps) {
  const pathname = usePathname() || '/';
  const { totalCount } = useCart();
  const effectiveCount = typeof cartCount === 'number' ? cartCount : totalCount;

  const resolvedVariant: HeaderVariant =
    variant ||
    (pathname.startsWith('/admin')
      ? 'admin'
      : pathname.startsWith('/the-trip') || pathname.startsWith('/tienda') || pathname.startsWith('/checkout')
      ? 'store'
      : pathname.startsWith('/blog') || pathname.startsWith('/movimiento-cannabico')
      ? 'editorial'
      : 'main');

  const items = NAV_ITEMS[resolvedVariant];

  const containerClasses = transparentHero
    ? 'absolute top-0 left-0 w-full z-50 bg-transparent text-white'
    : 'sticky top-0 left-0 w-full z-50 bg-neutral-950/95 backdrop-blur-md text-white border-b border-neutral-800';

  return (
    <header className={`${containerClasses} px-6 py-4 transition-colors`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-extrabold text-xl tracking-wider uppercase">
          Basecamp 420
          {resolvedVariant === 'store' && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              The Trip
            </span>
          )}
          {resolvedVariant === 'admin' && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
              Admin
            </span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-emerald-400 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {resolvedVariant !== 'admin' ? (
            <>
              <Link
                href="/calendario"
                onClick={() => trackConversionEvent('cta_click', { target: '/calendario', source: 'header' })}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                Reservar Vuelo
              </Link>
              <Link
                href="/checkout"
                onClick={() => trackConversionEvent('cta_click', { target: '/checkout', source: 'header' })}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-colors"
              >
                Checkout {effectiveCount > 0 ? `(${effectiveCount})` : ''}
              </Link>
            </>
          ) : (
            <Link
              href="/"
              className="px-3 py-1.5 rounded text-xs font-medium bg-neutral-800 hover:bg-neutral-700"
            >
              Ver Sitio Público
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
