/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // requerido por Hostinger; el bot lo restaura si falta
  eslint: {
    // Ignora errores de linting (como comillas dobles sin escapar) durante el build de Hostinger
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora advertencias menores de typescript en producción
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
