/** @type {import('next').NextConfig} */
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
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
  images: {
    domains: ['picsum.photos'],
  },
};

module.exports = nextConfig;
