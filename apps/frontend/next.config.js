/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  compiler: {
    emotion: true,
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000, // Vérifier les changements toutes les secondes
      aggregateTimeout: 300, // Attendre 300ms après un changement avant de reconstruire
    };

    // Résoudre le module @notia/shared
    config.resolve.alias['@notia/shared'] = path.resolve(__dirname, '../../libs/shared/src');

    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3001/api/:path*',
      },
    ];
  },
  images: {
    domains: ['picsum.photos'],
  },
};

module.exports = nextConfig;
