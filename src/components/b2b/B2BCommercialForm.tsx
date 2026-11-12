'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface B2BCommercialFormProps {
  unitMode: 'cima-digital' | 'alianzas';
}

export default function B2BCommercialForm({ unitMode }: B2BCommercialFormProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [businessSector, setBusinessSector] = useState(
    unitMode === 'cima-digital' ? 'Retail / Punto de Venta' : 'Empresa / Corporativo'
  );
  const [partnershipType, setPartnershipType] = useState(
    unitMode === 'cima-digital'
      ? 'Automatización y Agentes de IA'
      : 'Convenio Corporativo / Grupo Día Cumbre'
  );
  const [peopleCount, setPeopleCount] = useState<number>(10);
  const [targetDate, setTargetDate] = useState('');
  const [budgetRange, setBudgetRange] = useState('$15,000 - $35,000 MXN');
  const [objective, setObjective] = useState('');
  const [includePaidDiagnosis, setIncludePaidDiagnosis] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [confirmationFolio, setConfirmationFolio] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/b2b/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'basecamp_420',
        },
        body: JSON.stringify({
          unitMode,
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          businessSector,
          partnershipType,
          peopleCount,
          targetDate,
          budgetRange,
          objective: objective.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo procesar el registro comercial.');
      }

      if (includePaidDiagnosis) {
        addItem({
          id: `B2B-DIAG-${data.folio}`,
          sku: unitMode === 'cima-digital' ? 'CIMA-DIAG-1500' : 'ALIANZA-ANTICIPO-2500',
          title:
            unitMode === 'cima-digital'
              ? `Sesión de Diagnóstico y Arquitectura IA — Cima Digital (${companyName.trim()})`
              : `Anticipo de Bloqueo Grupal / Convenio B2B (${companyName.trim()})`,
          unitPrice: unitMode === 'cima-digital' ? 1500 : 2500,
          quantity: 1,
          type: 'product',
          metadata: {
            deliveryDate: targetDate,
            notes: `Folio B2B: ${data.folio} | Personas: ${peopleCount} | Presupuesto: ${budgetRange}`,
          },
        });
        router.push('/checkout');
        return;
      }

      setConfirmationFolio(data.folio);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationFolio) {
    return (
      <div className="bg-neutral-900 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
          Solicitud B2B Registrada
        </span>
        <h3 className="text-2xl font-extrabold text-white">
          Folio de Seguimiento: {confirmationFolio}
        </h3>
        <p className="text-sm text-neutral-300 max-w-xl mx-auto">
          Hemos registrado los datos de <strong>{companyName}</strong>. Recibirás en{' '}
          <strong>{contactEmail}</strong> la propuesta técnica y operativa correspondiente.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Empresa o Razón Social
          </label>
          <input
            type="text"
            placeholder="Nombre de la empresa o comercio"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Nombre del Contacto Responsable
          </label>
          <input
            type="text"
            placeholder="Nombre y cargo"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Correo Corporativo
          </label>
          <input
            type="email"
            placeholder="contacto@empresa.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Teléfono Directo
          </label>
          <input
            type="tel"
            placeholder="272 000 0000"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Giro Comercial
          </label>
          <select
            value={businessSector}
            onChange={(e) => setBusinessSector(e.target.value)}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
          >
            <option value="Retail / Punto de Venta">Retail / Punto de Venta</option>
            <option value="Smoke Shop / Vitrina Aliada">Smoke Shop / Vitrina Aliada</option>
            <option value="Hotel / Turismo / Agencia">Hotel / Turismo / Agencia</option>
            <option value="Empresa / Corporativo">Empresa / Corporativo</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Modalidad de Servicio o Alianza
          </label>
          <select
            value={partnershipType}
            onChange={(e) => setPartnershipType(e.target.value)}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
          >
            {unitMode === 'cima-digital' ? (
              <>
                <option value="Automatización y Agentes de IA">
                  Automatización de Procesos y Agentes de IA
                </option>
                <option value="Terminales POS Offline y Sincronización SICAR">
                  Terminales Offline y Sincronización de Inventarios
                </option>
                <option value="Reportes Ejecutivos y E-Commerce de Conversión">
                  Reportes Ejecutivos y Arquitectura Web de Conversión
                </option>
              </>
            ) : (
              <>
                <option value="Convenio Corporativo / Grupo Día Cumbre">
                  Experiencia Corporativa / Grupo Día Cumbre
                </option>
                <option value="Vitrina en Consignación / Distribución Mayorista">
                  Vitrina en Consignación / Abastecimiento Mayorista B2B
                </option>
                <option value="Alianza Turística / Comisiones por Reserva">
                  Alianza para Hoteles y Operadores Turísticos
                </option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Número de Personas / Terminales
          </label>
          <input
            type="number"
            min={1}
            max={500}
            value={peopleCount}
            onChange={(e) => setPeopleCount(Number(e.target.value))}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Fecha Estimada de Implementación / Evento
          </label>
          <input
            type="date"
            value={targetDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Presupuesto Estimado
          </label>
          <select
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
          >
            <option value="$5,000 - $15,000 MXN">$5,000 - $15,000 MXN</option>
            <option value="$15,000 - $35,000 MXN">$15,000 - $35,000 MXN</option>
            <option value="$35,000 - $80,000 MXN">$35,000 - $80,000 MXN</option>
            <option value="Más de $80,000 MXN">Más de $80,000 MXN</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
          Objetivo del Proyecto, Convenio o Evento
        </label>
        <textarea
          rows={3}
          placeholder="Describe brevemente el alcance esperado, requerimientos operativos o metas de tu empresa..."
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
          required
        />
      </div>

      <label className="flex items-start gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
        <input
          type="checkbox"
          checked={includePaidDiagnosis}
          onChange={(e) => setIncludePaidDiagnosis(e.target.checked)}
          className="mt-1 rounded border-neutral-700"
        />
        <div className="text-sm">
          <p className="font-bold text-white">
            {unitMode === 'cima-digital'
              ? 'Agendar Diagnóstico Técnico Prioritario en Checkout ($1,500 MXN bonificables al proyecto)'
              : 'Bloquear Fecha Corporativa / Vitrina con Anticipo en Checkout ($2,500 MXN)'}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Si prefieres enviar únicamente la solicitud para evaluación comercial sin pago inicial, deja esta casilla desmarcada.
          </p>
        </div>
      </label>

      {errorMsg && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2">
          {errorMsg}
        </p>
      )}

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-colors disabled:opacity-50"
        >
          {submitting
            ? 'Procesando...'
            : includePaidDiagnosis
            ? 'Registrar y Pagar Anticipo en Checkout'
            : 'Agendar Diagnóstico / Solicitar Convenio'}
        </button>
      </div>
    </form>
  );
}
