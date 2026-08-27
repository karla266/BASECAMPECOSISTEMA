"use client";

import Link from 'next/link';
import Image from 'next/image';
import { MountainSnow, ArrowLeft, Calendar, MapPin, Star } from 'lucide-react';

export default function AdventurePage() {
  const tours = [
    { id: 1, title: 'Ascenso Pico de Orizaba', duration: '2 Días', level: 'Extremo', price: '$4,500 MXN', img: 'https://picsum.photos/seed/orizaba/800/600' },
    { id: 2, title: 'Vuelo en Parapente Valle de Bravo', duration: 'Medio Día', level: 'Principiante', price: '$1,800 MXN', img: 'https://picsum.photos/seed/parapente/800/600' },
    { id: 3, title: 'Ruta de los Volcanes (MTB)', duration: '1 Día', level: 'Intermedio', price: '$1,200 MXN', img: 'https://picsum.photos/seed/mtb/800/600' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">Volver al Hub</span>
          </Link>
          <div className="flex items-center gap-2">
            <MountainSnow className="w-6 h-6 text-emerald-400" />
            <span className="font-extrabold tracking-widest text-white">ADVENTURE</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center border-b border-slate-800 overflow-hidden">
        <Image src="https://picsum.photos/seed/adventure_hero/1920/1080" alt="Adventure Hero" fill className="object-cover opacity-30 grayscale" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            Expediciones <span className="text-emerald-400">Extremas</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Alta montaña, vuelos en parapente y tours todoterreno diseñados para los verdaderos exploradores.
          </p>
        </div>
      </div>

      {/* Tours Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <h2 className="text-2xl font-bold text-white mb-10 border-b border-slate-800 pb-4">Próximas Salidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map(tour => (
            <div key={tour.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-emerald-500/50 transition-colors">
              <div className="aspect-[4/3] relative">
                <Image src={tour.img} alt={tour.title} fill className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" referrerPolicy="no-referrer" />
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  {tour.level}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{tour.title}</h3>
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <Calendar className="w-4 h-4" /> {tour.duration}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <MapPin className="w-4 h-4" /> Varias Locaciones
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-white">{tour.price}</span>
                  <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg">
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
