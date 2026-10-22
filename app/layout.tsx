export const dynamic = "force-dynamic";
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
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
      <body className="bg-slate-950 text-slate-200 min-h-screen font-sans selection:bg-emerald-500/30">
        {children}
      </body>
    </html>
  );
}
