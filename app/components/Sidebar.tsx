'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Box, PhoneCall, Receipt, Settings, MountainSnow, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen sticky top-0 font-sans shadow-xl">
      <div className="h-16 flex items-center px-6 border-b border-slate-800/50 bg-slate-950">
        <MountainSnow className="w-5 h-5 text-white mr-3" />
        <span className="font-bold text-sm text-white tracking-widest uppercase">Basecamp 420</span>
      </div>
      
      <div className="px-4 py-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block px-2">Plataforma</span>
        <nav className="space-y-1">
          <NavItem href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" active={pathname === '/'} />
          <NavItem href="/tenants" icon={<Users size={18} />} label="Marcas Aliadas" active={pathname === '/tenants'} />
          <NavItem href="/inventory" icon={<Box size={18} />} label="Inventario Omnicanal" active={pathname === '/inventory'} />
          <NavItem href="/ai-copilot" icon={<PhoneCall size={18} />} label="Copiloto IA" active={pathname === '/ai-copilot'} />
          <NavItem href="/billing" icon={<Receipt size={18} />} label="Facturación" active={pathname === '/billing'} />
        </nav>
      </div>

      <div className="mt-auto px-4 py-4 border-t border-slate-800/50 bg-slate-900/50">
        <nav className="space-y-1 mb-4">
          <NavItem href="/settings" icon={<Settings size={18} />} label="Configuración" active={pathname === '/settings'} />
        </nav>
        
        {/* User Profile Widget */}
        <div className="flex items-center px-2 py-2 mt-2 rounded-lg bg-slate-950 border border-slate-800">
          <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
            AD
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">admin@basecamp.com</p>
          </div>
          <button className="text-slate-500 hover:text-slate-300 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active 
          ? 'bg-slate-800 text-white shadow-sm' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      <span className={`mr-3 transition-colors ${active ? 'text-emerald-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
