import type { Metadata } from 'next';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import UnifiedFooter from '@/components/layout/UnifiedFooter';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.basecamp420.com'),
  alternates: {
    canonical: './',
  },
  title: {
    default: 'Basecamp 420 | Parapente, Outdoor & The Trip en Orizaba',
    template: '%s | Basecamp 420',
  },
  openGraph: {
    url: 'https://www.basecamp420.com',
    siteName: 'Basecamp 420',
    locale: 'es_MX',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX">
      <body className="min-h-screen flex flex-col bg-neutral-950 text-white antialiased">
        <CartProvider>
          <UnifiedHeader />
          <main className="flex-1 mt-0 pt-0">{children}</main>
          <UnifiedFooter />
        </CartProvider>
      </body>
    </html>
  );
}
