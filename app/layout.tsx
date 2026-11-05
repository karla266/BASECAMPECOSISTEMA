export const dynamic = "force-dynamic";
import './globals.css';
import type { Metadata } from 'next';
import SalesChatbot from '../components/chat/SalesChatbot';
import WebMcpProvider from '../components/WebMcpProvider';
import ProveedorCarrito from '../components/ProveedorCarrito';

const grafoEntidad = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      name: 'Basecamp 420',
      '@id': 'https://www.basecamp420.com/#basecamp420',
      url: 'https://www.basecamp420.com',
      description:
        'Hub en Orizaba, Veracruz con experiencias de parapente tándem, cursos, renta de equipo y The Trip Smoke Shop.',
      email: 'contacto@basecamp420.com',
      telephone: '+522727258748',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+522727258748',
          contactType: 'customer service',
          areaServed: 'MX',
          availableLanguage: ['es', 'en'],
          email: 'contacto@basecamp420.com',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Oriente 27 y Norte 10',
        addressLocality: 'Orizaba',
        addressRegion: 'Veracruz',
        postalCode: '94300',
        addressCountry: 'MX',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 18.8516,
        longitude: -97.0996,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '10:00',
          closes: '19:00',
        },
      ],
      sameAs: [
        'https://wa.me/522727258748',
        'https://github.com/karla266/BASECAMP-420-sas-visual',
        'https://www.youtube.com/@basecamp420trepacerros',
        'https://www.basecamp420.com/ecosistema',
      ],
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.basecamp420.com/#organization',
      name: 'Basecamp 420',
      url: 'https://www.basecamp420.com',
      logo: 'https://www.basecamp420.com/favicon.ico',
      telephone: '+522727258748',
      email: 'contacto@basecamp420.com',
      sameAs: [
        'https://wa.me/522727258748',
        'https://www.youtube.com/@basecamp420trepacerros',
        'https://github.com/karla266/BASECAMP-420-sas-visual',
      ],
    },
    {
      '@type': 'Service',
      name: 'Parapente Tandem Fortín',
      provider: { '@id': 'https://www.basecamp420.com/#basecamp420' },
      areaServed: 'Fortín, Veracruz',
      serviceType: 'Aventura y turismo',
      url: 'https://www.basecamp420.com/adventure',
    },
    {
      '@type': 'Service',
      name: 'Renta de equipo',
      provider: { '@id': 'https://www.basecamp420.com/#basecamp420' },
      serviceType: 'Renta de equipo de montaña y camping',
      areaServed: 'Orizaba, Veracruz',
      url: 'https://www.basecamp420.com/renta',
    },
    {
      '@type': 'Product',
      name: 'The Trip Smoke Shop',
      brand: { '@type': 'Brand', name: 'Basecamp 420' },
      url: 'https://www.basecamp420.com/thetrip',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Dónde está Basecamp 420?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Basecamp 420 se ubica en Oriente 27 y Norte 10, Orizaba, Veracruz.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cómo contacto a Basecamp 420?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Puedes contactar por teléfono y WhatsApp al +52 272 725 8748 o por correo a contacto@basecamp420.com.',
          },
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.basecamp420.com'),
  alternates: { canonical: 'https://www.basecamp420.com' },
  title: {
    default: 'Basecamp 420 | Orizaba, Veracruz',
    template: '%s | Basecamp 420',
  },
  description: 'Hub central de Basecamp 420 con parapente tándem, The Trip Smoke Shop, renta de equipo y ecosistema digital.',
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
        <ProveedorCarrito>
          {children}
          <SalesChatbot />
        </ProveedorCarrito>
      </body>
    </html>
  );
}
