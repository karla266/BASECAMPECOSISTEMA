/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.basecamp420.com/api/:path*',
      },
    ]
  },
}
module.exports = nextConfig
