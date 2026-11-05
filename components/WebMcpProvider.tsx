'use client';

import { useEffect } from 'react';

type HerramientaWebMcp = {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, never>;
  };
  execute: () => Promise<{
    nombre: string;
    telefono: string;
    direccion: string;
    whatsapp: string;
  }>;
};

type ModelContext = {
  registerTool?: (herramienta: HerramientaWebMcp) => void;
};

function contextoModelo(): ModelContext | undefined {
  if (typeof navigator !== 'undefined' && 'modelContext' in navigator) {
    return (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
  }
  if (typeof document !== 'undefined' && 'modelContext' in document) {
    return (document as Document & { modelContext?: ModelContext }).modelContext;
  }
  if (typeof window !== 'undefined' && 'modelContext' in window) {
    return (window as Window & { modelContext?: ModelContext }).modelContext;
  }
  return undefined;
}

export default function WebMcpProvider() {
  useEffect(() => {
    try {
      contextoModelo()?.registerTool?.({
        name: 'contacto_basecamp_420',
        description: 'Devuelve el teléfono, la dirección y el WhatsApp de Basecamp 420 en Orizaba.',
        inputSchema: { type: 'object', properties: {} },
        execute: async () => ({
          nombre: 'Basecamp 420',
          telefono: '+522727258748',
          direccion: 'Oriente 27 y Norte 10, Orizaba, Veracruz',
          whatsapp: 'https://wa.me/522727258748?text=Hola%20Basecamp%20420,%20deseo%20m%C3%A1s%20informaci%C3%B3n',
        }),
      });
    } catch {
      // El navegador no expone WebMCP.
    }
  }, []);

  return null;
}
