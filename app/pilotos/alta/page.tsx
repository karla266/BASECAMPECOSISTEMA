'use client';

import React, { useState } from 'react';
import { trackConversionEvent } from '@/lib/analytics';

export default function PilotRegistrationPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [organization, setOrganization] = useState('APPI');
  const [CertificationLevel, setCertificationLevel] = useState('APPI 3 / Pilot');
  const [flightHours, setFlightHours] = useState<number>(100);
  const [gliderEquipment, setGliderEquipment] = useState('');
  const [baseCity, setBaseCity] = useState('Orizaba / Fortín');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [folio, setFolio] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegisterPilot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!privacyAccepted) {
      setErrorMsg('Debes aceptar la política de privacidad y verificación de licencias.');
      return;
    }

    try {
      const res = await fetch('/api/pilotos/alta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'basecamp_420',
        },
        body: JSON.stringify({
          fullName,
          phone,
          licenseNumber,
          organization,
          level: CertificationLevel,
          flightHours,
          gliderEquipment,
          baseCity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar piloto.');

      trackConversionEvent('pilot_registered', { folio: data.folio, organization });
      setFolio(data.folio);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  if (folio) {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16 text-center space-y-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
          Estado de Revisión: PENDIENTE
        </span>
        <h1 className="text-2xl font-extrabold text-white">
          Solicitud de Alta Registrada: {folio}
        </h1>
        <p className="text-sm text-neutral-300">
          Tu expediente técnico ha sido turnado al comité de seguridad de vuelo de Basecamp 420 para validación de licencia y equipo.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Padrón Operativo Interno
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">
          Registro Oficial de Pilotos e Instructores
        </h1>
        <p className="text-neutral-400 mt-1 text-sm">
          Formulario exclusivo para acreditación técnica de pilotos en el directorio de operaciones de Basecamp 420.
        </p>
      </div>

      <form
        onSubmit={handleRegisterPilot}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Nombre Completo del Piloto
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Teléfono de Contacto / Emergencias
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Organismo Certificador
            </label>
            <select
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
            >
              <option value="APPI">APPI</option>
              <option value="FALP">FALP</option>
              <option value="USHPA / FAI">USHPA / FAI</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Número de Licencia
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="Ej. APPI-12345"
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Nivel / Certificación
            </label>
            <input
              type="text"
              value={CertificationLevel}
              onChange={(e) => setCertificationLevel(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Horas de Vuelo Bitácora
            </label>
            <input
              type="number"
              min={10}
              value={flightHours}
              onChange={(e) => setFlightHours(Number(e.target.value))}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Equipo / Vela y Paracaídas Reserva
            </label>
            <input
              type="text"
              value={gliderEquipment}
              onChange={(e) => setGliderEquipment(e.target.value)}
              placeholder="Marca, modelo y homologación"
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Ciudad Base
            </label>
            <input
              type="text"
              value={baseCity}
              onChange={(e) => setBaseCity(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>
        </div>

        <label className="flex items-start gap-3 text-xs text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            className="mt-0.5 rounded border-neutral-700"
          />
          <span>
            Acepto el aviso de privacidad para resguardo de credenciales técnicas y verificación ante APPI/FALP.
          </span>
        </label>

        {errorMsg && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg p-2.5">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="px-8 py-3.5 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
        >
          Enviar Registro para Acreditación
        </button>
      </form>
    </section>
  );
}
