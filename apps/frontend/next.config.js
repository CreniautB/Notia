const { composePlugins, withNx } = require('@nx/next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration de base
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Désactiver les vérifications pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Support des packages
  transpilePackages: ['three'],
  
  // Configuration des images
  images: {
    domains: ['notias.fr', '217.154.16.57'],
    unoptimized: true, // Désactive l'optimisation des images pour éviter les problèmes
  },

  // Configuration des redirections
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:3001';
    console.log(`API URL configurée: ${apiUrl}`);
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = composePlugins(withNx)(nextConfig);
