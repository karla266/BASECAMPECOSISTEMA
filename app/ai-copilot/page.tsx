import Image from 'next/image';
import { CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function AICopilotPage() {
  const generatedImages = [
    { id: 1, title: 'Outdoor Adventure', url: 'https://picsum.photos/seed/adventure/800/600', badge: 'Alta Conversión' },
    { id: 2, title: 'Mountain Basecamp', url: 'https://picsum.photos/seed/mountain/800/600', badge: 'A/B Testing' },
    { id: 3, title: 'Zen Smokeshop', url: 'https://picsum.photos/seed/zen/800/600', badge: 'Trending' },
    { id: 4, title: 'Digital Agency', url: 'https://picsum.photos/seed/digital/800/600', badge: 'Nuevo' },
    { id: 5, title: 'High Altitude', url: 'https://picsum.photos/seed/altitude/800/600', badge: 'CTR 8.5%' },
    { id: 6, title: 'B2B SaaS Portal', url: 'https://picsum.photos/seed/saas/800/600', badge: 'Orgánico' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-full">
      {/* Header section en tonos verdes (Emerald) */}
      <div className="mb-8 border-b border-emerald-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            Copiloto IA: Galería de Campañas
          </h1>
          <p className="text-emerald-700 text-sm mt-2 font-medium">
            Selecciona una imagen llamativa generada por DALL-E 3 para tu próxima pauta multicanal.
          </p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm shadow-emerald-200 transition-all flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Generar Nueva Imagen
        </button>
      </div>

      {/* Grid de tarjetas para selección */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedImages.map((img) => (
          <div 
            key={img.id} 
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 border border-emerald-100 cursor-pointer"
          >
            {/* Contenedor de Imagen */}
            <div className="aspect-[4/3] relative w-full overflow-hidden bg-emerald-50">
              <Image 
                src={img.url} 
                alt={img.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {/* Overlay en Hover */}
              <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/20 transition-colors duration-300" />
              
              {/* Badge Flotante */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  {img.badge}
                </span>
              </div>
            </div>
            
            {/* Detalles de la Tarjeta */}
            <div className="p-5">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-emerald-950 text-lg">{img.title}</h3>
                
                {/* Indicador de Selección (Checkbox animado) */}
                <div className="w-8 h-8 rounded-full border-2 border-emerald-200 group-hover:border-emerald-500 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-transparent group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
              <p className="text-emerald-600/80 text-sm mt-1 font-medium">Renderizado en calidad HD (1024x1024)</p>
            </div>

            {/* Borde activo en hover simulando selección */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-500 rounded-2xl pointer-events-none transition-colors duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
