import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verificarSesionAdmin } from './lib/adminSession';

function esLoginDelPanel(pathname: string) {
  return pathname === '/admin/login' || pathname.startsWith('/admin/login/');
}

function esRutaDelPanel(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Remove port if present
  const currentHost = hostname.split(':')[0].replace('www.', '');

  // Main domain or local dev
  const isMainDomain =
    currentHost === 'basecamp420.com' ||
    currentHost === 'localhost' ||
    currentHost === '127.0.0.1';

  if (!isMainDomain) {
    // Determine the tenant based on the subdomain or custom domain
    const tenant = currentHost.includes('.basecamp420.com') 
      ? currentHost.replace('.basecamp420.com', '') 
      : currentHost;

    // Rewrite to the dynamic tenant route preserving the visible URL
    return NextResponse.rewrite(new URL(`/_tenants/${tenant}${url.pathname}${url.search}`, req.url));
  }

  if (esLoginDelPanel(url.pathname) || esRutaDelPanel(url.pathname)) {
    const sesion = await verificarSesionAdmin(req.cookies.get('bc_admin_sesion')?.value);
    if (esLoginDelPanel(url.pathname)) {
      if (sesion) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.rewrite(new URL(`/ingreso-admin${url.search}`, req.url));
    }
    if (!sesion) {
      const destino = new URL('/admin/login', req.url);
      destino.searchParams.set('siguiente', url.pathname);
      return NextResponse.redirect(destino);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
