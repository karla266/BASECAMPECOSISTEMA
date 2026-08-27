import { Bell, Search, Command } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center w-full max-w-md">
        <div className="relative w-full group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          </span>
          <input 
            type="text" 
            placeholder="Buscar tenants, SKUs, clientes..." 
            className="w-full bg-slate-100/50 border border-slate-200 rounded-lg pl-10 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all shadow-sm" 
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 border border-slate-200 bg-white rounded px-1.5 py-0.5">
              <Command className="w-3 h-3" /> K
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-5">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
        </button>
      </div>
    </header>
  );
}
