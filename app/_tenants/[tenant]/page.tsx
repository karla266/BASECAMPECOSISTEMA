export default function TenantPage({ params }: { params: { tenant: string } }) {
  // Aquí consultaríamos a https://api.basecamp420.com/api/tenant/{tenant} 
  // para obtener la configuración, la plantilla (smokeshop-dark, adventure-outdoor) y los productos.
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-3xl w-full text-center p-10 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-sm tracking-widest uppercase mb-6">
          Marca Aliada
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          {params.tenant}
        </h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          Este minisitio web es aprovisionado dinámicamente por la plataforma <br/>
          <strong className="text-blue-600">SaaS Multi-Tenant de Basecamp 420</strong>.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-400 block text-xs tracking-wider uppercase mb-1">Enrutamiento</span>
            <span className="text-slate-800 font-medium">Cloudflare for SaaS + Next.js Edge Middleware</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-400 block text-xs tracking-wider uppercase mb-1">Base de Datos</span>
            <span className="text-slate-800 font-medium">Aislada (stancl/tenancy)</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-400 block text-xs tracking-wider uppercase mb-1">Estado de Inquilino</span>
            <span className="text-emerald-600 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Activo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
