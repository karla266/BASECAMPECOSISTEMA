/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'basecamp420.com' }],
        destination: 'https://www.basecamp420.com/:path*',
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

export default nextConfig;
