import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-6 text-white">
      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Basecamp 420 • Orizaba</span>
      <h1 className="text-3xl font-extrabold capitalize">cursos</h1>
      <p className="text-neutral-300 text-sm max-w-xl">
        Módulo oficial activo en el ecosistema de producción. Consulta disponibilidad o realiza tu pago seguro en el checkout unificado.
      </p>
      <div className="flex gap-4 pt-2">
        <Link href="/checkout" className="px-6 py-3 rounded-xl font-bold bg-emerald-500 text-neutral-950">Ir al Checkout</Link>
        <Link href="/calendario" className="px-6 py-3 rounded-xl font-bold bg-neutral-800 text-white">Ver Calendario</Link>
      </div>
    </main>
  );
}