'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [area, setArea] = useState('Reservas de Vuelo y Cursos APPI');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Centro de Contacto y Soporte</h1>
        <p className="text-neutral-400 mt-1 text-sm">
          Selecciona el área correspondiente para recibir atención directa o comunícate por teléfono y correo oficial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 text-sm">
          <p className="font-bold text-white">Canales Directos</p>
          <p className="text-neutral-300">Tel: <a href="tel:+522727258748" className="text-emerald-400">272 725 8748</a></p>
          <p className="text-neutral-300">Correo: <a href="mailto:contacto@basecamp420.com" className="text-emerald-400">contacto@basecamp420.com</a></p>
          <p className="text-neutral-400 text-xs pt-2">Orizaba y Fortín de las Flores, Veracruz.</p>
        </div>

        <div className="md:col-span-2">
          {sent ? (
            <div className="p-6 rounded-2xl bg-neutral-900 border border-emerald-500/40 text-center">
              <p className="font-bold text-white text-lg">Mensaje Recibido</p>
              <p className="text-sm text-neutral-300 mt-1">
                Hemos canalizado tu solicitud al área de <strong>{area}</strong>. Te responderemos a {email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Área de Atención</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
                >
                  <option value="Reservas de Vuelo y Cursos APPI">Reservas de Vuelo y Cursos APPI ($30,000 MXN)</option>
                  <option value="Tienda The Trip Smoke Shop">Tienda The Trip Smoke Shop y Pedidos</option>
                  <option value="Renta de Equipo Outdoor">Renta de Equipo Outdoor y Garantías</option>
                  <option value="Alianzas B2B y Cima Digital">Alianzas B2B y Cima Digital</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
                  required
                />
                <input
                  type="email"
                  placeholder="Tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
                  required
                />
              </div>
              <textarea
                rows={3}
                placeholder="Detalles de tu consulta..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
              >
                Enviar Solicitud al Área
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
