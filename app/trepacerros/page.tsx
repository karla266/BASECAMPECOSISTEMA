"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Play, Youtube, Award, Map } from 'lucide-react';

export default function TrepacerrosPage() {
  const videos = [
    { id: 1, title: 'Ascenso Pico de Orizaba - Documental', views: '124K', time: 'Hace 2 años', img: 'https://picsum.photos/seed/orizaba_vid/800/450' },
    { id: 2, title: 'Iztaccíhuatl Ruta de Portillos', views: '89K', time: 'Hace 1 año', img: 'https://picsum.photos/seed/izta/800/450' },
    { id: 3, title: 'Nevado de Toluca en Invierno', views: '210K', time: 'Hace 3 años', img: 'https://picsum.photos/seed/nevado/800/450' },
    { id: 4, title: 'Supervivencia en el Ajusco', views: '45K', time: 'Hace 6 meses', img: 'https://picsum.photos/seed/ajusco/800/450' },
    { id: 5, title: 'Parapente desde el Peñón', views: '150K', time: 'Hace 1 año', img: 'https://picsum.photos/seed/penon/800/450' },
    { id: 6, title: 'Equipo Basecamp Review', views: '32K', time: 'Hace 2 meses', img: 'https://picsum.photos/seed/equipo/800/450' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      <header className="border-b border-slate-900 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">Volver al Hub</span>
          </Link>
          <div className="flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            <span className="font-extrabold tracking-widest text-white uppercase">Club Trepacerros</span>
          </div>
        </div>
      </header>

      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center mb-6 overflow-hidden">
             <Image src="https://picsum.photos/seed/logo_trepa/200/200" alt="Logo" width={96} height={96} className="object-cover" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Club Trepacerros</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Más de 130 videos documentando las expediciones más extremas de México. La comunidad oficial de Basecamp 420.
          </p>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2 text-slate-300">
              <Youtube className="w-5 h-5 text-red-500" /> <span className="font-bold">50K+ Suscriptores</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Map className="w-5 h-5 text-emerald-500" /> <span className="font-bold">40+ Montañas</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Award className="w-5 h-5 text-amber-500" /> <span className="font-bold">Comunidad</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 w-full flex-grow">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Videos Recientes</h2>
          <button className="text-sm font-bold text-red-500 hover:text-red-400 uppercase tracking-wider transition-colors flex items-center gap-2">
            Ver Canal en YouTube
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(vid => (
            <div key={vid.id} className="group cursor-pointer">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 mb-4">
                <Image src={vid.img} alt={vid.title} fill className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                  14:20
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-1 group-hover:text-red-400 transition-colors">{vid.title}</h3>
              <p className="text-sm text-slate-500 font-medium">
                {vid.views} vistas • {vid.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
