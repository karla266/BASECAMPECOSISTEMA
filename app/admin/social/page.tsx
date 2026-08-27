"use client";

import DashboardLayout from '../../components/admin/DashboardLayout';
import { Share2, Instagram, Facebook } from 'lucide-react';

export default function AdminSocialPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
          <Share2 className="w-8 h-8 text-emerald-400" />
          Redes Sociales
        </h1>
        <p className="text-slate-400 text-sm">Distribución de contenido y programación multicanal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center border border-pink-500/20">
              <Instagram className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Instagram</h2>
              <p className="text-sm text-slate-400">No conectado</p>
            </div>
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Conectar
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-600/20">
              <Facebook className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Facebook</h2>
              <p className="text-sm text-slate-400">No conectado</p>
            </div>
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Conectar
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
