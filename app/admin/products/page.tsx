"use client";

import { Package, Search, Filter, Plus } from 'lucide-react';

export default function AdminProductsPage() {
  return (
    <>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-400" />
            Catálogo de Productos
          </h1>
          <p className="text-slate-400 text-sm">Gestión de inventario y sincronización con SICAR y Mercado Libre.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por SKU, nombre o categoría..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500 transition-colors"
          />
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-12 text-center">
          <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No hay productos seleccionados</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">El catálogo actual está vacío. Importa un archivo CSV o crea un producto manualmente.</p>
        </div>
      </div>
    </>
  );
}
