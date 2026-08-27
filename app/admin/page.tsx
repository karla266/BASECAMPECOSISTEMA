import DashboardLayout from '../components/admin/DashboardLayout';
import TemplateSelector from '../components/admin/TemplateSelector';
import { DollarSign, PhoneCall, Box, ArrowUpRight } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Resumen General</h1>
          <p className="text-slate-400 text-sm">Control centralizado del ecosistema Basecamp 420 y marcas aliadas.</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-700">
          Exportar PDF <ArrowUpRight className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ventas del Mes</h3>
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <span className="text-4xl font-extrabold text-white">$42,500</span>
          <div className="mt-2 text-sm text-emerald-400 font-semibold">+12.5% vs mes anterior</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Clientes Voz IA</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <PhoneCall className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <span className="text-4xl font-extrabold text-white">1,248</span>
          <div className="mt-2 text-sm text-blue-400 font-semibold">+5.2% leads calificados</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Stock Sincronizado</h3>
            <div className="p-2 bg-fuchsia-500/10 rounded-lg border border-fuchsia-500/20">
              <Box className="w-5 h-5 text-fuchsia-400" />
            </div>
          </div>
          <span className="text-4xl font-extrabold text-white">8,402</span>
          <div className="mt-2 text-sm text-fuchsia-400 font-semibold">SICAR & Mercado Libre (24h)</div>
        </div>
      </div>

      {/* TEMPLATE SELECTOR */}
      <div className="mb-10">
        <TemplateSelector />
      </div>

    </DashboardLayout>
  );
}
