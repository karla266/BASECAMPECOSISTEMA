import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Remove port if present
  const currentHost = hostname.split(':')[0].replace('www.', '');

  // Main domain or local dev
  const isMainDomain = currentHost === 'basecamp420.com' || currentHost === 'localhost';

  if (!isMainDomain) {
    // Determine the tenant based on the subdomain or custom domain
    const tenant = currentHost.includes('.basecamp420.com') 
      ? currentHost.replace('.basecamp420.com', '') 
      : currentHost;

    // Rewrite to the dynamic tenant route preserving the visible URL
    return NextResponse.rewrite(new URL(`/_tenants/${tenant}${url.pathname}${url.search}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
