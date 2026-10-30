export const dynamic = "force-dynamic";
import './globals.css';
import type { Metadata } from 'next';
import WebMcpProvider from '../components/WebMcpProvider';

const grafoEntidad = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      name: 'Basecamp 420',
      telephone: '+522727258748',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Oriente 27 y Norte 10',
        addressLocality: 'Orizaba',
        addressRegion: 'Veracruz',
        addressCountry: 'MX',
      },
      sameAs: [
        'https://wa.me/522727258748',
        'https://github.com/karla266/BASECAMP-420-sas-visual',
      ],
    },
    {
      '@type': 'Service',
      name: 'Parapente Tandem Fortín',
      provider: { '@type': 'LocalBusiness', name: 'Basecamp 420' },
      areaServed: 'Fortín, Veracruz',
    },
    {
      '@type': 'Service',
      name: 'Renta de equipo',
      provider: { '@type': 'LocalBusiness', name: 'Basecamp 420' },
    },
    {
      '@type': 'Product',
      name: 'The Trip Smoke Shop',
      brand: { '@type': 'Brand', name: 'Basecamp 420' },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.basecamp420.com'),
  alternates: { canonical: 'https://www.basecamp420.com' },
  title: 'Basecamp 420 | Premium Dark',
  description: 'Hub Central Matriz con e-commerce y plataforma SaaS Multi-Tenant',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(grafoEntidad).replace(/</g, '\\u003c') }}
        />
      </head>
      <body className="bg-slate-950 text-slate-200 min-h-screen font-sans selection:bg-emerald-500/30">
        <WebMcpProvider />
        {children}
      </body>
    </html>
  );
}
