"use client";

import TemplateSelector from '../../components/admin/TemplateSelector';

export default function AdminTemplatesPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Selector de Plantillas</h1>
        <p className="text-slate-400 text-sm">Configura la identidad visual del tenant actual.</p>
      </div>
      <TemplateSelector />
    </>
  );
}
