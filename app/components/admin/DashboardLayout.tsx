"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FileUp, 
  LayoutTemplate, 
  Mic, 
  Share2, 
  Settings, 
  MountainSnow, 
  ChevronDown, 
  Activity,
  LogOut,
  Check
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const [activeTenant, setActiveTenant] = useState('Grupo Basecamp');

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* SIDEBAR LATERAL */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-900/50">
          <MountainSnow className="w-6 h-6 text-emerald-400 mr-3" />
          <span className="font-extrabold text-base text-white tracking-widest uppercase">Basecamp 420</span>
        </div>
        
        <div className="px-4 py-6 overflow-y-auto flex-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 block px-3">Gestión Matriz</span>
          <nav className="space-y-1 mb-8">
            <NavItem href="/admin" icon={<LayoutDashboard size={18} />} label="Resumen General" active={pathname === '/admin'} />
            <NavItem href="/admin/products" icon={<Package size={18} />} label="Catálogo / Productos" active={pathname === '/admin/products'} />
            <NavItem href="/admin/csv" icon={<FileUp size={18} />} label="Carga CSV" active={pathname === '/admin/csv'} />
            <NavItem href="/admin/templates" icon={<LayoutTemplate size={18} />} label="Selector de Plantillas" active={pathname === '/admin/templates'} />
          </nav>

          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 block px-3">Copiloto IA</span>
          <nav className="space-y-1 mb-8">
            <NavItem href="/admin/voice" icon={<Mic size={18} />} label="Agente de Voz IA" active={pathname === '/admin/voice'} />
            <NavItem href="/admin/social" icon={<Share2 size={18} />} label="Redes Sociales" active={pathname === '/admin/social'} />
          </nav>
        </div>

        <div className="mt-auto px-4 py-4 border-t border-slate-800 bg-slate-900">
          <nav className="space-y-1 mb-4">
            <NavItem href="/admin/settings" icon={<Settings size={18} />} label="Ajustes" active={pathname === '/admin/settings'} />
          </nav>
          
          <div className="flex items-center px-3 py-3 mt-2 rounded-xl bg-slate-950 border border-slate-800 group hover:border-slate-700 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded bg-emerald-600 flex items-center justify-center text-white text-xs font-extrabold shadow-inner">
              AD
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Admin User</p>
              <p className="text-[11px] text-slate-400 truncate">Súper Administrador</p>
            </div>
            <LogOut size={16} className="text-slate-600 group-hover:text-red-400 transition-colors" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* HEADER SUPERIOR */}
        <header className="h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
          
          {/* Tenant Switcher */}
          <div className="relative">
            <button 
              onClick={() => setIsTenantMenuOpen(!isTenantMenuOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all group"
            >
              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-emerald-400">
                <LayoutDashboard size={14} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Entorno Activo</p>
                <p className="text-sm font-bold text-white leading-none mt-0.5">{activeTenant}</p>
              </div>
              <ChevronDown size={16} className={`text-slate-500 ml-2 transition-transform duration-200 ${isTenantMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTenantMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 py-2">
                <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">
                  Matriz
                </div>
                <TenantOption name="Grupo Basecamp" active={activeTenant === 'Grupo Basecamp'} onClick={() => { setActiveTenant('Grupo Basecamp'); setIsTenantMenuOpen(false); }} />
                
                <div className="px-3 py-2 mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">
                  Marcas Aliadas
                </div>
                <TenantOption name="Parapentitis" active={activeTenant === 'Parapentitis'} onClick={() => { setActiveTenant('Parapentitis'); setIsTenantMenuOpen(false); }} />
                <TenantOption name="Fisiozom" active={activeTenant === 'Fisiozom'} onClick={() => { setActiveTenant('Fisiozom'); setIsTenantMenuOpen(false); }} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 tracking-wide">Sistema Operativo</span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`group flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active 
          ? 'bg-emerald-500/10 text-emerald-400' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      <span className={`mr-3 transition-colors ${active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

function TenantOption({ name, active, onClick }: { name: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-800 transition-colors text-left"
    >
      <span className={`text-sm font-semibold ${active ? 'text-emerald-400' : 'text-slate-300'}`}>{name}</span>
      {active && <Check size={16} className="text-emerald-400" />}
    </button>
  );
}
