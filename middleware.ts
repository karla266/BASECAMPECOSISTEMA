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

function esRutaPublica(pathname: string) {
  return !pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_next');
}

function permiteMarkdown(pathname: string) {
  return esRutaPublica(pathname) && !pathname.includes('.') && pathname !== '/favicon.ico';
}

function linkAgentHeader(pathAndQuery: string) {
  const safePath = encodeURIComponent(pathAndQuery || '/');
  return `</llms.txt>; rel="alternate"; type="text/plain", </api/markdown?path=${safePath}>; rel="alternate"; type="text/markdown", </.well-known/mcp/server-card.json>; rel="service"; type="application/json"`;
}

function adjuntarLinksAgent(respuesta: NextResponse, pathAndQuery: string) {
  respuesta.headers.set('Link', linkAgentHeader(pathAndQuery));
  return respuesta;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const pathAndQuery = `${url.pathname}${url.search || ''}`;

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
    return adjuntarLinksAgent(
      NextResponse.rewrite(new URL(`/_tenants/${tenant}${url.pathname}${url.search}`, req.url)),
      pathAndQuery
    );
  }

  if (req.method === 'GET' && permiteMarkdown(url.pathname)) {
    const accept = (req.headers.get('accept') || '').toLowerCase();
    if (accept.includes('text/markdown')) {
      return adjuntarLinksAgent(
        NextResponse.rewrite(new URL(`/api/markdown?path=${encodeURIComponent(pathAndQuery)}`, req.url)),
        pathAndQuery
      );
    }
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
        return adjuntarLinksAgent(NextResponse.redirect(new URL(inicioDelRol(sesion.rol), req.url)), pathAndQuery);
      }
      return adjuntarLinksAgent(NextResponse.rewrite(new URL(`/ingreso-admin${url.search}`, req.url)), pathAndQuery);
    }
    if (!sesion) {
      const destino = new URL('/admin/acceso', req.url);
      destino.searchParams.set('siguiente', url.pathname);
      return adjuntarLinksAgent(NextResponse.redirect(destino), pathAndQuery);
    }
    if (sesion.rol === 'operador_foto' && !esCamara(url.pathname)) {
      return adjuntarLinksAgent(NextResponse.redirect(new URL('/admin/camara', req.url)), pathAndQuery);
    }
  }

  const respuesta = NextResponse.next();
  if (esRutaPublica(url.pathname)) {
    return adjuntarLinksAgent(respuesta, pathAndQuery);
  }
  return respuesta;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/admin/:path*',
  ],
};
