// Gestion de l'absence de @nx/next dans certains environnements (comme Docker)
let withNx = (config) => config;
let composePlugins = (plugin) => plugin;

try {
  const nx = require('@nx/next');
  withNx = nx.withNx;
  composePlugins = nx.composePlugins;
} catch (error) {
  console.warn("@nx/next n'est pas disponible, utilisation d'une configuration simple");
}

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

// Exporter la configuration avec ou sans Nx
module.exports = process.env.USE_NX ? composePlugins(withNx)(nextConfig) : nextConfig;
