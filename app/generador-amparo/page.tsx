'use client';

import React, { useState } from 'react';

export default function GeneradorLegalPage() {
  const [tipoDocumento, setTipoDocumento] = useState<'escrito_libre' | 'demanda_amparo'>('escrito_libre');
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    curp: '',
    rfc: '',
    calleNumero: '',
    colonia: '',
    municipio: 'Orizaba',
    estado: 'Veracruz',
    codigoPostal: '94300',
    correo: '',
    telefono: '2727258748',
    fechaSolicitud: new Date().toISOString().split('T')[0],
  });

  const [documentoGenerado, setDocumentoGenerado] = useState('');
  const [copiado, setCopiado] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generarDocumento = (e: React.FormEvent) => {
    e.preventDefault();

    if (tipoDocumento === 'escrito_libre') {
      const texto = `COMISIÓN FEDERAL PARA LA PROTECCIÓN CONTRA RIESGOS SANITARIOS (COFEPRIS)
DIRECCIÓN INTEGRAL DE SERVICIOS / VENTANILLA DE TRÁMITES
PRESENTE.

ASUNTO: SOLICITUD DE AUTORIZACIÓN SANITARIA PARA EL EJERCICIO DEL DERECHO HUMANO AL LIBRE DESARROLLO DE LA PERSONALIDAD (CONSUMO PERSONAL, SIEMBRA, CULTIVO Y COSECHA DE CANNABIS).

C. ${formData.nombreCompleto.toUpperCase()}, mexicano(a), mayor de edad, promoviendo por mi propio derecho, señalando con CURP: ${formData.curp.toUpperCase()} y RFC: ${formData.rfc.toUpperCase()}; señalando como domicilio para oír y recibir toda clase de notificaciones el ubicado en: Calle ${formData.calleNumero}, Colonia ${formData.colonia}, Municipio de ${formData.municipio}, Estado de ${formData.estado}, C.P. ${formData.codigoPostal}; autorizando para tales efectos el correo electrónico ${formData.correo} y teléfono ${formData.telefono}, ante usted comparezco con el debido respeto para exponer:

Con fundamento en los artículos 1°, 4° párrafo cuarto, 6° y 8° de la Constitución Política de los Estados Unidos Mexicanos; así como en la Jurisprudencia por reiteración emitida por la Primera Sala de la Suprema Corte de Justicia de la Nación (derivada de los Amparos en Revisión 237/2014, 1115/2017 y subsecuentes), solicito formalmente:

ÚNICO.- Se me expida y otorgue AUTORIZACIÓN SANITARIA para el autoconsumo personal, lúdico y recreativo de cannabis (psicoactivo), así como para la adquisición de semillas, siembra, cultivo, cosecha, preparación, acondicionamiento y transportación, exclusivamente para mi uso personal y sin ningún fin de distribución, comercio o suministro a terceros.

Se precisa que esta petición se ampara en el estricto apego al principio pro persona y al libre desarrollo de la personalidad salvaguardado por el Poder Judicial de la Federación.

PROTESTO LO NECESARIO EN DERECHO.
En la Ciudad de ${formData.municipio}, ${formData.estado}, a ${formData.fechaSolicitud}.

_________________________________________________
${formData.nombreCompleto.toUpperCase()}
Firma del Solicitante`;
      setDocumentoGenerado(texto);
    } else {
      const texto = `C. JUEZ DE DISTRITO EN MATERIA ADMINISTRATIVA EN TURNO DEL ESTADO DE VERACRUZ.
PRESENTE.

QUEJOSO(A): ${formData.nombreCompleto.toUpperCase()}
CURP: ${formData.curp.toUpperCase()}
ASUNTO: DEMANDA DE JUICIO DE AMPARO INDIRECTO

C. ${formData.nombreCompleto.toUpperCase()}, por mi propio derecho, con domicilio procesal en Calle ${formData.calleNumero}, Col. ${formData.colonia}, ${formData.municipio}, ${formData.estado}, C.P. ${formData.codigoPostal}, comparezco a demandar el AMPARO Y PROTECCIÓN DE LA JUSTICIA FEDERAL contra los actos y autoridades que a continuación señalo:

I. AUTORIDADES RESPONSABLES:
1. Titular de la Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS).
2. Dirección Ejecutiva de Regulación de Estupefacientes, Psicotrópicos y Sustancias Químicas de la COFEPRIS.

II. ACTO RECLAMADO:
La omisión de dar respuesta en tiempo y forma (negativa tácita o negativa ficta) a la solicitud formal de autorización sanitaria presentada el día ${formData.fechaSolicitud}, vulnerando con ello el Derecho de Petición tutelado por el Artículo 8° Constitucional y el Derecho al Libre Desarrollo de la Personalidad tutelado por los Artículos 1° y 4° Constitucionales.

III. PRECEPTOS CONSTITUCIONALES VIOLADOS:
Artículos 1°, 4°, 8° y 16 de la Constitución Política de los Estados Unidos Mexicanos.

IV. JURISPRUDENCIA APLICABLE:
Resulta de obligatoria observancia la Jurisprudencia 1a./J. 8/2019 (10a.) de rubro: "INCONSTITUCIONALIDAD DE LA PROHIBICIÓN ABSOLUTA AL AUTOCONSUMO LÚDICO DE CANNABIS", emitida por la Primera Sala de la Suprema Corte de Justicia de la Nación.

POR LO EXPUESTO, PIDO:
PRIMERO.- Tenerme por presentado(a) demandando el amparo y protección de la Justicia de la Unión.
SEGUNDO.- Requerir a las autoridades responsables su informe justificado.
TERCERO.- Dictar sentencia concediendo el amparo para los efectos solicitados.

PROTESTO LO NECESARIO.
${formData.municipio}, ${formData.estado}, a ${formData.fechaSolicitud}.

_________________________________________________
${formData.nombreCompleto.toUpperCase()}`;
      setDocumentoGenerado(texto);
    }
  };

  const copiarPortapapeles = () => {
    navigator.clipboard.writeText(documentoGenerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const descargarArchivo = () => {
    const blob = new Blob([documentoGenerado], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tipoDocumento}_${formData.nombreCompleto.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 font-bold">
            LegalTech · Basecamp 420 A.C.
          </span>
          <h1 className="text-3xl md:text-4xl font-black mt-3">
            Generador de Escrito Libre y Demanda de Amparo
          </h1>
          <p className="text-neutral-400 text-sm mt-2">
            Genera gratis tus documentos jurídicos fundamentados ante COFEPRIS y el Poder Judicial de la Federación.
          </p>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => {
              setTipoDocumento('escrito_libre');
              setDocumentoGenerado('');
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border transition ${
              tipoDocumento === 'escrito_libre'
                ? 'bg-emerald-500 text-black border-emerald-400'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            1. Escrito Libre Inicial (COFEPRIS)
          </button>
          <button
            type="button"
            onClick={() => {
              setTipoDocumento('demanda_amparo');
              setDocumentoGenerado('');
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border transition ${
              tipoDocumento === 'demanda_amparo'
                ? 'bg-emerald-500 text-black border-emerald-400'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            2. Demanda de Amparo Indirecto (PJF)
          </button>
        </div>

        <form onSubmit={generarDocumento} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="nombreCompleto"
                required
                value={formData.nombreCompleto}
                onChange={handleChange}
                placeholder="Nombre(s) y Apellidos"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">CURP</label>
              <input
                type="text"
                name="curp"
                required
                maxLength={18}
                value={formData.curp}
                onChange={handleChange}
                placeholder="18 caracteres"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">RFC</label>
              <input
                type="text"
                name="rfc"
                required
                value={formData.rfc}
                onChange={handleChange}
                placeholder="Con homoclave"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Calle y Número</label>
              <input
                type="text"
                name="calleNumero"
                required
                value={formData.calleNumero}
                onChange={handleChange}
                placeholder="Av. Principal #123"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Colonia</label>
              <input
                type="text"
                name="colonia"
                required
                value={formData.colonia}
                onChange={handleChange}
                placeholder="Centro"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Código Postal</label>
              <input
                type="text"
                name="codigoPostal"
                required
                value={formData.codigoPostal}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Correo Electrónico para Notificaciones</label>
              <input
                type="email"
                name="correo"
                required
                value={formData.correo}
                onChange={handleChange}
                placeholder="tu@correo.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                required
                value={formData.telefono}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3 rounded-xl text-sm transition shadow-lg"
          >
            Generar {tipoDocumento === 'escrito_libre' ? 'Escrito Libre COFEPRIS' : 'Demanda de Amparo'}
          </button>
        </form>

        {documentoGenerado && (
          <div className="mt-8 pt-6 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
                Documento Listo para Imprimir
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copiarPortapapeles}
                  className="bg-neutral-800 hover:bg-neutral-700 text-xs px-3 py-1.5 rounded-lg border border-neutral-700 transition"
                >
                  {copiado ? '✓ Copiado' : 'Copiar Texto'}
                </button>
                <button
                  type="button"
                  onClick={descargarArchivo}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-3 py-1.5 rounded-lg transition"
                >
                  Descargar (.txt)
                </button>
              </div>
            </div>

            <pre className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
              {documentoGenerado}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}