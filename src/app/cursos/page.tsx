'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

type CourseOption = 'appi-deposit' | 'appi-full';

const COHORTS = [
  'Cohorte Mensual — Primer Lunes del Mes (Orizaba / Fortín)',
  'Cohorte Intensiva de Fin de Semana — Sábados y Domingos',
  'Cohorte Personalizada entre Semana — Previa Programación',
];

export default function CoursesAndExplorationPage() {
  const router = useRouter();
  const { addItem } = useCart();

  const [selectedOption, setSelectedOption] = useState<CourseOption>('appi-deposit');
  const [cohort, setCohort] = useState(COHORTS[0]);
  const [startDate, setStartDate] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentWeightKg, setStudentWeightKg] = useState<number>(70);
  const [errorMsg, setErrorMsg] = useState('');

  // Precio total oficial del Curso APPI: $30,000 MXN (Anticipo: $3,800 MXN)
  const unitPrice = selectedOption === 'appi-deposit' ? 3800 : 30000;

  const handleEnrollCourse = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentName.trim() || !studentEmail.trim() || !studentPhone.trim()) {
      setErrorMsg('Completa todos los datos de contacto del alumno para generar tu matrícula.');
      return;
    }
    if (!startDate) {
      setErrorMsg('Selecciona la fecha estimada de inicio para tu cohorte.');
      return;
    }

    const itemId = `COURSE-APPI-${selectedOption}-${startDate}`;

    addItem({
      id: itemId,
      sku: selectedOption === 'appi-deposit' ? 'APPI-ANTICIPO-3800' : 'APPI-TOTAL-30000',
      title:
        selectedOption === 'appi-deposit'
          ? `Curso Parapente APPI — Anticipo de Inscripción (${cohort})`
          : `Curso Parapente APPI — Liquidación Total $30,000 MXN (${cohort})`,
      unitPrice,
      quantity: 1,
      type: 'course',
      metadata: {
        flightDate: startDate,
        passengerName: `${studentName.trim()} | Tel: ${studentPhone.trim()} | Correo: ${studentEmail.trim()}`,
        passengerWeightKg: studentWeightKg,
        notes: `Cohorte: ${cohort} | Costo total del curso: $30,000 MXN`,
      },
    });

    router.push('/checkout');
  };

  return (
    <section className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Escuela de Vuelo Libre APPI y Experiencias de Exploración
        </h1>
        <p className="text-neutral-400">
          Inscríbete al curso oficial de piloto de parapente APPI ($30,000 MXN) o reserva tu vuelo de iniciación directamente en línea.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Experiencia de Iniciación
            </span>
            <h2 className="text-xl font-bold text-white mt-1">Vuelo Tándem Web</h2>
            <p className="text-3xl font-extrabold text-white mt-2">$1,600 MXN</p>
            <p className="text-sm text-neutral-400 mt-2">
              Vuelo biplaza con instructor certificado en el Valle de Fortín y Orizaba.
            </p>
          </div>
          <Link
            href="/calendario"
            className="mt-6 inline-block text-center w-full py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
          >
            Seleccionar Fecha en Calendario
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Iniciación Documentada
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Vuelo Tándem + Certificado Oficial
            </h2>
            <p className="text-3xl font-extrabold text-white mt-2">$2,800 MXN</p>
            <p className="text-sm text-neutral-400 mt-2">
              Incluye sesión previa de aerología básica, vuelo biplaza, paquete multimedia y certificado impreso.
            </p>
          </div>
          <Link
            href="/calendario"
            className="mt-6 inline-block text-center w-full py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
          >
            Reservar Vuelo con Certificado
          </Link>
        </div>
      </div>

      <form
        onSubmit={handleEnrollCourse}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6"
      >
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Formación Oficial de Pilotos
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Inscripción al Curso de Parapente APPI ($30,000 MXN)
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Asegura tu lugar en la próxima cohorte mediante pago de anticipo o liquidación completa en el checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSelectedOption('appi-deposit')}
            className={`p-5 rounded-xl border text-left transition-all ${
              selectedOption === 'appi-deposit'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-neutral-800 bg-neutral-950'
            }`}
          >
            <p className="font-bold text-white text-lg">Pagar Anticipo de Curso APPI</p>
            <p className="text-emerald-400 font-extrabold text-2xl mt-1">$3,800 MXN</p>
            <p className="text-xs text-neutral-400 mt-1">
              Bloquea tu lugar, manual teórico y asignación de equipo para tu cohorte (Costo total del curso: $30,000 MXN).
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedOption('appi-full')}
            className={`p-5 rounded-xl border text-left transition-all ${
              selectedOption === 'appi-full'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-neutral-800 bg-neutral-950'
            }`}
          >
            <p className="font-bold text-white text-lg">Liquidación Total Curso APPI</p>
            <p className="text-emerald-400 font-extrabold text-2xl mt-1">$30,000 MXN</p>
            <p className="text-xs text-neutral-400 mt-1">
              Cubre el programa completo de progresión teórica, prácticas de inflado, vuelos guiados por radio y bitácora APPI.
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-200 mb-2">
              Modalidad / Cohorte
            </label>
            <select
              value={cohort}
              onChange={(e) => setCohort(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white text-sm"
            >
              {COHORTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-200 mb-2">
              Fecha Preferente de Inicio
            </label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Nombre Completo del Alumno
            </label>
            <input
              type="text"
              placeholder="Nombre y apellidos"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Correo de Confirmación
            </label>
            <input
              type="email"
              placeholder="alumno@dominio.com"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Teléfono / Peso (kg)
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="272 000 0000"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                className="w-2/3 rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2.5 text-white text-sm"
                required
              />
              <input
                type="number"
                min={35}
                max={120}
                value={studentWeightKg}
                onChange={(e) => setStudentWeightKg(Number(e.target.value))}
                className="w-1/3 rounded-lg bg-neutral-950 border border-neutral-800 px-2 py-2.5 text-white text-sm text-center"
                required
              />
            </div>
          </div>
        </div>

        {errorMsg && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2.5">
            {errorMsg}
          </p>
        )}

        <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs text-neutral-400">Importe a cubrir en Checkout</p>
            <p className="text-2xl font-extrabold text-white">
              ${unitPrice.toLocaleString('es-MX')} MXN
            </p>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-colors"
          >
            Pagar Anticipo / Inscripción en Checkout
          </button>
        </div>
      </form>
    </section>
  );
}
