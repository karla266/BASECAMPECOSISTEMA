"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingBag, ArrowLeft, Plus, Check } from 'lucide-react';

export default function TheTripPage() {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  const products = [
    { id: 'SKU-001', category: 'bongs', title: 'Bong Beaker 12" Pyrex', price: 850, img: 'https://picsum.photos/seed/bong/800/800' },
    { id: 'SKU-002', category: 'parafernalia', title: 'Grinder Aluminio 4 Piezas', price: 350, img: 'https://picsum.photos/seed/grinder/800/800' },
    { id: 'SKU-003', category: 'pipas_pyrex', title: 'Pipa Spoon Clásica', price: 250, img: 'https://picsum.photos/seed/pipa/800/800' }
  ];

  const handleCheckout = async (product: any) => {
    setLoading(true);
    setAdded(product.id);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            sku: product.id,
            title: product.title,
            category: product.category,
            quantity: 1,
            price: product.price
          }]
        })
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(data.error || 'Error procesando el pago');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setLoading(false);
      setAdded(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f13] text-slate-200">
      {/* Header */}
      <header className="border-b border-[#1f1f26] bg-[#0f0f13]/90 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">Volver al Hub</span>
          </Link>
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-fuchsia-500" />
            <span className="font-extrabold tracking-widest text-white uppercase">The Trip Smokeshop</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-[30vh] min-h-[250px] flex items-center justify-center border-b border-[#1f1f26] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/30 to-[#0f0f13] z-0" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Parafernalia <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">Premium</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Piezas de pyrex, grinders y accesorios legales de la más alta calidad.
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 py-16 w-full flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-[#15151a] border border-[#1f1f26] rounded-2xl overflow-hidden group hover:border-fuchsia-500/50 transition-colors">
              <div className="aspect-square relative bg-[#0a0a0c] p-6">
                <Image src={product.img} alt={product.title} fill className="object-contain p-6 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" referrerPolicy="no-referrer" />
              </div>
              <div className="p-6 border-t border-[#1f1f26]">
                <h3 className="text-lg font-bold text-white mb-1">{product.title}</h3>
                <span className="block text-xs text-slate-500 uppercase tracking-widest font-mono mb-4">{product.id}</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-white">${product.price} <span className="text-sm font-semibold text-slate-500">MXN</span></span>
                  <button 
                    onClick={() => handleCheckout(product)}
                    disabled={loading}
                    className="w-10 h-10 rounded-full bg-[#1f1f26] hover:bg-fuchsia-500 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {added === product.id ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
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
