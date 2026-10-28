'use client'

import TemplateSelector from '@/app/components/admin/TemplateSelector'

export default function TemplatesPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-extrabold text-white mb-2">Selector de plantillas</h1>
      <p className="text-sm text-slate-400 mb-6">Elige la apariencia visual de la marca activa.</p>
      <TemplateSelector />
    </div>
  )
}
