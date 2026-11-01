import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { NOMBRE_COOKIE_ROL, NOMBRE_COOKIE_SESION, verificarSesionAdmin } from './lib/adminSession';

function esLoginDelPanel(pathname: string) {
  return pathname === '/admin/login' || pathname.startsWith('/admin/login/');
}

function esRutaDelPanel(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function esIngresoPin(pathname: string) {
  return pathname === '/admin/acceso' || pathname.startsWith('/admin/acceso/');
}

function esCamara(pathname: string) {
  return pathname === '/admin/camara' || pathname.startsWith('/admin/camara/');
}

function inicioDelRol(rol: string) {
  return rol === 'operador_foto' ? '/admin/camara' : '/admin';
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

  if (url.pathname === '/') {
    const accept = (req.headers.get('accept') || '').toLowerCase();
    const respuesta = accept.includes('text/markdown')
      ? NextResponse.rewrite(new URL('/llms.txt', req.url))
      : NextResponse.next();
    respuesta.headers.set('Link', '</llms.txt>; rel="alternate"; type="text/markdown"');
    return respuesta;
  }

  if (url.pathname.startsWith('/api/admin')) {
    if (url.pathname.startsWith('/api/admin/login') || url.pathname === '/api/admin/salir') {
      return NextResponse.next();
    }
    const tokenApi = req.cookies.get(NOMBRE_COOKIE_ROL)?.value || req.cookies.get(NOMBRE_COOKIE_SESION)?.value;
    const sesionApi = await verificarSesionAdmin(tokenApi);
    if (sesionApi?.rol === 'operador_foto' && !url.pathname.startsWith('/api/admin/catalogo/foto')) {
      return NextResponse.json({ error: 'Este acceso solo abre la cámara.' }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (esLoginDelPanel(url.pathname) || esRutaDelPanel(url.pathname)) {
    const token = req.cookies.get(NOMBRE_COOKIE_ROL)?.value || req.cookies.get(NOMBRE_COOKIE_SESION)?.value;
    const sesion = await verificarSesionAdmin(token);
    if (esIngresoPin(url.pathname) && !sesion) {
      return NextResponse.next();
    }
    if (esLoginDelPanel(url.pathname)) {
      if (sesion) {
        return NextResponse.redirect(new URL(inicioDelRol(sesion.rol), req.url));
      }
      return NextResponse.rewrite(new URL(`/ingreso-admin${url.search}`, req.url));
    }
    if (!sesion) {
      const destino = new URL('/admin/acceso', req.url);
      destino.searchParams.set('siguiente', url.pathname);
      return NextResponse.redirect(destino);
    }
    if (sesion.rol === 'operador_foto' && !esCamara(url.pathname)) {
      return NextResponse.redirect(new URL('/admin/camara', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/admin/:path*',
  ],
};
