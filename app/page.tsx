import Link from 'next/link';
import { MountainSnow, ShoppingBag, Globe, Users, Play, ArrowRight, CheckCircle2, ShieldCheck, Award, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MountainSnow className="w-8 h-8 text-emerald-400" />
            <span className="font-extrabold text-xl tracking-widest text-white">BASECAMP 420</span>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-sm uppercase tracking-wider ml-2">
              Matriz
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
            <Link href="/adventure" className="hover:text-emerald-400 transition-colors">Adventure</Link>
            <Link href="/thetrip" className="hover:text-emerald-400 transition-colors">The Trip</Link>
            <Link href="/cimadigital" className="hover:text-emerald-400 transition-colors">Cima Digital</Link>
            <Link href="/trepacerros" className="hover:text-emerald-400 transition-colors">Club Trepacerros</Link>
          </div>
          <Link href="/admin" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-md font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
            Unirse a la Red
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Ecosistema Hub <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              Multi-Tenant & E-Commerce
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Plataforma B2B SaaS de alto rendimiento para marcas de deportes extremos, estilo de vida alternativo y agencias digitales. Aprovisionamiento instantáneo con IA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2">
              Explorar Tours <MountainSnow className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto bg-slate-900 border border-slate-700 hover:border-slate-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2">
              Ver Smokeshop <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        </div>
      </section>

      {/* UNIDADES DE NEGOCIO MATRIZ */}
      <section className="py-20 px-6 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Unidades de Negocio Estratégicas</h2>
            <p className="text-slate-400">Nuestras operaciones core impulsadas por tecnología compartida.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UnitCard title="Basecamp Adventure" icon={<MountainSnow />} desc="Tours de alta montaña y parapente extremo." color="emerald" />
            <UnitCard title="The Trip Smokeshop" icon={<ShoppingBag />} desc="Parafernalia legal, bongs y pipas pyrex." color="emerald" />
            <UnitCard title="Cima Digital" icon={<Globe />} desc="Agencia web B2B y publicidad aérea en velas." color="cyan" />
            <UnitCard title="Papelería Madera" icon={<Users />} desc="40 años de tradición retail operando en el cloud." color="emerald" />
          </div>
        </div>
      </section>

      {/* RESPALDO SOCIAL & AUTORIDAD */}
      <section className="py-24 px-6 bg-slate-900/50 border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 mb-6">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Comunidad Activa</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
              Respaldado por el <span className="text-emerald-400">Club Trepacerros</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Más de 130 videos de expediciones documentadas en YouTube, formando un embudo de retención masivo para nuestra unidad Adventure y E-Commerce.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Metric value="33+" label="Años Parapente" icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} />
              <Metric value="40+" label="Años Papelería" icon={<Award className="w-5 h-5 text-emerald-400" />} />
              <Metric value="5+" label="Años Cloud SaaS" icon={<Globe className="w-5 h-5 text-emerald-400" />} />
            </div>
          </div>
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group cursor-pointer shadow-2xl">
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
              </div>
            </div>
            {/* Fallback image representing video */}
            <img src="https://picsum.photos/seed/mountain_climb/800/450" alt="Club Trepacerros YouTube" className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
          </div>
        </div>
      </section>

      {/* DIRECTORIO MARCAS ALIADAS */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Marcas Aliadas en el Hub</h2>
              <p className="text-slate-400">Inquilinos B2B utilizando nuestra infraestructura SaaS y motor omnicanal.</p>
            </div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
              Ver panel de control <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TenantCard name="Parapentitis" url="parapentitis.basecamp420.com" status="Activo" />
            <TenantCard name="Fisiozom" url="fisiozom.basecamp420.com" status="Activo" />
            <TenantCard name="Devolada" url="devolada.basecamp420.com" status="Configurando" />
          </div>
        </div>
      </section>
    </div>
  );
}

function UnitCard({ title, icon, desc, color }: { title: string, icon: React.ReactNode, desc: string, color: 'emerald' | 'cyan' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:-translate-y-2 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all duration-300 group cursor-pointer">
      <div className={`w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-${color}-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function Metric({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-3xl font-extrabold text-white">{value}</span>
      </div>
      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function TenantCard({ name, url, status }: { name: string, url: string, status: string }) {
  const isActive = status === 'Activo';
  return (
    <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between group hover:bg-slate-900 transition-colors cursor-pointer">
      <div>
        <h4 className="font-bold text-white text-lg">{name}</h4>
        <p className="text-xs text-slate-500 mt-1 font-mono">{url}</p>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
        {isActive && <CheckCircle2 className="w-3 h-3" />}
        {status}
      </div>
    </div>
  );
}
