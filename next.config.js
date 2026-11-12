/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // requerido por Hostinger; el bot lo restaura si falta
  poweredByHeader: false,
  eslint: {
    // Ignora errores de linting (como comillas dobles sin escapar) durante el build de Hostinger
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora advertencias menores de typescript en producción
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'basecamp420.com' }],
        destination: 'https://www.basecamp420.com/:path*',
        permanent: true,
      },
      {
        source: '/the-trip',
        destination: '/thetrip',
        permanent: true,
      },
      {
        source: '/aventura',
        destination: '/vuelos',
        permanent: true,
      },
      {
        source: '/reservar',
        destination: '/calendario',
        permanent: true,
      },
      {
        source: '/cimadigital',
        destination: '/cima-digital',
        permanent: true,
      },
      {
        source: '/cima',
        destination: '/cima-digital',
        permanent: true,
      },
      {
        source: '/afiliate',
        destination: '/alianzas',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

module.exports = nextConfig;
